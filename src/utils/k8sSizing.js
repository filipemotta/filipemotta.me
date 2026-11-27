// Kubernetes sizing & CIDR math for the /tools calculator.
// Pure functions only (no React) so they can be checked with plain `node`:
//   node src/utils/k8sSizing.check.js

/* ------------------------------------------------------------------ */
/* Catalogs and reference prices                                       */
/* ------------------------------------------------------------------ */

export const HOURS_PER_MONTH = 730;
export const EKS_CONTROL_PLANE_HOURLY = 0.1;
export const GKE_MANAGEMENT_HOURLY = 0.1;
export const AWS_REGION = "us-east-1";
export const GCP_REGION = "us-central1";
export const AWS_ZONES = ["us-east-1a", "us-east-1b", "us-east-1c"];
export const GCP_ZONES = ["us-central1-a", "us-central1-b", "us-central1-c"];

/**
 * EC2 instance types: vCPU, memory, max ENIs and IPv4 addresses per ENI from
 * the EC2 docs. Prices are us-east-1 Linux On-Demand list prices and a
 * conservative typical Spot price (USD/hour). Reference only, not a quote.
 */
export const AWS_INSTANCES = [
  { type: "t3.medium", family: "t3", arch: "amd64", vcpu: 2, ramGiB: 4, enis: 3, ipsPerEni: 6, od: 0.0416, spot: 0.0166 },
  { type: "t3.large", family: "t3", arch: "amd64", vcpu: 2, ramGiB: 8, enis: 3, ipsPerEni: 12, od: 0.0832, spot: 0.0333 },
  { type: "m6i.large", family: "m6i", arch: "amd64", vcpu: 2, ramGiB: 8, enis: 3, ipsPerEni: 10, od: 0.096, spot: 0.0422 },
  { type: "m6i.xlarge", family: "m6i", arch: "amd64", vcpu: 4, ramGiB: 16, enis: 4, ipsPerEni: 15, od: 0.192, spot: 0.0845 },
  { type: "m6i.2xlarge", family: "m6i", arch: "amd64", vcpu: 8, ramGiB: 32, enis: 4, ipsPerEni: 15, od: 0.384, spot: 0.169 },
  { type: "m6i.4xlarge", family: "m6i", arch: "amd64", vcpu: 16, ramGiB: 64, enis: 8, ipsPerEni: 30, od: 0.768, spot: 0.338 },
  { type: "c6i.xlarge", family: "c6i", arch: "amd64", vcpu: 4, ramGiB: 8, enis: 4, ipsPerEni: 15, od: 0.17, spot: 0.0748 },
  { type: "c6i.2xlarge", family: "c6i", arch: "amd64", vcpu: 8, ramGiB: 16, enis: 4, ipsPerEni: 15, od: 0.34, spot: 0.1496 },
  { type: "r6i.xlarge", family: "r6i", arch: "amd64", vcpu: 4, ramGiB: 32, enis: 4, ipsPerEni: 15, od: 0.252, spot: 0.1109 },
  { type: "r6i.2xlarge", family: "r6i", arch: "amd64", vcpu: 8, ramGiB: 64, enis: 4, ipsPerEni: 15, od: 0.504, spot: 0.2218 },
  { type: "m7g.xlarge", family: "m7g", arch: "arm64", vcpu: 4, ramGiB: 16, enis: 4, ipsPerEni: 15, od: 0.1632, spot: 0.0718 },
  { type: "m7g.2xlarge", family: "m7g", arch: "arm64", vcpu: 8, ramGiB: 32, enis: 4, ipsPerEni: 15, od: 0.3264, spot: 0.1436 },
];

/**
 * GCE machine types (us-central1). On-Demand list price and a conservative
 * typical Spot price (USD/hour). Reference only, not a quote.
 */
export const GCP_MACHINES = [
  { type: "e2-standard-2", family: "e2", arch: "amd64", vcpu: 2, ramGiB: 8, od: 0.067, spot: 0.0221 },
  { type: "e2-standard-4", family: "e2", arch: "amd64", vcpu: 4, ramGiB: 16, od: 0.134, spot: 0.0442 },
  { type: "e2-standard-8", family: "e2", arch: "amd64", vcpu: 8, ramGiB: 32, od: 0.268, spot: 0.0884 },
  { type: "n2-standard-4", family: "n2", arch: "amd64", vcpu: 4, ramGiB: 16, od: 0.1942, spot: 0.0641 },
  { type: "n2-standard-8", family: "n2", arch: "amd64", vcpu: 8, ramGiB: 32, od: 0.3885, spot: 0.1282 },
  { type: "n2-standard-16", family: "n2", arch: "amd64", vcpu: 16, ramGiB: 64, od: 0.7769, spot: 0.2564 },
  { type: "c3-standard-4", family: "c3", arch: "amd64", vcpu: 4, ramGiB: 16, od: 0.2089, spot: 0.0689 },
  { type: "c3-standard-8", family: "c3", arch: "amd64", vcpu: 8, ramGiB: 32, od: 0.4178, spot: 0.1379 },
  { type: "n2d-standard-8", family: "n2d", arch: "amd64", vcpu: 8, ramGiB: 32, od: 0.338, spot: 0.1115 },
  { type: "t2a-standard-4", family: "t2a", arch: "arm64", vcpu: 4, ramGiB: 16, od: 0.154, spot: 0.0508 },
];

export const GKE_MAX_PODS_OPTIONS = [8, 16, 32, 64, 110, 256];
export const GKE_SERVICES_OPTIONS = [
  { services: 256, prefix: 24 },
  { services: 1024, prefix: 22 },
  { services: 4096, prefix: 20 },
];
export const AWS_SUBNET_PREFIXES = [24, 23, 22, 21, 20, 19];
export const KUBELET_DEFAULT_CAP = 110;
export const KUBELET_RAISED_CAP = 250;
/** Headroom on node-only primary subnets when pods live in a secondary CIDR. */
export const NODE_SUBNET_HEADROOM = 0.25;

export const findAwsInstance = (type) => AWS_INSTANCES.find((i) => i.type === type) || AWS_INSTANCES[3];
export const findGcpMachine = (type) => GCP_MACHINES.find((m) => m.type === type) || GCP_MACHINES[1];

/* ------------------------------------------------------------------ */
/* IPv4 helpers                                                        */
/* ------------------------------------------------------------------ */

export function ipToInt(ip) {
  const parts = String(ip).trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n;
}

export function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export const blockSize = (prefix) => 2 ** (32 - prefix);

/** Parses "a.b.c.d/p". Returns null when invalid. `aligned` is false when host bits are set. */
export function parseCidr(str) {
  const m = /^\s*(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})\s*$/.exec(String(str || ""));
  if (!m) return null;
  const ip = ipToInt(m[1]);
  const prefix = Number(m[2]);
  if (ip === null || prefix < 0 || prefix > 32) return null;
  const size = blockSize(prefix);
  const network = ip - (ip % size);
  return { ip, prefix, size, network, aligned: network === ip, cidr: `${intToIp(network)}/${prefix}` };
}

/** Builds a block from a base address (prefix in the string, if any, is ignored). */
export function blockFromBase(base, prefix) {
  const addr = String(base || "").trim().split("/")[0];
  const ip = ipToInt(addr);
  if (ip === null) return null;
  const size = blockSize(prefix);
  const network = ip - (ip % size);
  return { ip, prefix, size, network, aligned: network === ip, cidr: `${intToIp(network)}/${prefix}` };
}

export const cidrOverlaps = (a, b) => a.network < b.network + b.size && b.network < a.network + a.size;

/** Usable IPs in an AWS subnet (AWS reserves 5 per subnet). */
export const awsUsableIps = (prefix) => Math.max(0, blockSize(prefix) - 5);
/** Usable IPs in a GCP subnet primary range (GCP reserves 4 per range). */
export const gcpUsableIps = (prefix) => Math.max(0, blockSize(prefix) - 4);

/** Smallest prefix length (largest block) needed to hold `count` raw addresses. */
export function prefixForCount(count) {
  const bits = Math.max(0, Math.ceil(Math.log2(Math.max(1, count))));
  return 32 - bits;
}

/**
 * Tightest prefix in [largestBlockPrefix, smallestBlockPrefix] (e.g. 19..24)
 * whose usable IPs cover `count`. Returns null when even the largest block is too small.
 */
export function tightestPrefix(count, usableFn, largestBlockPrefix, smallestBlockPrefix) {
  for (let p = smallestBlockPrefix; p >= largestBlockPrefix; p--) {
    if (usableFn(p) >= count) return p;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Node capacity                                                       */
/* ------------------------------------------------------------------ */

/**
 * AWS VPC CNI max pods.
 * Off: ENIs * (IPsPerENI - 1) + 2. Prefix Delegation (/28): ENIs * ((IPsPerENI - 1) * 16) + 2.
 * With Custom Networking the primary ENI hosts no pods, so one ENI is subtracted.
 */
export function awsMaxPods({ enis, ipsPerEni, prefixDelegation = false, customNetworking = false }) {
  const podEnis = customNetworking ? enis - 1 : enis;
  const perEni = prefixDelegation ? (ipsPerEni - 1) * 16 : ipsPerEni - 1;
  return podEnis * perEni + 2;
}

/** CNI theoretical max pods plus the kubelet cap (110 by default, optionally 250). */
export function awsPodLimit(inst, { prefixDelegation = false, customNetworking = false, raiseCap = false } = {}) {
  const theoretical = awsMaxPods({ ...inst, prefixDelegation, customNetworking });
  const canRaiseCap = theoretical > KUBELET_DEFAULT_CAP;
  const cap = canRaiseCap && raiseCap ? KUBELET_RAISED_CAP : KUBELET_DEFAULT_CAP;
  return { theoretical, cap, canRaiseCap, limit: Math.min(theoretical, cap), capped: theoretical > cap };
}

export function allocatable({ vcpu, ramGiB, overheadPct }) {
  const keep = 1 - Math.min(Math.max(overheadPct, 0), 95) / 100;
  return { cpuM: vcpu * 1000 * keep, memMiB: ramGiB * 1024 * keep };
}

/**
 * Effective pods per node = min(CPU fit, memory fit, pod limit).
 * bottleneck: "cpu" | "memory" | "pods" (ties resolve in that order).
 */
export function effectivePods({ vcpu, ramGiB, overheadPct, cpuPerPodM, memPerPodMiB, podLimit }) {
  const alloc = allocatable({ vcpu, ramGiB, overheadPct });
  const podsFromCpu = cpuPerPodM > 0 ? Math.floor(alloc.cpuM / cpuPerPodM) : Infinity;
  const podsFromMem = memPerPodMiB > 0 ? Math.floor(alloc.memMiB / memPerPodMiB) : Infinity;
  const effective = Math.max(0, Math.min(podsFromCpu, podsFromMem, podLimit));
  let bottleneck = "pods";
  if (podsFromCpu === effective) bottleneck = "cpu";
  else if (podsFromMem === effective) bottleneck = "memory";
  return { allocCpuM: alloc.cpuM, allocMemMiB: alloc.memMiB, podsFromCpu, podsFromMem, podLimit, effective, bottleneck };
}

/**
 * steady = ceil(pods / effective); withSurge = ceil(steady * (1 + surge)),
 * floored at one node per AZ for HA.
 */
export function nodeCounts({ desiredPods, effectivePerNode, surgePct, azCount }) {
  if (!(effectivePerNode > 0) || !(desiredPods > 0)) {
    return { valid: false, steady: 0, withSurge: 0, rawWithSurge: 0, azFloorApplied: false };
  }
  const steady = Math.ceil(desiredPods / effectivePerNode);
  const rawWithSurge = Math.ceil(steady * (1 + Math.max(0, surgePct) / 100));
  const withSurge = Math.max(rawWithSurge, azCount);
  return { valid: true, steady, rawWithSurge, withSurge, azFloorApplied: withSurge > rawWithSurge };
}

/** Spot nodes = round(total * ratio), the rest On-Demand. Monthly = 730h. */
export function monthlyCost({ nodes, spotRatioPct, odHourly, spotHourly, controlPlaneHourly }) {
  const ratio = Math.min(Math.max(spotRatioPct, 0), 100) / 100;
  const spotNodes = Math.min(nodes, Math.max(0, Math.round(nodes * ratio)));
  const odNodes = nodes - spotNodes;
  const odMonthly = odNodes * odHourly * HOURS_PER_MONTH;
  const spotMonthly = spotNodes * spotHourly * HOURS_PER_MONTH;
  const controlPlaneMonthly = controlPlaneHourly * HOURS_PER_MONTH;
  return {
    spotNodes,
    odNodes,
    odMonthly,
    spotMonthly,
    controlPlaneMonthly,
    total: controlPlaneMonthly + odMonthly + spotMonthly,
  };
}

/* ------------------------------------------------------------------ */
/* AWS (EKS + VPC CNI)                                                 */
/* ------------------------------------------------------------------ */

/**
 * Subnet addresses one node consumes when running `podsPerNode` pods,
 * including the VPC CNI default warm pool (WARM_ENI_TARGET=1 → one spare
 * ENI's IPs; WARM_PREFIX_TARGET=1 → one spare /28) and each ENI's primary IP.
 * `primary` is what lands in the node subnet, `pods` in the pod (secondary) subnet.
 */
export function awsIpsPerNode(inst, { prefixDelegation = false, customNetworking = false, podsPerNode }) {
  const slotsPerEni = inst.ipsPerEni - 1;
  const podEnis = customNetworking ? inst.enis - 1 : inst.enis;
  let podAddresses;
  let enisUsed;
  if (prefixDelegation) {
    const prefixes = Math.min(Math.ceil(podsPerNode / 16) + 1, podEnis * slotsPerEni);
    enisUsed = Math.max(1, Math.ceil(prefixes / slotsPerEni));
    podAddresses = prefixes * 16;
  } else {
    podAddresses = Math.min(podsPerNode + slotsPerEni, podEnis * slotsPerEni);
    enisUsed = Math.max(1, Math.ceil(podAddresses / slotsPerEni));
  }
  if (customNetworking) {
    // Node keeps its primary ENI in the node subnet; pod ENIs live in the pod subnet.
    return { primary: 1, pods: podAddresses + enisUsed, enisUsed, podAddresses };
  }
  return { primary: podAddresses + enisUsed, pods: 0, enisUsed, podAddresses };
}

/**
 * Plans per-AZ subnets. subnetPrefix: "auto" | 19..24.
 * Returns { error } for an invalid VPC CIDR.
 */
export function planAwsCidr({ vpcCidr, azCount, nodesWithSurge, perNode, customNetworking, subnetPrefix, secondaryCidr }) {
  const vpc = parseCidr(vpcCidr);
  if (!vpc) return { error: "vpcInvalid" };
  if (vpc.prefix < 16 || vpc.prefix > 28) return { error: "vpcPrefixRange" };

  const nodesPerAz = Math.ceil(nodesWithSurge / azCount);
  const primaryPerAz = customNetworking
    ? Math.ceil(nodesPerAz * perNode.primary * (1 + NODE_SUBNET_HEADROOM))
    : nodesPerAz * perNode.primary;

  // Auto only considers prefixes whose azCount subnets fit inside the VPC.
  const largestInVpc = Math.max(19, vpc.prefix + Math.ceil(Math.log2(azCount)));
  const autoPrefix = largestInVpc <= 24 ? tightestPrefix(primaryPerAz, awsUsableIps, largestInVpc, 24) : null;
  const isAuto = subnetPrefix === "auto";
  const prefix = isAuto ? autoPrefix ?? Math.min(largestInVpc, 24) : Number(subnetPrefix);
  const size = blockSize(prefix);
  const fitsInVpc = prefix >= vpc.prefix && azCount * size <= vpc.size;
  const usable = awsUsableIps(prefix);
  const primary = {
    prefix,
    autoPrefix,
    isAuto,
    usable,
    requiredPerAz: primaryPerAz,
    totalUsable: usable * azCount,
    totalRequired: primaryPerAz * azCount,
    capacityOk: usable >= primaryPerAz,
    fitsInVpc,
    subnets: fitsInVpc ? Array.from({ length: azCount }, (_, i) => `${intToIp(vpc.network + i * size)}/${prefix}`) : [],
  };
  primary.fits = primary.capacityOk && fitsInVpc;

  const result = { vpc, nodesPerAz, primary, secondary: null };
  if (!customNetworking) return result;

  const sec = parseCidr(secondaryCidr);
  const podsPerAz = nodesPerAz * perNode.pods;
  if (!sec) return { ...result, secondary: { error: "secondaryInvalid", requiredPerAz: podsPerAz } };
  if (sec.prefix < 16 || sec.prefix > 28) return { ...result, secondary: { error: "secondaryPrefixRange", requiredPerAz: podsPerAz } };
  if (cidrOverlaps(sec, vpc)) return { ...result, secondary: { error: "secondaryOverlap", requiredPerAz: podsPerAz, block: sec } };

  // Leave room for azCount subnets inside the secondary block.
  const maxSubnetPrefix = sec.prefix + Math.ceil(Math.log2(azCount));
  const podPrefix = maxSubnetPrefix <= 28 ? tightestPrefix(podsPerAz, awsUsableIps, maxSubnetPrefix, 28) : null;
  const fits = podPrefix !== null;
  const p = fits ? podPrefix : Math.min(maxSubnetPrefix, 28);
  const pUsable = awsUsableIps(p);
  result.secondary = {
    block: sec,
    prefix: p,
    usable: pUsable,
    requiredPerAz: podsPerAz,
    totalUsable: pUsable * azCount,
    totalRequired: podsPerAz * azCount,
    fits,
    subnets: Array.from({ length: azCount }, (_, i) => `${intToIp(sec.network + i * blockSize(p))}/${p}`),
  };
  return result;
}

const utilization = (used, available) => (available > 0 ? used / available : Infinity);

/**
 * Full AWS calculation. If the primary subnets cannot hold node + pod IPs,
 * the plan switches to Custom Networking with a secondary VPC CIDR.
 */
export function calculateAws(input) {
  const inst = findAwsInstance(input.instanceType);
  const run = (customNetworking) => {
    const limit = awsPodLimit(inst, {
      prefixDelegation: input.prefixDelegation,
      customNetworking,
      raiseCap: input.raiseCap,
    });
    const pods = effectivePods({
      vcpu: inst.vcpu,
      ramGiB: inst.ramGiB,
      overheadPct: input.overheadPct,
      cpuPerPodM: input.cpuPerPodM,
      memPerPodMiB: input.memPerPodMiB,
      podLimit: limit.limit,
    });
    const nodes = nodeCounts({
      desiredPods: input.desiredPods,
      effectivePerNode: pods.effective,
      surgePct: input.surgePct,
      azCount: input.azCount,
    });
    const perNode = awsIpsPerNode(inst, {
      prefixDelegation: input.prefixDelegation,
      customNetworking,
      podsPerNode: pods.effective,
    });
    const cidr = nodes.valid
      ? planAwsCidr({
          vpcCidr: input.vpcCidr,
          azCount: input.azCount,
          nodesWithSurge: nodes.withSurge,
          perNode,
          customNetworking,
          subnetPrefix: input.subnetPrefix,
          secondaryCidr: input.secondaryCidr,
        })
      : null;
    return { limit, pods, nodes, perNode, cidr, customNetworking };
  };

  let r = run(Boolean(input.customNetworking));
  let secondaryReason = input.customNetworking ? "custom" : null;
  if (!input.customNetworking && r.cidr && !r.cidr.error && r.cidr.primary.fitsInVpc && !r.cidr.primary.capacityOk) {
    r = run(true);
    secondaryReason = "capacity";
  }

  const cost = monthlyCost({
    nodes: r.nodes.withSurge,
    spotRatioPct: input.spotRatioPct,
    odHourly: inst.od,
    spotHourly: inst.spot,
    controlPlaneHourly: EKS_CONTROL_PLANE_HOURLY,
  });

  let ipUsed = 0;
  let ipAvailable = 0;
  let ipUtil = 0;
  if (r.cidr && !r.cidr.error) {
    const pools = [r.cidr.primary];
    if (r.cidr.secondary && !r.cidr.secondary.error) pools.push(r.cidr.secondary);
    // Report the tightest pool.
    const worst = pools.reduce((a, b) =>
      utilization(b.totalRequired, b.totalUsable) > utilization(a.totalRequired, a.totalUsable) ? b : a
    );
    ipUsed = worst.totalRequired;
    ipAvailable = worst.fitsInVpc === false ? 0 : worst.totalUsable;
    ipUtil = utilization(ipUsed, ipAvailable);
  }

  return {
    provider: "aws",
    instance: inst,
    ...r,
    secondaryRequired: Boolean(secondaryReason),
    secondaryReason,
    cost,
    ip: { used: ipUsed, available: ipAvailable, utilization: ipUtil },
    zones: AWS_ZONES.slice(0, input.azCount),
  };
}

/* ------------------------------------------------------------------ */
/* GCP (GKE VPC-native)                                                */
/* ------------------------------------------------------------------ */

/** Each node takes a Pod-range block of at least 2 × max-pods-per-node IPs (power of two). */
export function gkePodBlock(maxPodsPerNode) {
  const ips = 2 ** Math.ceil(Math.log2(2 * maxPodsPerNode));
  return { ips, prefix: 32 - Math.log2(ips) };
}

/** Prefix of the Pod secondary range needed for `nodes` nodes. */
export function gkePodRangePrefix(nodes, maxPodsPerNode) {
  return prefixForCount(Math.max(1, nodes) * gkePodBlock(maxPodsPerNode).ips);
}

/** Prefix of the Services secondary range for an expected number of Services. */
export const gkeServicesPrefix = (services) => prefixForCount(services);

/** Primary (nodes) range: nodes + 4 reserved, GKE minimum /29. */
export function gkePrimaryPrefix(nodes) {
  for (let p = 29; p >= 8; p--) if (gcpUsableIps(p) >= nodes) return p;
  return 8;
}

/** First block of `prefix` inside 10.0.0.0/8 that overlaps none of `taken`. */
export function suggestFreeBlock(prefix, taken) {
  const start = ipToInt("10.0.0.0");
  const end = start + blockSize(8);
  const size = blockSize(prefix);
  for (let n = start; n + size <= end; n += size) {
    const cand = { network: n, size };
    if (!taken.some((t) => t && cidrOverlaps(cand, t))) return `${intToIp(n)}/${prefix}`;
  }
  return null;
}

export function calculateGcp(input) {
  const machine = findGcpMachine(input.machineType);
  const sizeFor = (maxPods) => {
    const pods = effectivePods({
      vcpu: machine.vcpu,
      ramGiB: machine.ramGiB,
      overheadPct: input.overheadPct,
      cpuPerPodM: input.cpuPerPodM,
      memPerPodMiB: input.memPerPodMiB,
      podLimit: maxPods,
    });
    const nodes = nodeCounts({
      desiredPods: input.desiredPods,
      effectivePerNode: pods.effective,
      surgePct: input.surgePct,
      azCount: input.azCount,
    });
    const block = gkePodBlock(maxPods);
    const podPrefix = gkePodRangePrefix(nodes.withSurge, maxPods);
    return { maxPods, pods, nodes, block, podPrefix, podRangeSize: blockSize(podPrefix) };
  };

  const main = sizeFor(input.maxPodsPerNode);
  const { pods, nodes, block } = main;
  const limit = { limit: input.maxPodsPerNode, theoretical: input.maxPodsPerNode };

  const primaryPrefix = gkePrimaryPrefix(nodes.withSurge);
  const servicesPrefix = gkeServicesPrefix(input.servicesCount);

  const nodeRange = blockFromBase(input.nodeBase, primaryPrefix);
  const podRange = blockFromBase(input.podBase, main.podPrefix);
  const svcRange = blockFromBase(input.servicesBase, servicesPrefix);
  const master = parseCidr(input.masterCidr);

  const ranges = [
    { key: "nodes", block: nodeRange, base: input.nodeBase },
    { key: "pods", block: podRange, base: input.podBase },
    { key: "services", block: svcRange, base: input.servicesBase },
    { key: "master", block: master && master.prefix === 28 ? master : null, base: input.masterCidr },
  ];
  const issues = [];
  for (const r of ranges) {
    if (!r.block) {
      issues.push({ type: r.key === "master" ? "masterInvalid" : "baseInvalid", range: r.key });
    } else if (!r.block.aligned) {
      issues.push({ type: "misaligned", range: r.key, cidr: r.block.cidr });
    }
  }
  for (let i = 0; i < ranges.length; i++) {
    for (let j = i + 1; j < ranges.length; j++) {
      const a = ranges[i].block;
      const b = ranges[j].block;
      if (a && b && cidrOverlaps(a, b)) {
        const others = ranges.filter((_, k) => k !== j).map((x) => x.block);
        issues.push({
          type: "overlap",
          range: ranges[i].key,
          other: ranges[j].key,
          suggestion: suggestFreeBlock(b.prefix, others),
        });
      }
    }
  }

  // Smallest max-pods option that still lets CPU/memory be the limit.
  const resourceFit = Math.min(pods.podsFromCpu, pods.podsFromMem);
  const recommendedMaxPods =
    GKE_MAX_PODS_OPTIONS.find((o) => o >= resourceFit) ?? GKE_MAX_PODS_OPTIONS[GKE_MAX_PODS_OPTIONS.length - 1];

  const comparison = [...new Set([110, 64, 32, input.maxPodsPerNode, recommendedMaxPods])]
    .sort((a, b) => b - a)
    .map((mp) => {
      const s = sizeFor(mp);
      return {
        maxPods: mp,
        effective: s.pods.effective,
        nodes: s.nodes.withSurge,
        blockIps: s.block.ips,
        podPrefix: s.podPrefix,
        podRangeSize: s.podRangeSize,
        valid: s.nodes.valid,
      };
    });

  const cost = monthlyCost({
    nodes: nodes.withSurge,
    spotRatioPct: input.spotRatioPct,
    odHourly: machine.od,
    spotHourly: machine.spot,
    controlPlaneHourly: GKE_MANAGEMENT_HOURLY,
  });

  const podIpsUsed = nodes.withSurge * block.ips;
  return {
    provider: "gcp",
    machine,
    limit,
    pods,
    nodes,
    block,
    primary: {
      prefix: primaryPrefix,
      usable: gcpUsableIps(primaryPrefix),
      required: nodes.withSurge,
      cidr: nodeRange?.cidr,
    },
    podRange: {
      prefix: main.podPrefix,
      size: main.podRangeSize,
      required: podIpsUsed,
      maxNodes: Math.floor(main.podRangeSize / block.ips),
      cidr: podRange?.cidr,
    },
    servicesRange: { prefix: servicesPrefix, size: blockSize(servicesPrefix), cidr: svcRange?.cidr },
    master: master ? master.cidr : null,
    issues,
    ok: nodes.valid && issues.length === 0,
    comparison,
    recommendedMaxPods,
    cost,
    ip: { used: podIpsUsed, available: main.podRangeSize, utilization: utilization(podIpsUsed, main.podRangeSize) },
    zones: GCP_ZONES.slice(0, input.azCount),
  };
}
