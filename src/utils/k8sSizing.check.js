// Sanity checks for src/utils/k8sSizing.js. Run: node src/utils/k8sSizing.check.js
import {
  awsMaxPods,
  awsPodLimit,
  awsUsableIps,
  calculateAws,
  calculateGcp,
  effectivePods,
  findAwsInstance,
  gkePodBlock,
  gkePodRangePrefix,
  gkeServicesPrefix,
  monthlyCost,
  nodeCounts,
  parseCidr,
} from "./k8sSizing.js";
import { awsTerraform, gcpTerraform, karpenterYaml } from "./k8sCodegen.js";

let failed = 0;
function check(name, actual, expected) {
  const ok = Object.is(actual, expected);
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : ` (got ${actual}, expected ${expected})`}`);
}

const i = findAwsInstance;

// AWS VPC CNI max pods, prefix delegation off
check("t3.medium maxPods (off) = 17", awsMaxPods(i("t3.medium")), 17);
check("t3.large maxPods (off) = 35", awsMaxPods(i("t3.large")), 35);
check("m6i.large maxPods (off) = 29", awsMaxPods(i("m6i.large")), 29);
check("m6i.xlarge maxPods (off) = 58", awsMaxPods(i("m6i.xlarge")), 58);
check("m6i.4xlarge maxPods (off) = 234", awsMaxPods(i("m6i.4xlarge")), 234);

// Prefix delegation on, before the kubelet cap
check("t3.medium maxPods (PD) = 242", awsMaxPods({ ...i("t3.medium"), prefixDelegation: true }), 242);
check("m6i.xlarge maxPods (PD) = 898", awsMaxPods({ ...i("m6i.xlarge"), prefixDelegation: true }), 898);

// Kubelet cap
const pd = awsPodLimit(i("m6i.xlarge"), { prefixDelegation: true });
check("PD default kubelet cap = 110", pd.limit, 110);
check("PD can raise cap", pd.canRaiseCap, true);
check("PD raised cap = 250", awsPodLimit(i("m6i.xlarge"), { prefixDelegation: true, raiseCap: true }).limit, 250);
check("no cap raise below 110 (t3.medium off)", awsPodLimit(i("t3.medium"), { raiseCap: true }).limit, 17);
check("t3.medium off cannot raise cap", awsPodLimit(i("t3.medium")).canRaiseCap, false);

// Effective pods = min(CPU, memory, CNI) and the bottleneck
const base = { vcpu: 4, ramGiB: 16, overheadPct: 0 };
const cpuCase = effectivePods({ ...base, cpuPerPodM: 1000, memPerPodMiB: 256, podLimit: 58 });
check("CPU-bound effective = 4", cpuCase.effective, 4);
check("CPU-bound bottleneck", cpuCase.bottleneck, "cpu");
const memCase = effectivePods({ ...base, cpuPerPodM: 50, memPerPodMiB: 4096, podLimit: 58 });
check("memory-bound effective = 4", memCase.effective, 4);
check("memory-bound bottleneck", memCase.bottleneck, "memory");
const cniCase = effectivePods({ ...base, cpuPerPodM: 10, memPerPodMiB: 32, podLimit: 58 });
check("CNI-bound effective = 58", cniCase.effective, 58);
check("CNI-bound bottleneck", cniCase.bottleneck, "pods");
const overhead = effectivePods({ vcpu: 4, ramGiB: 16, overheadPct: 15, cpuPerPodM: 250, memPerPodMiB: 512, podLimit: 58 });
check("15% overhead m6i.xlarge CPU fit = 13", overhead.podsFromCpu, 13);
check("15% overhead m6i.xlarge mem fit = 27", overhead.podsFromMem, 27);

// Nodes
const n = nodeCounts({ desiredPods: 120, effectivePerNode: 13, surgePct: 25, azCount: 3 });
check("steady nodes = ceil(120/13) = 10", n.steady, 10);
check("nodes with surge = ceil(10*1.25) = 13", n.withSurge, 13);
check("AZ floor applied", nodeCounts({ desiredPods: 5, effectivePerNode: 50, surgePct: 0, azCount: 3 }).withSurge, 3);
check("0 effective pods is invalid", nodeCounts({ desiredPods: 5, effectivePerNode: 0, surgePct: 0, azCount: 3 }).valid, false);

// Cost split
const c = monthlyCost({ nodes: 13, spotRatioPct: 50, odHourly: 0.192, spotHourly: 0.0845, controlPlaneHourly: 0.1 });
check("spot nodes = round(13*0.5) = 7", c.spotNodes, 7);
check("on-demand nodes = 6", c.odNodes, 6);

// AWS usable IPs
check("AWS /24 usable = 251", awsUsableIps(24), 251);
check("AWS /20 usable = 4091", awsUsableIps(20), 4091);
check("parseCidr rejects garbage", parseCidr("10.0.0/16"), null);
check("parseCidr 10.0.0.0/16", parseCidr("10.0.0.0/16").cidr, "10.0.0.0/16");

// Secondary CIDR flagged when primary subnets cannot fit
const awsInput = {
  instanceType: "m6i.xlarge",
  desiredPods: 120,
  cpuPerPodM: 250,
  memPerPodMiB: 512,
  overheadPct: 15,
  azCount: 3,
  spotRatioPct: 50,
  surgePct: 25,
  prefixDelegation: false,
  raiseCap: false,
  customNetworking: false,
  vpcCidr: "10.0.0.0/16",
  subnetPrefix: "auto",
  secondaryCidr: "100.64.0.0/16",
};
const small = calculateAws(awsInput);
check("default AWS plan fits primary", small.secondaryRequired, false);
check("default AWS auto prefix = /24", small.cidr.primary.prefix, 24);
// /20 VPC → at most /22 per AZ (1019 usable); 1500 pods need ~49 nodes/AZ × 29 IPs.
const big = calculateAws({ ...awsInput, desiredPods: 1500, vpcCidr: "10.0.0.0/20" });
check("large plan requires secondary CIDR", big.secondaryRequired, true);
check("large plan reason = capacity", big.secondaryReason, "capacity");
check("large plan secondary fits", big.cidr.secondary.fits, true);
check("manual /24 too small flags secondary", calculateAws({ ...awsInput, desiredPods: 3000, subnetPrefix: 24 }).secondaryRequired, true);
check("custom networking toggle requires secondary", calculateAws({ ...awsInput, customNetworking: true }).secondaryReason, "custom");
check("custom networking: primary ENI hosts no pods (m6i.xlarge = 44)", awsMaxPods({ ...i("m6i.xlarge"), customNetworking: true }), 44);

// GKE pod blocks
const blocks = [[110, 256, 24], [64, 128, 25], [32, 64, 26], [16, 32, 27], [8, 16, 28], [256, 512, 23]];
for (const [mp, ips, prefix] of blocks) {
  const b = gkePodBlock(mp);
  check(`GKE ${mp} max pods → ${ips} IPs /${prefix}`, `${b.ips}/${b.prefix}`, `${ips}/${prefix}`);
}

// GKE pod range big enough for nodesWithSurge * block
for (const [nodes, mp] of [[13, 110], [40, 64], [100, 32], [1, 8], [500, 110]]) {
  const p = gkePodRangePrefix(nodes, mp);
  const size = 2 ** (32 - p);
  const need = nodes * gkePodBlock(mp).ips;
  check(`GKE pod range /${p} holds ${nodes}×${gkePodBlock(mp).ips} (tight)`, size >= need && size / 2 < need, true);
}

// GKE services
check("GKE 256 services → /24", gkeServicesPrefix(256), 24);
check("GKE 1024 services → /22", gkeServicesPrefix(1024), 22);
check("GKE 4096 services → /20", gkeServicesPrefix(4096), 20);

// GKE full plan + overlap detection
const gcpInput = {
  machineType: "e2-standard-4",
  desiredPods: 120,
  cpuPerPodM: 250,
  memPerPodMiB: 512,
  overheadPct: 15,
  azCount: 3,
  spotRatioPct: 50,
  surgePct: 25,
  maxPodsPerNode: 110,
  servicesCount: 1024,
  nodeBase: "10.0.0.0",
  podBase: "10.4.0.0",
  servicesBase: "10.8.0.0",
  masterCidr: "172.16.0.0/28",
};
const g = calculateGcp(gcpInput);
check("GKE default plan has no issues", g.ok, true);
check("GKE default pod range = 10.4.0.0/20", g.podRange.cidr, "10.4.0.0/20");
check("GKE overlap detected", calculateGcp({ ...gcpInput, podBase: "10.0.0.0" }).issues.some((x) => x.type === "overlap"), true);

// Code generation smoke checks
check("Karpenter YAML has NodePool", karpenterYaml(small, { clusterName: "demo", spotRatioPct: 50 }).includes("kind: NodePool"), true);
check("Karpenter spot-only", karpenterYaml(small, { clusterName: "demo", spotRatioPct: 100 }).includes('values: ["spot"]'), true);

// Karpenter instance families
const ky = (families) => karpenterYaml(small, { clusterName: "demo", spotRatioPct: 50, families });
const multi = ky(["m6i", "c6i", "r6i"]);
check("multi-family: has instance-family", multi.includes("key: karpenter.k8s.aws/instance-family"), true);
check("multi-family: lists families sorted", multi.includes('values: ["c6i", "m6i", "r6i"]'), true);
check("multi-family: no instance-type pin", multi.includes("node.kubernetes.io/instance-type"), false);
check("multi-family: no generation", multi.includes("instance-generation"), false);
check("multi-family: size = xlarge", multi.includes('key: karpenter.k8s.aws/instance-size\n          operator: In\n          values: ["xlarge"]'), true);
check("multi-family: NodePool name general", multi.includes("name: general\n"), true);
const one = ky(["m6i"]);
check("single family: instance-family m6i", one.includes('key: karpenter.k8s.aws/instance-family\n          operator: In\n          values: ["m6i"]'), true);
check("single family: size xlarge", one.includes('values: ["xlarge"]'), true);
check("single family: generation 6", one.includes('key: karpenter.k8s.aws/instance-generation\n          operator: In\n          values: ["6"]'), true);
check("single family: NodePool name general-m6i", one.includes("name: general-m6i"), true);
check("default (no families) = reference family", ky(undefined).includes('values: ["m6i"]'), true);
check("empty families falls back to reference", ky([]).includes('values: ["m6i"]'), true);
const mixed = ky(["m7g", "m6i"]);
check("mixed arch: both arches", mixed.includes('key: kubernetes.io/arch\n          operator: In\n          values: ["amd64", "arm64"]'), true);
check("mixed arch: multi-arch comment", mixed.includes("multi-arch"), true);
check("single arch amd64 only", one.includes('key: kubernetes.io/arch\n          operator: In\n          values: ["amd64"]'), true);
const arm = ky(["m7g"]);
check("single arch arm64 only", arm.includes('key: kubernetes.io/arch\n          operator: In\n          values: ["arm64"]'), true);
check("arm64 generation 7", arm.includes('values: ["7"]'), true);
check("t3 generation 3", ky(["t3"]).includes('instance-generation\n          operator: In\n          values: ["3"]'), true);
check("limits from reference (13 × 4 vCPU)", multi.includes('cpu: "52"'), true);
check("unknown family ignored", ky(["zz9", "c6i"]).includes('values: ["c6i"]'), true);
check("AWS HCL includes secondary association", awsTerraform(big, { clusterName: "demo" }).includes("aws_vpc_ipv4_cidr_block_association"), true);
check("AWS HCL omits secondary when not needed", awsTerraform(small, { clusterName: "demo" }).includes("aws_vpc_ipv4_cidr_block_association"), false);
check("GKE HCL has ip_allocation_policy", gcpTerraform(g, { clusterName: "demo", spotRatioPct: 50 }).includes("cluster_secondary_range_name"), true);

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
