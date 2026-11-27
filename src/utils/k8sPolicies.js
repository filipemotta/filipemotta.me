// Kubernetes security policy generator: Kyverno, OPA Gatekeeper,
// ValidatingAdmissionPolicy (CEL), Pod Security Admission and NetworkPolicy.
// Pure, deterministic string builders. No React, no I/O.

export const RULE_IDS = [
  "blockRoot",
  "blockPrivileged",
  "requireResources",
  "restrictImages",
  "readOnlyRootAndDropCaps",
  "requireProbes",
];

export const RULE_SEVERITY = {
  blockRoot: "high",
  blockPrivileged: "high",
  requireResources: "medium",
  restrictImages: "high",
  readOnlyRootAndDropCaps: "medium",
  requireProbes: "medium",
};

export const ENGINES = ["kyverno", "gatekeeper", "vap", "psa", "networkPolicy"];
export const PSA_LEVELS = ["baseline", "restricted"];
export const PSA_VERSIONS = ["latest", "v1.34", "v1.33", "v1.32", "v1.31", "v1.30"];
export const DEFAULT_EXCLUDED_NAMESPACES = ["kube-system", "kube-public", "kube-node-lease"];

// English labels used only inside generated YAML comments.
const RULE_LABEL = {
  blockRoot: "Block root (runAsNonRoot + allowPrivilegeEscalation: false)",
  blockPrivileged: "Block privileged pods and host namespaces",
  requireResources: "Require CPU/memory requests and limits",
  restrictImages: "Allowed registries + block :latest / untagged images",
  readOnlyRootAndDropCaps: "Read-only root filesystem + drop ALL capabilities",
  requireProbes: "Require liveness and readiness probes",
};

export const DEFAULT_CONFIG = {
  scope: "cluster",
  namespace: "payments",
  excludedNamespaces: [...DEFAULT_EXCLUDED_NAMESPACES],
  enforcement: "audit",
  rules: {
    blockRoot: true,
    blockPrivileged: true,
    requireResources: true,
    restrictImages: false,
    readOnlyRootAndDropCaps: false,
    requireProbes: false,
  },
  allowedRegistries: ["123456789012.dkr.ecr.us-east-1.amazonaws.com/", "ghcr.io/my-org/"],
  networkPolicy: {
    defaultDenyIngress: true,
    defaultDenyEgress: false,
    allowDns: true,
    allowSameNamespace: true,
    allowFromIngressNs: false,
    ingressNamespace: "ingress-nginx",
    allowedEgressCidrs: [],
  },
  psa: { enforce: "baseline", audit: "restricted", warn: "restricted", version: "latest" },
};

const allRules = (on) => Object.fromEntries(RULE_IDS.map((id) => [id, on]));

/** One-click bundles. Each returns a new config based on the current one; users can keep editing after applying. */
export const PRESETS = {
  baseline: (c) => ({
    ...c,
    rules: { ...allRules(false), blockRoot: true, blockPrivileged: true, requireResources: true },
    psa: { ...c.psa, enforce: "baseline", audit: "restricted", warn: "restricted" },
    networkPolicy: { ...c.networkPolicy, defaultDenyIngress: false, defaultDenyEgress: false, allowDns: false, allowSameNamespace: false, allowFromIngressNs: false },
  }),
  restricted: (c) => ({
    ...c,
    rules: allRules(true),
    psa: { ...c.psa, enforce: "restricted", audit: "restricted", warn: "restricted" },
    networkPolicy: { ...c.networkPolicy, defaultDenyIngress: true, defaultDenyEgress: true, allowDns: true, allowSameNamespace: true },
  }),
  supplyChain: (c) => ({
    ...c,
    rules: { ...allRules(false), restrictImages: true, requireResources: true },
  }),
  zeroTrust: (c) => ({
    ...c,
    scope: "namespace",
    rules: { ...allRules(false), blockRoot: true, blockPrivileged: true, requireResources: true },
    networkPolicy: {
      ...c.networkPolicy,
      defaultDenyIngress: true,
      defaultDenyEgress: true,
      allowDns: true,
      allowSameNamespace: true,
      allowFromIngressNs: true,
    },
  }),
};

/* ------------------------------------------------------------------ */
/* Input helpers                                                       */
/* ------------------------------------------------------------------ */

/** Split a comma / whitespace / newline separated string (or pass an array through), trimmed and de-duplicated. */
export function parseList(value) {
  const items = Array.isArray(value) ? value : String(value ?? "").split(/[\s,]+/);
  return [...new Set(items.map((v) => String(v ?? "").trim()).filter(Boolean))];
}

/** DNS-1123 label (namespace / resource name). */
export function dnsLabel(value, fallback = "default") {
  const cleaned = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63)
    .replace(/-+$/g, "");
  return cleaned || fallback;
}

/** Registry prefix: strip characters that would break YAML, Kyverno wildcards or CEL/Rego string literals. */
const cleanRegistry = (r) => String(r).replace(/["'\\|*`\s]/g, "");

const IPV4_CIDR = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

/** "10.0.0.0/8" or "0.0.0.0/0:443" → { cidr, port } ; invalid → null */
export function parseEgressEntry(raw) {
  const m = String(raw).trim().match(/^(.+?\/\d{1,3})(?::(\d{1,5}))?$/);
  if (!m) return null;
  const [, cidr, portStr] = m;
  const v4 = cidr.match(IPV4_CIDR);
  if (v4) {
    const octets = v4.slice(1, 5).map(Number);
    if (octets.some((o) => o > 255) || Number(v4[5]) > 32) return null;
  } else if (!/^[0-9a-fA-F:]+\/\d{1,3}$/.test(cidr) || Number(cidr.split("/")[1]) > 128) {
    return null;
  }
  const port = portStr ? Number(portStr) : undefined;
  if (port !== undefined && (port < 1 || port > 65535)) return null;
  return port ? { cidr, port } : { cidr };
}

const NORMALIZED = new WeakSet();
const ensureNormalized = (c) => (c && NORMALIZED.has(c) ? c : normalizeConfig(c));

export function normalizeConfig(input = {}) {
  const c = { ...DEFAULT_CONFIG, ...input };
  const np = { ...DEFAULT_CONFIG.networkPolicy, ...(input.networkPolicy || {}) };
  const psa = { ...DEFAULT_CONFIG.psa, ...(input.psa || {}) };
  const rawCidrs = parseList(np.allowedEgressCidrs);
  const egress = rawCidrs.map(parseEgressEntry);
  const out = {
    scope: c.scope === "namespace" ? "namespace" : "cluster",
    namespace: dnsLabel(c.namespace),
    excludedNamespaces: parseList(c.excludedNamespaces).map((n) => dnsLabel(n)),
    enforcement: c.enforcement === "enforce" ? "enforce" : "audit",
    rules: Object.fromEntries(RULE_IDS.map((id) => [id, Boolean({ ...DEFAULT_CONFIG.rules, ...(input.rules || {}) }[id])])),
    allowedRegistries: parseList(c.allowedRegistries).map(cleanRegistry).filter(Boolean),
    networkPolicy: {
      defaultDenyIngress: Boolean(np.defaultDenyIngress),
      defaultDenyEgress: Boolean(np.defaultDenyEgress),
      allowDns: Boolean(np.allowDns),
      allowSameNamespace: Boolean(np.allowSameNamespace),
      allowFromIngressNs: Boolean(np.allowFromIngressNs),
      ingressNamespace: dnsLabel(np.ingressNamespace, "ingress-nginx"),
      egress: egress.filter(Boolean),
      invalidCidrs: rawCidrs.filter((_, i) => !egress[i]),
    },
    psa: {
      enforce: PSA_LEVELS.includes(psa.enforce) ? psa.enforce : "baseline",
      audit: PSA_LEVELS.includes(psa.audit) ? psa.audit : "restricted",
      warn: PSA_LEVELS.includes(psa.warn) ? psa.warn : "restricted",
      version: /^(latest|v\d+\.\d+)$/.test(psa.version) ? psa.version : "latest",
    },
  };
  NORMALIZED.add(out);
  return out;
}

/* ------------------------------------------------------------------ */
/* Coverage                                                            */
/* ------------------------------------------------------------------ */

const ADMISSION_FULL = { kyverno: "full", gatekeeper: "full", vap: "full", networkPolicy: "none" };

/** Static matrix. PSA is given per enforce level because blockRoot / caps depend on it. */
export const COVERAGE_MATRIX = {
  blockRoot: { ...ADMISSION_FULL, psa: { baseline: "none", restricted: "full" } },
  blockPrivileged: { ...ADMISSION_FULL, psa: { baseline: "full", restricted: "full" } },
  requireResources: { ...ADMISSION_FULL, psa: { baseline: "none", restricted: "none" } },
  restrictImages: { ...ADMISSION_FULL, psa: { baseline: "none", restricted: "none" } },
  readOnlyRootAndDropCaps: { ...ADMISSION_FULL, psa: { baseline: "none", restricted: "partial" } },
  requireProbes: { ...ADMISSION_FULL, psa: { baseline: "none", restricted: "none" } },
  networkIsolation: { kyverno: "none", gatekeeper: "none", vap: "none", networkPolicy: "full", psa: { baseline: "none", restricted: "none" } },
};

export const COVERAGE_ROWS = [...RULE_IDS, "networkIsolation"];

const anyNetworkPolicy = (np) =>
  np.defaultDenyIngress || np.defaultDenyEgress || np.allowDns || np.allowSameNamespace || np.allowFromIngressNs || np.egress.length > 0;

/** Coverage rows for a normalized config. PSA is evaluated at the configured enforce level. */
export function coverageFor(cfg) {
  return COVERAGE_ROWS.map((id) => {
    const m = COVERAGE_MATRIX[id];
    const selected = id === "networkIsolation" ? anyNetworkPolicy(cfg.networkPolicy) : cfg.rules[id];
    const psa = m.psa[cfg.psa.enforce];
    return {
      id,
      selected,
      kyverno: m.kyverno,
      gatekeeper: m.gatekeeper,
      vap: m.vap,
      psa,
      psaRestricted: m.psa.restricted,
      networkPolicy: m.networkPolicy,
      // Selected and PSA (at the current enforce level) does not fully cover it.
      psaGap: selected && id !== "networkIsolation" && psa !== "full",
      // Raising PSA enforce to restricted would improve coverage.
      psaNeedsRestricted: selected && cfg.psa.enforce === "baseline" && m.psa.restricted !== "none" && psa !== m.psa.restricted,
    };
  });
}

/* ------------------------------------------------------------------ */
/* Shared YAML helpers                                                 */
/* ------------------------------------------------------------------ */

const q = (s) => JSON.stringify(String(s));
const flow = (items) => `[${items.map(q).join(", ")}]`;
const indent = (text, n) =>
  text
    .split("\n")
    .map((l) => (l ? " ".repeat(n) + l : l))
    .join("\n");
const enabledRules = (cfg) => RULE_IDS.filter((id) => cfg.rules[id]);

function header(engine, cfg, extra = [], { podRules = true } = {}) {
  const scope =
    cfg.scope === "cluster"
      ? `cluster-wide${cfg.excludedNamespaces.length ? ` (excluded namespaces: ${cfg.excludedNamespaces.join(", ")})` : ""}`
      : `namespace "${cfg.namespace}"`;
  const rules = enabledRules(cfg);
  return [
    `# ${engine}, generated by the Kubernetes Security Policy Generator.`,
    `# Scope: ${scope}`,
    ...(podRules
      ? [
          `# Enforcement: ${cfg.enforcement === "enforce" ? "enforce / deny" : "audit / dry-run (nothing is blocked)"}`,
          `# Rules: ${rules.length ? rules.map((r) => RULE_LABEL[r]).join("; ") : "none selected"}`,
        ]
      : []),
    ...extra.map((l) => `# ${l}`),
    "# Review and test in a non-production cluster before applying.",
  ].join("\n");
}

const nothingSelected = (engine, cfg, what = "No pod security rule is selected") =>
  `${header(engine, cfg)}\n#\n# ${what}, so there is nothing to generate for ${engine}.\n# Enable at least one rule above to get copy-ready manifests.\n`;

/* ------------------------------------------------------------------ */
/* Kyverno                                                             */
/* ------------------------------------------------------------------ */

function kyvernoRules(cfg) {
  const regs = cfg.allowedRegistries;
  const out = [];
  const containersPattern = (body) =>
    ["=(ephemeralContainers):", "  - " + body.join("\n    "), "=(initContainers):", "  - " + body.join("\n    "), "containers:", "  - " + body.join("\n    ")].join("\n");
  const r = (name, message, validateBody, extra = "") => out.push({ name, message, validateBody, extra });

  if (cfg.rules.blockRoot) {
    r(
      "require-run-as-non-root",
      "Running as root is not allowed. Set securityContext.runAsNonRoot: true on the pod or on every container.",
      [
        "anyPattern:",
        "  - spec:",
        "      securityContext:",
        "        runAsNonRoot: true",
        indent(containersPattern(["=(securityContext):", "  =(runAsNonRoot): true"]), 6),
        "  - spec:",
        indent(containersPattern(["securityContext:", "  runAsNonRoot: true"]), 6),
      ].join("\n")
    );
    r(
      "disallow-privilege-escalation",
      "Privilege escalation is not allowed. Set securityContext.allowPrivilegeEscalation: false on every container.",
      ["pattern:", "  spec:", indent(containersPattern(["securityContext:", '  allowPrivilegeEscalation: "false"']), 4)].join("\n")
    );
  }
  if (cfg.rules.blockPrivileged) {
    r(
      "disallow-privileged-containers",
      "Privileged containers are not allowed. securityContext.privileged must be unset or false.",
      ["pattern:", "  spec:", indent(containersPattern(["=(securityContext):", '  =(privileged): "false"']), 4)].join("\n")
    );
    r(
      "disallow-host-namespaces",
      "Sharing host namespaces is not allowed. hostNetwork, hostPID and hostIPC must be unset or false.",
      ["pattern:", "  spec:", '    =(hostNetwork): "false"', '    =(hostPID): "false"', '    =(hostIPC): "false"'].join("\n")
    );
  }
  if (cfg.rules.requireResources) {
    const res = ["resources:", "  requests:", '    cpu: "?*"', '    memory: "?*"', "  limits:", '    cpu: "?*"', '    memory: "?*"'];
    r(
      "require-requests-and-limits",
      "CPU and memory resources.requests and resources.limits are required on every container and init container.",
      ["pattern:", "  spec:", "    =(initContainers):", "      - " + res.join("\n        "), "    containers:", "      - " + res.join("\n        ")].join("\n")
    );
  }
  if (cfg.rules.restrictImages) {
    if (regs.length) {
      const alt = q(regs.map((p) => `${p}*`).join(" | "));
      r(
        "restrict-image-registries",
        `Images must come from an allowed registry: ${regs.join(", ")}`,
        ["pattern:", "  spec:", indent(containersPattern([`image: ${alt}`]), 4)].join("\n")
      );
    }
    r("require-image-tag", "An image tag or digest is required (untagged images resolve to :latest).", [
      "pattern:",
      "  spec:",
      indent(containersPattern(['image: "*:*"']), 4),
    ].join("\n"));
    r("disallow-latest-tag", "The :latest tag is not allowed. Pin a version or a digest.", [
      "pattern:",
      "  spec:",
      indent(containersPattern(['image: "!*:latest"']), 4),
    ].join("\n"));
  }
  if (cfg.rules.readOnlyRootAndDropCaps) {
    r(
      "require-read-only-root-filesystem",
      "securityContext.readOnlyRootFilesystem: true is required on every container.",
      ["pattern:", "  spec:", indent(containersPattern(["securityContext:", "  readOnlyRootFilesystem: true"]), 4)].join("\n")
    );
    r(
      "require-drop-all-capabilities",
      'Containers must drop ALL capabilities (securityContext.capabilities.drop: ["ALL"]).',
      [
        "foreach:",
        "  - list: request.object.spec.[ephemeralContainers, initContainers, containers][]",
        "    deny:",
        "      conditions:",
        "        all:",
        "          - key: ALL",
        "            operator: AnyNotIn",
        '            value: "{{ element.securityContext.capabilities.drop[].to_upper(@) || `[]` }}"',
      ].join("\n"),
      [
        "preconditions:",
        "  all:",
        "    - key: \"{{ request.operation || 'BACKGROUND' }}\"",
        "      operator: NotEquals",
        "      value: DELETE",
      ].join("\n")
    );
  }
  return out;
}

function kyvernoRuleYaml(rule, cfg) {
  const match = ["match:", "  any:", "    - resources:", "        kinds:", "          - Pod"];
  if (cfg.scope === "namespace") match.push("        namespaces:", `          - ${cfg.namespace}`);
  const lines = [`- name: ${rule.name}`, indent(match.join("\n"), 2)];
  if (cfg.scope === "cluster" && cfg.excludedNamespaces.length) {
    lines.push(
      indent(["exclude:", "  any:", "    - resources:", "        namespaces:", ...cfg.excludedNamespaces.map((n) => `          - ${n}`)].join("\n"), 2)
    );
  }
  if (rule.extra) lines.push(indent(rule.extra, 2));
  lines.push(indent(["validate:", `  message: ${q(rule.message)}`, indent(rule.validateBody, 2)].join("\n"), 2));
  return lines.join("\n");
}

function kyvernoPolicyDoc(cfg, name, title, rules, annotations = {}) {
  const kind = cfg.scope === "cluster" ? "ClusterPolicy" : "Policy";
  const meta = ["metadata:", `  name: ${name}`];
  if (kind === "Policy") meta.push(`  namespace: ${cfg.namespace}`);
  meta.push("  annotations:", `    policies.kyverno.io/title: ${q(title)}`, "    policies.kyverno.io/category: Pod Security");
  for (const [k, v] of Object.entries(annotations)) meta.push(`    ${k}: ${q(v)}`);
  return [
    "apiVersion: kyverno.io/v1",
    `kind: ${kind}`,
    ...meta,
    "spec:",
    `  validationFailureAction: ${cfg.enforcement === "enforce" ? "Enforce" : "Audit"}`,
    "  background: true",
    "  rules:",
    indent(rules.map((r) => kyvernoRuleYaml(r, cfg)).join("\n"), 4),
  ].join("\n");
}

export function kyvernoYaml(input) {
  const cfg = ensureNormalized(input);
  if (!enabledRules(cfg).length) return nothingSelected("Kyverno", cfg);

  const docs = [];
  const rules = kyvernoRules(cfg);
  if (rules.length) docs.push(kyvernoPolicyDoc(cfg, "pod-security-guardrails", "Pod security guardrails", rules));

  if (cfg.rules.requireProbes) {
    // Separate policy so autogen can skip Jobs / CronJobs (batch workloads rarely have probes).
    const probes = {
      name: "require-liveness-and-readiness-probes",
      message: "livenessProbe and readinessProbe are required on every container of long-running workloads.",
      extra: [
        "preconditions:",
        "  all:",
        "    # Skip bare Pods created by a Job (batch workloads do not serve traffic).",
        "    - key: \"{{ request.object.metadata.ownerReferences[?kind=='Job'] || `[]` | length(@) }}\"",
        "      operator: Equals",
        "      value: 0",
      ].join("\n"),
      validateBody: [
        "foreach:",
        "  - list: request.object.spec.containers[]",
        "    deny:",
        "      conditions:",
        "        any:",
        "          - key: livenessProbe",
        "            operator: AnyNotIn",
        '            value: "{{ element.keys(@) }}"',
        "          - key: readinessProbe",
        "            operator: AnyNotIn",
        '            value: "{{ element.keys(@) }}"',
      ].join("\n"),
    };
    docs.push(
      kyvernoPolicyDoc(cfg, "require-pod-probes", "Require liveness and readiness probes", [probes], {
        "pod-policies.kyverno.io/autogen-controllers": "Deployment,StatefulSet,DaemonSet,ReplicaSet",
      })
    );
  }

  const head = header("Kyverno (kyverno.io/v1)", cfg, [
    "Rules match Pods; Kyverno autogen also applies them to Deployments, StatefulSets,",
    "DaemonSets, ReplicaSets, Jobs and CronJobs (the probe policy skips Jobs and CronJobs).",
    "Kyverno 1.13+ also accepts a per-rule validate.failureAction; spec.validationFailureAction still works.",
  ]);
  return `${head}\n---\n${docs.join("\n---\n")}\n`;
}

/* ------------------------------------------------------------------ */
/* OPA Gatekeeper                                                      */
/* ------------------------------------------------------------------ */

const REGO_POD_SPEC = `# Pod spec for Pods, workload controllers and CronJobs.
pod_spec := input.review.object.spec {
  input.review.object.kind == "Pod"
}

pod_spec := input.review.object.spec.template.spec {
  input.review.object.kind != "Pod"
  input.review.object.kind != "CronJob"
}

pod_spec := input.review.object.spec.jobTemplate.spec.template.spec {
  input.review.object.kind == "CronJob"
}

containers[c] {
  c := pod_spec.containers[_]
}

containers[c] {
  c := pod_spec.initContainers[_]
}`;

const GK_TEMPLATES = {
  blockRoot: {
    kind: "K8sRequireNonRoot",
    constraint: "require-non-root",
    rego: `violation[{"msg": msg}] {
  c := containers[_]
  not run_as_non_root(c)
  msg := sprintf("container %v must set securityContext.runAsNonRoot: true (on the container or the pod)", [c.name])
}

violation[{"msg": msg}] {
  c := containers[_]
  not c.securityContext.allowPrivilegeEscalation == false
  msg := sprintf("container %v must set securityContext.allowPrivilegeEscalation: false", [c.name])
}

run_as_non_root(c) {
  c.securityContext.runAsNonRoot == true
}

run_as_non_root(c) {
  pod_spec.securityContext.runAsNonRoot == true
  not c.securityContext.runAsNonRoot == false
}`,
  },
  blockPrivileged: {
    kind: "K8sBlockPrivileged",
    constraint: "block-privileged",
    rego: `violation[{"msg": msg}] {
  c := containers[_]
  c.securityContext.privileged == true
  msg := sprintf("privileged container %v is not allowed", [c.name])
}

violation[{"msg": msg}] {
  field := ["hostNetwork", "hostPID", "hostIPC"][_]
  pod_spec[field] == true
  msg := sprintf("%v: true is not allowed", [field])
}`,
  },
  requireResources: {
    kind: "K8sRequireResources",
    constraint: "require-requests-and-limits",
    rego: `# Requires resources.requests and resources.limits for both cpu and memory.
violation[{"msg": msg}] {
  c := containers[_]
  kind := ["requests", "limits"][_]
  resource := ["cpu", "memory"][_]
  not c.resources[kind][resource]
  msg := sprintf("container %v must set resources.%v.%v", [c.name, kind, resource])
}`,
  },
  restrictImages: {
    kind: "K8sAllowedImages",
    constraint: "allowed-images",
    params: true,
    rego: `violation[{"msg": msg}] {
  count(input.parameters.registries) > 0
  c := containers[_]
  not allowed_registry(c.image)
  msg := sprintf("container %v image %v is not from an allowed registry %v", [c.name, c.image, input.parameters.registries])
}

violation[{"msg": msg}] {
  c := containers[_]
  endswith(c.image, ":latest")
  msg := sprintf("container %v uses the :latest tag (%v); pin a version or a digest", [c.name, c.image])
}

violation[{"msg": msg}] {
  c := containers[_]
  not has_tag_or_digest(c.image)
  msg := sprintf("container %v image %v has no tag or digest (resolves to :latest)", [c.name, c.image])
}

allowed_registry(image) {
  prefix := input.parameters.registries[_]
  startswith(image, prefix)
}

has_tag_or_digest(image) {
  contains(image, "@")
}

has_tag_or_digest(image) {
  parts := split(image, "/")
  contains(parts[count(parts) - 1], ":")
}`,
  },
  readOnlyRootAndDropCaps: {
    kind: "K8sReadOnlyRootDropCaps",
    constraint: "read-only-root-drop-caps",
    rego: `violation[{"msg": msg}] {
  c := containers[_]
  not c.securityContext.readOnlyRootFilesystem == true
  msg := sprintf("container %v must set securityContext.readOnlyRootFilesystem: true", [c.name])
}

violation[{"msg": msg}] {
  c := containers[_]
  not drops_all(c)
  msg := sprintf("container %v must set securityContext.capabilities.drop: [\\"ALL\\"]", [c.name])
}

drops_all(c) {
  c.securityContext.capabilities.drop[_] == "ALL"
}`,
  },
  requireProbes: {
    kind: "K8sRequireProbes",
    constraint: "require-probes",
    noBatch: true,
    rego: `violation[{"msg": msg}] {
  not batch_workload
  c := pod_spec.containers[_]
  probe := ["livenessProbe", "readinessProbe"][_]
  not c[probe]
  msg := sprintf("container %v must define %v", [c.name, probe])
}

# Jobs, CronJobs and Pods owned by a Job are batch workloads: probes are skipped.
batch_workload {
  input.review.object.kind == "Job"
}

batch_workload {
  input.review.object.kind == "CronJob"
}

batch_workload {
  input.review.object.metadata.ownerReferences[_].kind == "Job"
}`,
  },
};

function gatekeeperDocs(id, cfg) {
  const t = GK_TEMPLATES[id];
  const pkg = t.kind.toLowerCase();
  const schema = t.params
    ? [
        "      validation:",
        "        openAPIV3Schema:",
        "          type: object",
        "          properties:",
        "            registries:",
        "              type: array",
        "              items:",
        "                type: string",
      ]
    : [];
  const template = [
    "apiVersion: templates.gatekeeper.sh/v1",
    "kind: ConstraintTemplate",
    "metadata:",
    `  name: ${pkg}`,
    "  annotations:",
    `    description: ${q(RULE_LABEL[id])}`,
    "spec:",
    "  crd:",
    "    spec:",
    "      names:",
    `        kind: ${t.kind}`,
    ...schema,
    "  targets:",
    "    - target: admission.k8s.gatekeeper.sh",
    "      rego: |",
    indent(`package ${pkg}\n\n${REGO_POD_SPEC}\n\n${t.rego}`, 8),
  ].join("\n");

  const kinds = [
    "      - apiGroups: [\"\"]",
    '        kinds: ["Pod"]',
    '      - apiGroups: ["apps"]',
    '        kinds: ["Deployment", "StatefulSet", "DaemonSet"]',
  ];
  if (!t.noBatch) kinds.push('      - apiGroups: ["batch"]', '        kinds: ["Job", "CronJob"]');
  const match = ["  match:", "    kinds:", ...kinds];
  if (cfg.scope === "namespace") match.push(`    namespaces: ${flow([cfg.namespace])}`);
  if (cfg.excludedNamespaces.length) match.push(`    excludedNamespaces: ${flow(cfg.excludedNamespaces)}`);
  const constraint = [
    "apiVersion: constraints.gatekeeper.sh/v1beta1",
    `kind: ${t.kind}`,
    "metadata:",
    `  name: ${t.constraint}`,
    "spec:",
    `  enforcementAction: ${cfg.enforcement === "enforce" ? "deny" : "dryrun"}`,
    ...match,
  ];
  if (t.params) constraint.push("  parameters:", `    registries: ${flow(cfg.allowedRegistries)}`);
  return [template, constraint.join("\n")];
}

export function gatekeeperYaml(input) {
  const cfg = ensureNormalized(input);
  const ids = enabledRules(cfg);
  if (!ids.length) return nothingSelected("OPA Gatekeeper", cfg);
  const head = header("OPA Gatekeeper (ConstraintTemplate + Constraint)", cfg, [
    `enforcementAction: ${cfg.enforcement === "enforce" ? "deny" : "dryrun"} (use "warn" to surface violations to kubectl without blocking).`,
    "Apply the ConstraintTemplates first and wait for their CRDs before applying the Constraints.",
    "Rego inspects Pod specs and pod templates (Deployments, StatefulSets, DaemonSets, Jobs, CronJobs).",
    ...(cfg.rules.restrictImages && !cfg.allowedRegistries.length ? ["No allowed registries configured: only the :latest / untagged checks are active."] : []),
  ]);
  return `${head}\n---\n${ids.flatMap((id) => gatekeeperDocs(id, cfg)).join("\n---\n")}\n`;
}

/* ------------------------------------------------------------------ */
/* ValidatingAdmissionPolicy (CEL)                                     */
/* ------------------------------------------------------------------ */

const celStr = (s) => `'${String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;

function vapValidations(cfg) {
  const v = [];
  const add = (expression, message) => v.push({ expression, message });
  const C = "variables.containers.all(c, ";
  const sc = "has(c.securityContext)";

  if (cfg.rules.blockRoot) {
    add(
      `${C}(${sc} && has(c.securityContext.runAsNonRoot)) ? c.securityContext.runAsNonRoot == true : (has(variables.podSpec.securityContext) && has(variables.podSpec.securityContext.runAsNonRoot) && variables.podSpec.securityContext.runAsNonRoot == true))`,
      "Running as root is not allowed: set securityContext.runAsNonRoot: true on the pod or on every container."
    );
    add(
      `${C}${sc} && has(c.securityContext.allowPrivilegeEscalation) && c.securityContext.allowPrivilegeEscalation == false)`,
      "Every container must set securityContext.allowPrivilegeEscalation: false."
    );
  }
  if (cfg.rules.blockPrivileged) {
    add(
      `${C}!${sc} || !has(c.securityContext.privileged) || c.securityContext.privileged == false)`,
      "Privileged containers are not allowed."
    );
    add(
      "!(has(variables.podSpec.hostNetwork) && variables.podSpec.hostNetwork) && !(has(variables.podSpec.hostPID) && variables.podSpec.hostPID) && !(has(variables.podSpec.hostIPC) && variables.podSpec.hostIPC)",
      "hostNetwork, hostPID and hostIPC are not allowed."
    );
  }
  if (cfg.rules.requireResources) {
    add(
      `${C}has(c.resources) && has(c.resources.requests) && has(c.resources.limits) && 'cpu' in c.resources.requests && 'memory' in c.resources.requests && 'cpu' in c.resources.limits && 'memory' in c.resources.limits)`,
      "Every container must set CPU and memory resources.requests and resources.limits."
    );
  }
  if (cfg.rules.restrictImages) {
    if (cfg.allowedRegistries.length) {
      add(
        `${C}[${cfg.allowedRegistries.map(celStr).join(", ")}].exists(r, c.image.startsWith(r)))`,
        `Images must come from an allowed registry: ${cfg.allowedRegistries.join(", ")}`
      );
    }
    add(`${C}!c.image.endsWith(':latest'))`, "The :latest tag is not allowed. Pin a version or a digest.");
    add(`${C}c.image.contains('@') || c.image.matches(':[^/]+$'))`, "An image tag or digest is required (untagged images resolve to :latest).");
  }
  if (cfg.rules.readOnlyRootAndDropCaps) {
    add(
      `${C}${sc} && has(c.securityContext.readOnlyRootFilesystem) && c.securityContext.readOnlyRootFilesystem == true)`,
      "Every container must set securityContext.readOnlyRootFilesystem: true."
    );
    add(
      `${C}${sc} && has(c.securityContext.capabilities) && has(c.securityContext.capabilities.drop) && c.securityContext.capabilities.drop.exists(d, d == 'ALL'))`,
      'Every container must drop ALL capabilities (securityContext.capabilities.drop: ["ALL"]).'
    );
  }
  if (cfg.rules.requireProbes) {
    add(
      "variables.isBatch || variables.podSpec.containers.all(c, has(c.livenessProbe) && has(c.readinessProbe))",
      "Every container of a long-running workload must define livenessProbe and readinessProbe."
    );
  }
  return v;
}

export function vapYaml(input) {
  const cfg = ensureNormalized(input);
  if (!enabledRules(cfg).length) return nothingSelected("ValidatingAdmissionPolicy", cfg);
  const name = "pod-security-guardrails";
  const rr = (group, resources) =>
    [
      `      - apiGroups: [${q(group)}]`,
      '        apiVersions: ["v1"]',
      '        operations: ["CREATE", "UPDATE"]',
      `        resources: ${flow(resources)}`,
    ].join("\n");
  const variables = [
    "    - name: podSpec",
    "      expression: >-",
    "        object.kind == 'Pod' ? object.spec :",
    "        object.kind == 'CronJob' ? object.spec.jobTemplate.spec.template.spec :",
    "        object.spec.template.spec",
    "    - name: containers",
    "      expression: >-",
    "        variables.podSpec.containers +",
    "        (has(variables.podSpec.initContainers) ? variables.podSpec.initContainers : [])",
  ];
  if (cfg.rules.requireProbes) {
    variables.push(
      "    - name: isBatch",
      "      expression: >-",
      "        object.kind == 'Job' || object.kind == 'CronJob' ||",
      "        (has(object.metadata.ownerReferences) && object.metadata.ownerReferences.exists(r, r.kind == 'Job'))"
    );
  }
  const validations = vapValidations(cfg).flatMap((x) => [
    "    - expression: >-",
    `        ${x.expression}`,
    `      message: ${q(x.message)}`,
    "      reason: Forbidden",
  ]);
  const policy = [
    "apiVersion: admissionregistration.k8s.io/v1",
    "kind: ValidatingAdmissionPolicy",
    "metadata:",
    `  name: ${name}`,
    "spec:",
    "  failurePolicy: Fail",
    "  matchConstraints:",
    "    resourceRules:",
    rr("", ["pods"]),
    rr("apps", ["deployments", "statefulsets", "daemonsets"]),
    rr("batch", ["jobs", "cronjobs"]),
    "  variables:",
    ...variables,
    "  validations:",
    ...validations,
  ].join("\n");

  const nsSel =
    cfg.scope === "namespace"
      ? ["        - key: kubernetes.io/metadata.name", "          operator: In", `          values: ${flow([cfg.namespace])}`]
      : cfg.excludedNamespaces.length
        ? ["        - key: kubernetes.io/metadata.name", "          operator: NotIn", `          values: ${flow(cfg.excludedNamespaces)}`]
        : [];
  const binding = [
    "apiVersion: admissionregistration.k8s.io/v1",
    "kind: ValidatingAdmissionPolicyBinding",
    "metadata:",
    `  name: ${name}-binding`,
    "spec:",
    `  policyName: ${name}`,
    `  validationActions: ${cfg.enforcement === "enforce" ? '["Deny"]' : '["Audit", "Warn"]'}`,
    ...(nsSel.length ? ["  matchResources:", "    namespaceSelector:", "      matchExpressions:", ...nsSel] : []),
  ].join("\n");

  const head = header("ValidatingAdmissionPolicy (admissionregistration.k8s.io/v1, Kubernetes 1.30+)", cfg, [
    "Native CEL: no extra controller. Covers Pods, Deployments, StatefulSets, DaemonSets, Jobs and CronJobs.",
    `validationActions: ${cfg.enforcement === "enforce" ? "Deny" : "Audit + Warn (audit annotations and kubectl warnings, nothing is blocked)"}.`,
    ...(cfg.rules.restrictImages && !cfg.allowedRegistries.length ? ["No allowed registries configured: only the :latest / untagged checks are active."] : []),
  ]);
  return `${head}\n---\n${policy}\n---\n${binding}\n`;
}

/* ------------------------------------------------------------------ */
/* Pod Security Admission                                              */
/* ------------------------------------------------------------------ */

const COVERAGE_WORD = { full: "covered", partial: "PARTIAL", none: "NOT covered" };

export function psaYaml(input) {
  const cfg = ensureNormalized(input);
  const { enforce, audit, warn, version } = cfg.psa;
  const ns = cfg.namespace;
  const cov = coverageFor(cfg).filter((r) => r.id !== "networkIsolation");
  const selected = cov.filter((r) => r.selected);
  const notes = {
    blockRoot: "restricted only; baseline does not require runAsNonRoot",
    readOnlyRootAndDropCaps: 'restricted requires capabilities.drop: ["ALL"] but never readOnlyRootFilesystem',
    blockPrivileged: "baseline and restricted",
  };
  const coverageLines = selected.length
    ? selected.map(
        (r) =>
          `#   - ${RULE_LABEL[r.id]}: ${COVERAGE_WORD[r.psa]} at enforce=${enforce}${notes[r.id] ? ` (${notes[r.id]})` : ""}${
            r.psa !== "full" ? " -> use Kyverno, Gatekeeper or CEL for this rule" : ""
          }`
      )
    : ["#   - No pod rule selected above."];
  const gap = selected.filter((r) => r.psaNeedsRestricted);
  const label = (mode, level) => [`pod-security.kubernetes.io/${mode}=${level}`, `pod-security.kubernetes.io/${mode}-version=${version}`];
  const kubectl = [...label("enforce", enforce), ...label("audit", audit), ...label("warn", warn)];

  return [
    header("Pod Security Admission (namespace labels)", cfg, [
      "PSA is built into the API server: no controller to install. It only knows the",
      "privileged / baseline / restricted profiles, so it is coarse but free.",
      ...(cfg.scope === "cluster"
        ? ["Scope is cluster-wide: label every application namespace (or set cluster defaults in the", "PodSecurity AdmissionConfiguration). This manifest labels the example namespace below."]
        : []),
    ]),
    "#",
    "# Coverage of the selected rules by PSA:",
    ...coverageLines,
    "#   - NetworkPolicy isolation: NOT covered (PSA does not touch the network; see the NetworkPolicy tab)",
    ...(gap.length
      ? [
          "#",
          `# GAP: enforce=${enforce} does not enforce ${gap.map((r) => RULE_LABEL[r.id]).join("; ")}.`,
          "# Raise pod-security.kubernetes.io/enforce to restricted to close it.",
          ...(gap.some((r) => r.id === "readOnlyRootAndDropCaps")
            ? ["# readOnlyRootFilesystem is never required by PSA: keep Kyverno, Gatekeeper or CEL for it."]
            : []),
        ]
      : []),
    "#",
    "# Preview the impact on running pods before changing labels (server-side dry run):",
    `#   kubectl label --dry-run=server --overwrite namespace ${ns} pod-security.kubernetes.io/enforce=${enforce}`,
    "---",
    "apiVersion: v1",
    "kind: Namespace",
    "metadata:",
    `  name: ${ns}`,
    "  labels:",
    `    pod-security.kubernetes.io/enforce: ${enforce}`,
    `    pod-security.kubernetes.io/enforce-version: ${version}`,
    `    pod-security.kubernetes.io/audit: ${audit}`,
    `    pod-security.kubernetes.io/audit-version: ${version}`,
    `    pod-security.kubernetes.io/warn: ${warn}`,
    `    pod-security.kubernetes.io/warn-version: ${version}`,
    "",
    "# Or label an existing namespace in place:",
    `# kubectl label namespace ${ns} \\`,
    ...kubectl.map((l) => `#   ${l} \\`),
    "#   --overwrite",
    "",
  ].join("\n");
}

/* ------------------------------------------------------------------ */
/* NetworkPolicy                                                       */
/* ------------------------------------------------------------------ */

export function networkPolicyYaml(input) {
  const cfg = ensureNormalized(input);
  const np = cfg.networkPolicy;
  const ns = cfg.namespace;
  const head = header("NetworkPolicy (networking.k8s.io/v1)", cfg, [
    `Namespaced to "${ns}". Starter policies: tighten podSelectors and ports for production.`,
    "Requires a CNI that enforces NetworkPolicy (Calico, Cilium, AWS VPC CNI network policy, GKE Dataplane V2...).",
    ...(cfg.scope === "cluster" ? ["NetworkPolicy is per namespace: repeat these documents for every namespace you isolate."] : []),
    ...(np.invalidCidrs.length ? [`Ignored invalid egress entries: ${np.invalidCidrs.join(", ")}`] : []),
  ], { podRules: false });
  if (!anyNetworkPolicy(np)) {
    return `${head}\n#\n# No NetworkPolicy option is selected, so there is nothing to generate.\n# Enable default deny and the allow rules you need above.\n`;
  }

  const docs = [];
  const doc = (name, comment, spec) =>
    docs.push([...comment.map((c) => `# ${c}`), "apiVersion: networking.k8s.io/v1", "kind: NetworkPolicy", "metadata:", `  name: ${name}`, `  namespace: ${ns}`, "spec:", ...spec].join("\n"));
  const egressIsolationNote = np.defaultDenyEgress
    ? []
    : ["Note: any policy with policyTypes Egress isolates the selected pods for egress,", "so even without default-deny egress, egress is limited to what these policies allow."];
  const ingressIsolationNote = np.defaultDenyIngress
    ? []
    : ["Note: any policy with policyTypes Ingress isolates the selected pods for ingress,", "so even without default-deny ingress, ingress is limited to what these policies allow."];

  if (np.defaultDenyIngress) {
    doc("default-deny-ingress", ["Deny all ingress to every pod in the namespace."], ["  podSelector: {}", "  policyTypes:", "    - Ingress"]);
  }
  if (np.defaultDenyEgress) {
    doc("default-deny-egress", ["Deny all egress from every pod in the namespace."], ["  podSelector: {}", "  policyTypes:", "    - Egress"]);
  }
  if (np.allowDns) {
    doc(
      "allow-dns",
      ["Allow DNS to kube-dns / CoreDNS (label k8s-app: kube-dns) in kube-system, UDP and TCP 53.", ...egressIsolationNote],
      [
        "  podSelector: {}",
        "  policyTypes:",
        "    - Egress",
        "  egress:",
        "    - to:",
        "        - namespaceSelector:",
        "            matchLabels:",
        "              kubernetes.io/metadata.name: kube-system",
        "          podSelector:",
        "            matchLabels:",
        "              k8s-app: kube-dns",
        "      ports:",
        "        - protocol: UDP",
        "          port: 53",
        "        - protocol: TCP",
        "          port: 53",
      ]
    );
  }
  if (np.allowSameNamespace) {
    const withEgress = np.defaultDenyEgress;
    doc(
      "allow-same-namespace",
      [`Allow traffic between pods of the "${ns}" namespace${withEgress ? " (ingress and egress)" : " (ingress)"}.`, ...ingressIsolationNote],
      [
        "  podSelector: {}",
        "  policyTypes:",
        "    - Ingress",
        ...(withEgress ? ["    - Egress"] : []),
        "  ingress:",
        "    - from:",
        "        - podSelector: {}",
        ...(withEgress ? ["  egress:", "    - to:", "        - podSelector: {}"] : []),
      ]
    );
  }
  if (np.allowFromIngressNs) {
    doc(
      "allow-from-ingress-controller",
      [
        `Allow ingress from every pod in the "${np.ingressNamespace}" namespace (ingress controller).`,
        "Tighten with a podSelector for the controller pods and the app ports in production.",
        ...ingressIsolationNote,
      ],
      [
        "  podSelector: {}",
        "  policyTypes:",
        "    - Ingress",
        "  ingress:",
        "    - from:",
        "        - namespaceSelector:",
        "            matchLabels:",
        `              kubernetes.io/metadata.name: ${np.ingressNamespace}`,
      ]
    );
  }
  if (np.egress.length) {
    doc(
      "allow-egress-cidrs",
      ["Allow egress to the listed CIDRs (cluster DNS is handled by allow-dns).", ...egressIsolationNote],
      [
        "  podSelector: {}",
        "  policyTypes:",
        "    - Egress",
        "  egress:",
        ...np.egress.flatMap((e) => [
          "    - to:",
          "        - ipBlock:",
          `            cidr: ${e.cidr}`,
          ...(e.port ? ["      ports:", "        - protocol: TCP", `          port: ${e.port}`] : []),
        ]),
      ]
    );
  }
  return `${head}\n---\n${docs.join("\n---\n")}\n`;
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export function generatePolicies(config = {}) {
  const cfg = normalizeConfig(config);
  return {
    config: cfg,
    kyverno: kyvernoYaml(cfg),
    gatekeeper: gatekeeperYaml(cfg),
    vap: vapYaml(cfg),
    psa: psaYaml(cfg),
    networkPolicy: networkPolicyYaml(cfg),
    coverage: coverageFor(cfg),
  };
}
