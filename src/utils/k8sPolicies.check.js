// Sanity checks for src/utils/k8sPolicies.js. Run: node src/utils/k8sPolicies.check.js
import { COVERAGE_ROWS, DEFAULT_CONFIG, PRESETS, RULE_IDS, generatePolicies, parseEgressEntry, parseList } from "./k8sPolicies.js";

let failed = 0;
let passed = 0;
function check(name, ok, detail = "") {
  if (ok) passed++;
  else failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok || !detail ? "" : ` (${detail})`}`);
}
const has = (name, text, needle) => check(`${name} contains ${JSON.stringify(needle)}`, text.includes(needle));
const lacks = (name, text, needle) => check(`${name} does not contain ${JSON.stringify(needle)}`, !text.includes(needle));
const ENGINES = ["kyverno", "gatekeeper", "vap", "psa", "networkPolicy"];
const ADMISSION = ["kyverno", "gatekeeper", "vap"];
const noRules = Object.fromEntries(RULE_IDS.map((id) => [id, false]));
const allRules = Object.fromEntries(RULE_IDS.map((id) => [id, true]));
const npOff = { defaultDenyIngress: false, defaultDenyEgress: false, allowDns: false, allowSameNamespace: false, allowFromIngressNs: false, allowedEgressCidrs: [] };

/** Generic output hygiene + light YAML structure checks for every engine. */
function hygiene(label, out) {
  for (const e of ENGINES) {
    const y = out[e];
    check(`${label} ${e}: non-empty string`, typeof y === "string" && y.trim().length > 40);
    check(`${label} ${e}: no undefined/null leaked`, !/undefined|\bnull\b|NaN|\[object Object\]/.test(y));
    check(`${label} ${e}: no social links`, !/linkedin|x\.com|twitter/i.test(y));
    check(`${label} ${e}: no tabs`, !y.includes("\t"));
    check(`${label} ${e}: ends with newline, no trailing spaces`, y.endsWith("\n") && !/[ ]+$/m.test(y));
    // Every non-comment document has apiVersion + kind + metadata.name.
    const docs = y.split(/^---$/m).map((d) => d.replace(/^\s*#.*$/gm, "").trim()).filter(Boolean);
    check(
      `${label} ${e}: every YAML document has apiVersion/kind/metadata.name`,
      docs.every((d) => /^apiVersion: \S+$/m.test(d) && /^kind: \S+$/m.test(d) && /^metadata:\n(  .*\n)*?  name: [a-z0-9-]+$/m.test(d)),
      `${docs.length} docs`
    );
    // Indentation is always a multiple of 2 spaces.
    check(`${label} ${e}: indentation in steps of 2`, y.split("\n").every((l) => (l.match(/^ */)[0].length % 2) === 0));
  }
}

/* -------- 1. audit + cluster + subset of rules -------- */
const a = generatePolicies({
  ...DEFAULT_CONFIG,
  scope: "cluster",
  enforcement: "audit",
  rules: { ...noRules, blockRoot: true, blockPrivileged: true },
});
hygiene("audit/cluster", a);
has("kyverno", a.kyverno, "kind: ClusterPolicy");
has("kyverno", a.kyverno, "validationFailureAction: Audit");
has("kyverno", a.kyverno, "background: true");
for (const ns of DEFAULT_CONFIG.excludedNamespaces) has("kyverno exclude", a.kyverno, `- ${ns}`);
has("kyverno", a.kyverno, "runAsNonRoot");
has("kyverno", a.kyverno, "allowPrivilegeEscalation");
has("kyverno", a.kyverno, "hostNetwork");
has("kyverno", a.kyverno, "hostPID");
has("kyverno", a.kyverno, "hostIPC");
has("kyverno", a.kyverno, "privileged");
for (const n of ["requests", "limits", "readOnlyRootFilesystem", "livenessProbe", "readinessProbe", ":latest", "capabilities"]) {
  for (const e of ADMISSION) lacks(`audit/cluster ${e} (disabled rule)`, a[e], n);
}
has("gatekeeper", a.gatekeeper, "kind: ConstraintTemplate");
has("gatekeeper", a.gatekeeper, "kind: K8sRequireNonRoot");
has("gatekeeper", a.gatekeeper, "kind: K8sBlockPrivileged");
has("gatekeeper", a.gatekeeper, "enforcementAction: dryrun");
has("gatekeeper", a.gatekeeper, 'violation[{"msg": msg}]');
has("gatekeeper", a.gatekeeper, 'excludedNamespaces: ["kube-system", "kube-public", "kube-node-lease"]');
has("gatekeeper", a.gatekeeper, "spec.template.spec");
has("gatekeeper", a.gatekeeper, '"Deployment", "StatefulSet", "DaemonSet"');
lacks("gatekeeper", a.gatekeeper, "K8sAllowedImages");
check("gatekeeper: package name matches template name", /name: k8srequirenonroot[\s\S]*package k8srequirenonroot/.test(a.gatekeeper));
check("gatekeeper: 2 templates + 2 constraints", (a.gatekeeper.match(/^kind: ConstraintTemplate$/gm) || []).length === 2 && (a.gatekeeper.match(/^apiVersion: constraints\.gatekeeper\.sh\/v1beta1$/gm) || []).length === 2);
has("vap", a.vap, "kind: ValidatingAdmissionPolicy");
has("vap", a.vap, "kind: ValidatingAdmissionPolicyBinding");
has("vap", a.vap, 'validationActions: ["Audit", "Warn"]');
has("vap", a.vap, "failurePolicy: Fail");
has("vap", a.vap, ".all(");
has("vap", a.vap, "object.spec.template.spec");
has("vap", a.vap, "object.kind == 'Pod'");
has("vap", a.vap, "operator: NotIn");
has("vap", a.vap, "kubernetes.io/metadata.name");
has("vap", a.vap, '"deployments", "statefulsets", "daemonsets"');
has("vap", a.vap, '"jobs", "cronjobs"');
check("vap: CEL parens balanced", (a.vap.match(/\(/g) || []).length === (a.vap.match(/\)/g) || []).length);
// Default NetworkPolicy: deny ingress + DNS + same namespace
has("netpol default", a.networkPolicy, "apiVersion: networking.k8s.io/v1");
has("netpol default", a.networkPolicy, "name: default-deny-ingress");
has("netpol default", a.networkPolicy, "k8s-app: kube-dns");
lacks("netpol default", a.networkPolicy, "name: default-deny-egress");

/* -------- 2. enforce + namespace + all rules + custom registries -------- */
const regs = ["registry.example.com/team/", "999999999999.dkr.ecr.sa-east-1.amazonaws.com/"];
const b = generatePolicies({
  ...DEFAULT_CONFIG,
  scope: "namespace",
  namespace: "payments",
  enforcement: "enforce",
  rules: allRules,
  allowedRegistries: regs.join(",\n"),
});
hygiene("enforce/namespace", b);
has("kyverno", b.kyverno, "kind: Policy");
lacks("kyverno", b.kyverno, "kind: ClusterPolicy");
has("kyverno", b.kyverno, "namespace: payments");
has("kyverno", b.kyverno, "validationFailureAction: Enforce");
lacks("kyverno", b.kyverno, "validationFailureAction: Audit");
lacks("kyverno namespaced (no exclude block)", b.kyverno, "exclude:");
has("kyverno", b.kyverno, '"registry.example.com/team/* | 999999999999.dkr.ecr.sa-east-1.amazonaws.com/*"');
has("kyverno", b.kyverno, '"!*:latest"');
has("kyverno", b.kyverno, "autogen-controllers");
for (const e of ADMISSION) {
  for (const n of ["runAsNonRoot", "allowPrivilegeEscalation", "hostNetwork", "hostPID", "hostIPC", "resources.requests", "resources.limits", "latest", "readOnlyRootFilesystem", "capabilities", "livenessProbe", "readinessProbe", "registry.example.com/team/", "999999999999.dkr.ecr.sa-east-1.amazonaws.com/"]) {
    has(`enforce/namespace ${e}`, b[e], n);
  }
}
has("gatekeeper", b.gatekeeper, "enforcementAction: deny");
lacks("gatekeeper", b.gatekeeper, "enforcementAction: dryrun");
has("gatekeeper", b.gatekeeper, 'namespaces: ["payments"]');
has("gatekeeper", b.gatekeeper, "registries:");
check("gatekeeper: 6 templates", (b.gatekeeper.match(/^kind: ConstraintTemplate$/gm) || []).length === 6);
has("vap", b.vap, 'validationActions: ["Deny"]');
lacks("vap", b.vap, '"Audit", "Warn"');
has("vap", b.vap, "operator: In");
has("vap", b.vap, 'values: ["payments"]');
has("vap", b.vap, "variables.isBatch");
check("vap: CEL parens balanced (all rules)", (b.vap.match(/\(/g) || []).length === (b.vap.match(/\)/g) || []).length);
has("gatekeeper covers ephemeral containers", b.gatekeeper, "pod_spec.ephemeralContainers[_]");
has("gatekeeper resources skip ephemeral", b.gatekeeper, "c := sized_containers[_]");
has("vap covers ephemeral containers", b.vap, "variables.podSpec.ephemeralContainers");
has("vap matches ephemeral subresource", b.vap, '"pods/ephemeralcontainers"');
has("vap resources skip ephemeral", b.vap, "variables.sizedContainers.all(c, has(c.resources)");
check("vap sizedContainers defined before containers", b.vap.indexOf("name: sizedContainers") < b.vap.indexOf("name: containers"));
has("kyverno tag check only looks at the last segment", b.kyverno, "regex_match('(@sha256:[a-f0-9]{64}|:[^/:@]+)$', element.image)");
lacks("kyverno no naive *:* tag pattern", b.kyverno, '"*:*"');
{
  const re = /(@sha256:[a-f0-9]{64}|:[^/:@]+)$/;
  const d = "a".repeat(64);
  check("tag regex: registry:5000/app rejected", !re.test("registry:5000/app"));
  check("tag regex: app:1.2 accepted", re.test("registry:5000/app:1.2"));
  check("tag regex: digest accepted", re.test(`nginx@sha256:${d}`));
  check("tag regex: untagged rejected", !re.test("nginx"));
}
check("rego: braces balanced (all rules)", (b.gatekeeper.match(/\{/g) || []).length === (b.gatekeeper.match(/\}/g) || []).length);

/* -------- 3. changing inputs changes the output -------- */
const b2 = generatePolicies({ ...DEFAULT_CONFIG, scope: "namespace", namespace: "Checkout_API", enforcement: "enforce", rules: allRules, allowedRegistries: ["quay.io/acme/"] });
check("namespace change changes kyverno", b2.kyverno !== b.kyverno && b2.kyverno.includes("namespace: checkout-api"));
check("namespace sanitized to DNS-1123 everywhere", ENGINES.every((e) => !b2[e].includes("Checkout_API")));
check("registry change changes VAP", b2.vap.includes("'quay.io/acme/'") && !b2.vap.includes("registry.example.com"));
check("registry change changes Gatekeeper", b2.gatekeeper.includes('"quay.io/acme/"'));
const b3 = generatePolicies({ ...DEFAULT_CONFIG, scope: "namespace", namespace: "payments", enforcement: "audit", rules: allRules, allowedRegistries: regs });
check("enforcement change changes Kyverno/Gatekeeper/VAP", ADMISSION.every((e) => b3[e] !== b[e]));
const ex = generatePolicies({ ...DEFAULT_CONFIG, excludedNamespaces: "kube-system  istio-system, monitoring" });
has("custom excluded ns (kyverno)", ex.kyverno, "- istio-system");
has("custom excluded ns (gatekeeper)", ex.gatekeeper, '["kube-system", "istio-system", "monitoring"]');
has("custom excluded ns (vap)", ex.vap, '["kube-system", "istio-system", "monitoring"]');
lacks("custom excluded ns (vap)", ex.vap, "kube-public");

/* -------- 4. nothing selected -------- */
const none = generatePolicies({ ...DEFAULT_CONFIG, rules: noRules, networkPolicy: npOff });
hygiene("nothing selected", none);
for (const e of ADMISSION) {
  check(`nothing selected ${e}: only comments`, none[e].split("\n").every((l) => !l.trim() || l.startsWith("#")));
}
check("nothing selected netpol: only comments", none.networkPolicy.split("\n").every((l) => !l.trim() || l.startsWith("#")));
has("nothing selected PSA still emits Namespace", none.psa, "kind: Namespace");

/* -------- 5. NetworkPolicy combinations -------- */
const np = (opts) => generatePolicies({ ...DEFAULT_CONFIG, scope: "namespace", namespace: "shop", networkPolicy: { ...npOff, ...opts } }).networkPolicy;
const denyOnly = np({ defaultDenyIngress: true, defaultDenyEgress: true });
has("np deny only", denyOnly, "name: default-deny-ingress");
has("np deny only", denyOnly, "name: default-deny-egress");
has("np deny only", denyOnly, "namespace: shop");
has("np deny only", denyOnly, "podSelector: {}");
lacks("np deny only", denyOnly, "kube-dns");
lacks("np deny only", denyOnly, "ipBlock");
const denyDns = np({ defaultDenyIngress: true, defaultDenyEgress: true, allowDns: true });
has("np deny+dns", denyDns, "k8s-app: kube-dns");
has("np deny+dns", denyDns, "port: 53");
has("np deny+dns", denyDns, "protocol: UDP");
has("np deny+dns", denyDns, "protocol: TCP");
has("np deny+dns", denyDns, "kubernetes.io/metadata.name: kube-system");
const full = np({
  defaultDenyIngress: true,
  defaultDenyEgress: true,
  allowDns: true,
  allowSameNamespace: true,
  allowFromIngressNs: true,
  ingressNamespace: "traefik",
  allowedEgressCidrs: "10.0.0.0/8, 0.0.0.0/0:443, not-a-cidr",
});
has("np full", full, "name: allow-same-namespace");
has("np full", full, "name: allow-from-ingress-controller");
has("np full", full, "kubernetes.io/metadata.name: traefik");
has("np full", full, "cidr: 10.0.0.0/8");
has("np full", full, "cidr: 0.0.0.0/0");
has("np full", full, "port: 443");
has("np full (invalid entry reported)", full, "Ignored invalid egress entries: not-a-cidr");
check("np full: 6 policies", (full.match(/^kind: NetworkPolicy$/gm) || []).length === 6);
const ingressOnly = np({ allowFromIngressNs: true });
has("np allow without deny warns about isolation", ingressOnly, "isolates the selected pods for ingress");
lacks("np ingress only", ingressOnly, "ingress-nginx-x");
has("np default ingress namespace", ingressOnly, "kubernetes.io/metadata.name: ingress-nginx");

/* -------- 6. PSA -------- */
const psa = (p, rules = DEFAULT_CONFIG.rules) => generatePolicies({ ...DEFAULT_CONFIG, namespace: "payments", rules, psa: p }).psa;
const pBase = psa({ enforce: "baseline", audit: "restricted", warn: "restricted", version: "latest" }, { ...noRules, blockRoot: true, blockPrivileged: true });
has("psa baseline", pBase, "pod-security.kubernetes.io/enforce: baseline");
has("psa baseline", pBase, "pod-security.kubernetes.io/enforce-version: latest");
has("psa baseline", pBase, "pod-security.kubernetes.io/audit: restricted");
has("psa baseline", pBase, "pod-security.kubernetes.io/warn: restricted");
has("psa baseline", pBase, "kubectl label namespace payments");
has("psa baseline", pBase, "--overwrite");
has("psa baseline: gap for blockRoot is explicit", pBase, "GAP: enforce=baseline");
const pRes = psa({ enforce: "restricted", audit: "restricted", warn: "restricted", version: "v1.31" }, allRules);
has("psa restricted", pRes, "pod-security.kubernetes.io/enforce: restricted");
has("psa restricted", pRes, "pod-security.kubernetes.io/enforce-version: v1.31");
has("psa restricted", pRes, "pod-security.kubernetes.io/warn-version=v1.31");
lacks("psa restricted", pRes, "-version: latest");
lacks("psa restricted", pRes, "-version=latest");
lacks("psa restricted: no gap", pRes, "GAP:");
has("psa restricted: caps partial", pRes, "PARTIAL");
has("psa restricted: images not covered", pRes, "NOT covered");

/* -------- 7. coverage matrix -------- */
const cov = (cfg) => Object.fromEntries(generatePolicies(cfg).coverage.map((r) => [r.id, r]));
const cBase = cov({ ...DEFAULT_CONFIG, rules: allRules, psa: { ...DEFAULT_CONFIG.psa, enforce: "baseline" } });
const cRes = cov({ ...DEFAULT_CONFIG, rules: allRules, psa: { ...DEFAULT_CONFIG.psa, enforce: "restricted" } });
check("coverage has all rows", COVERAGE_ROWS.every((id) => cBase[id]));
check("coverage: blockPrivileged PSA full on baseline", cBase.blockPrivileged.psa === "full");
check("coverage: blockRoot PSA none on baseline, flagged", cBase.blockRoot.psa === "none" && cBase.blockRoot.psaNeedsRestricted);
check("coverage: blockRoot PSA full on restricted", cRes.blockRoot.psa === "full" && !cRes.blockRoot.psaGap);
check("coverage: caps PSA partial on restricted", cRes.readOnlyRootAndDropCaps.psa === "partial");
check("coverage: images/limits/probes never PSA", ["restrictImages", "requireResources", "requireProbes"].every((id) => cRes[id].psa === "none"));
check("coverage: only NetworkPolicy isolates", cRes.networkIsolation.networkPolicy === "full" && ADMISSION.every((e) => cRes.networkIsolation[e] === "none") && cRes.networkIsolation.psa === "none");
check("coverage: admission engines full for pod rules", RULE_IDS.every((id) => ADMISSION.every((e) => cRes[id][e] === "full") && cRes[id].networkPolicy === "none"));

/* -------- 8. presets + helpers -------- */
for (const [name, preset] of Object.entries(PRESETS)) hygiene(`preset ${name}`, generatePolicies(preset(DEFAULT_CONFIG)));
check("preset restricted: all rules + PSA restricted", RULE_IDS.every((id) => PRESETS.restricted(DEFAULT_CONFIG).rules[id]) && PRESETS.restricted(DEFAULT_CONFIG).psa.enforce === "restricted");
check("preset zeroTrust: namespace scope + full netpol", PRESETS.zeroTrust(DEFAULT_CONFIG).scope === "namespace" && PRESETS.zeroTrust(DEFAULT_CONFIG).networkPolicy.allowFromIngressNs);
check("preset supplyChain: images on", PRESETS.supplyChain(DEFAULT_CONFIG).rules.restrictImages);
check("parseList splits commas/whitespace/newlines", JSON.stringify(parseList("a, b\nc  d,,a")) === '["a","b","c","d"]');
check("parseEgressEntry cidr:port", JSON.stringify(parseEgressEntry("0.0.0.0/0:443")) === '{"cidr":"0.0.0.0/0","port":443}');
check("parseEgressEntry rejects bad octet", parseEgressEntry("300.0.0.0/8") === null);
check("parseEgressEntry ipv6", parseEgressEntry("fd00::/8")?.cidr === "fd00::/8");
check("deterministic output", JSON.stringify(generatePolicies(DEFAULT_CONFIG)) === JSON.stringify(generatePolicies(DEFAULT_CONFIG)));

console.log(`\n${failed === 0 ? "ALL PASS" : "FAILURES"}: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
