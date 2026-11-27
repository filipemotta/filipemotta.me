import { useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  AWS_INSTANCES,
  AWS_SUBNET_PREFIXES,
  GCP_MACHINES,
  GKE_MAX_PODS_OPTIONS,
  GKE_SERVICES_OPTIONS,
  HOURS_PER_MONTH,
  NODE_SUBNET_HEADROOM,
  calculateAws,
  calculateGcp,
  findAwsInstance,
  parseCidr,
} from "../../utils/k8sSizing";
import { awsTerraform, eniConfigYaml, gcpTerraform, instanceSize, karpenterYaml, resolveFamilies, safeName } from "../../utils/k8sCodegen";
import CodeTabs from "./CodeTabs";
import { Badge, Banner, Field, NumberInput, Panel, Segmented, SliderField, Stat, Toggle, UtilBar, fmt, inputClass } from "./ui";

const DEFAULTS = {
  provider: "aws",
  desiredPods: 120,
  cpuPerPodM: 250,
  memPerPodMiB: 512,
  overheadPct: 15,
  azCount: 3,
  spotRatioPct: 50,
  surgePct: 25,
  clusterName: "my-cluster",
  // AWS
  instanceType: "m6i.xlarge",
  prefixDelegation: false,
  raiseCap: false,
  customNetworking: false,
  vpcCidr: "10.0.0.0/16",
  subnetPrefix: "auto",
  secondaryCidr: "100.64.0.0/16",
  // GCP
  machineType: "e2-standard-4",
  maxPodsPerNode: 110,
  servicesCount: 1024,
  nodeBase: "10.0.0.0",
  podBase: "10.4.0.0",
  servicesBase: "10.8.0.0",
  masterCidr: "172.16.0.0/28",
};

// Distinct EC2 families in the catalog, in catalog order: [{ family, arch }]
const AWS_FAMILIES = [...new Map(AWS_INSTANCES.map((i) => [i.family, { family: i.family, arch: i.arch }])).values()];
const familyOf = (type) => findAwsInstance(type)?.family || String(type).split(".")[0];

export default function K8sSizingCalculator({ initial }) {
  const { t, lang } = useLanguage();
  const k = (key) => t(`tools.k8s.${key}`);
  const [s, setS] = useState(() => {
    const merged = { ...DEFAULTS, ...initial };
    return { ...merged, karpenterFamilies: merged.karpenterFamilies?.length ? merged.karpenterFamilies : [familyOf(merged.instanceType)] };
  });
  const set = (key) => (value) =>
    setS((prev) => {
      const next = { ...prev, [key]: value };
      // A new reference instance always keeps its family allowed in the NodePool.
      if (key === "instanceType") {
        const fam = familyOf(value);
        if (!prev.karpenterFamilies.includes(fam)) next.karpenterFamilies = [...prev.karpenterFamilies, fam];
      }
      return next;
    });

  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const num = (v, digits = 0) =>
    Number.isFinite(v) ? new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(v) : "∞";
  const usd = (v, digits = 0) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
  const pct = (v) => (Number.isFinite(v) ? `${num(v * 100, 1)}%` : "—");

  const isAws = s.provider === "aws";
  const res = useMemo(() => (isAws ? calculateAws(s) : calculateGcp(s)), [isAws, s]);
  const code = useMemo(() => buildCode(res, s), [res, s]);

  const spec = isAws ? res.instance : res.machine;
  const nodesValid = res.nodes.valid;

  const bottleneckLabel =
    res.pods.bottleneck === "cpu"
      ? k("bottleneck.cpu")
      : res.pods.bottleneck === "memory"
        ? k("bottleneck.memory")
        : isAws
          ? k("bottleneck.podsAws")
          : k("bottleneck.podsGcp");

  return (
    <div className="space-y-6">
      {/* Provider */}
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="stat-label">{k("provider.label")}</p>
          <p className="mt-1 text-[15px] text-slate-300">{k("provider.hint")}</p>
        </div>
        <Segmented
          label={k("provider.label")}
          size="lg"
          value={s.provider}
          onChange={set("provider")}
          options={[
            { value: "aws", label: k("provider.aws") },
            { value: "gcp", label: k("provider.gcp") },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Inputs */}
        <div className="space-y-6 lg:col-span-7">
          <Panel eyebrow={k("workload.eyebrow")} title={k("workload.title")} description={k("workload.description")}>
            <div className="space-y-5">
              <SliderField id="desired-pods" label={k("workload.pods")} hint={k("workload.podsHint")} value={s.desiredPods} onChange={set("desiredPods")} min={1} max={5000} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={k("workload.cpu")} htmlFor="cpu-per-pod" hint={k("workload.cpuHint")}>
                  <NumberInput id="cpu-per-pod" value={s.cpuPerPodM} onChange={set("cpuPerPodM")} min={1} max={64000} step={10} suffix="mCPU" />
                </Field>
                <Field label={k("workload.mem")} htmlFor="mem-per-pod" hint={k("workload.memHint")}>
                  <NumberInput id="mem-per-pod" value={s.memPerPodMiB} onChange={set("memPerPodMiB")} min={1} max={262144} step={32} suffix="MiB" />
                </Field>
              </div>
              <SliderField id="overhead" label={k("workload.overhead")} hint={k("workload.overheadHint")} value={s.overheadPct} onChange={set("overheadPct")} min={0} max={50} suffix="%" />
              <SliderField id="spot" label={k("workload.spot")} hint={k("workload.spotHint")} value={s.spotRatioPct} onChange={set("spotRatioPct")} min={0} max={100} step={5} suffix="%" />
              <SliderField id="surge" label={k("workload.surge")} hint={k("workload.surgeHint")} value={s.surgePct} onChange={set("surgePct")} min={0} max={100} step={5} suffix="%" />
              <Field label={isAws ? k("workload.azsAws") : k("workload.azsGcp")} hint={k("workload.azsHint")}>
                <Segmented
                  label={isAws ? k("workload.azsAws") : k("workload.azsGcp")}
                  value={s.azCount}
                  onChange={set("azCount")}
                  options={[2, 3].map((n) => ({ value: n, label: String(n) }))}
                />
              </Field>
            </div>
          </Panel>

          {isAws ? (
            <AwsNodePanel s={s} set={set} res={res} k={k} usd={usd} />
          ) : (
            <GcpNodePanel s={s} set={set} res={res} k={k} usd={usd} num={num} />
          )}
        </div>

        {/* Summary */}
        <aside className="lg:col-span-5" aria-label={k("kpi.aria")}>
          <div className="space-y-4 lg:sticky lg:top-24">
            {!nodesValid && (
              <Banner tone="error" title={k("errors.noPodsTitle")}>
                {fmt(k("errors.noPodsText"), { type: spec.type })}
              </Banner>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="surface-card col-span-2 p-4 sm:col-span-1">
                <p className="stat-label">{k("kpi.nodes")}</p>
                <p className="mt-2 font-display text-4xl font-bold text-white">{nodesValid ? num(res.nodes.withSurge) : "—"}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {fmt(k("kpi.nodesSub"), { steady: num(res.nodes.steady), surge: s.surgePct })}
                </p>
                {res.nodes.azFloorApplied && (
                  <p className="mt-2 text-sm text-amber-200">{fmt(k("kpi.azFloor"), { n: s.azCount })}</p>
                )}
              </div>

              <div className="surface-card col-span-2 p-4 sm:col-span-1">
                <p className="stat-label">{k("kpi.podsPerNode")}</p>
                <p className="mt-2 font-display text-4xl font-bold text-white">
                  {num(res.pods.effective)}
                  <span className="text-xl text-muted"> / {num(res.limit.limit)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-300">{isAws ? k("kpi.podsPerNodeSubAws") : k("kpi.podsPerNodeSubGcp")}</p>
                {nodesValid && (
                  <p className="mt-1 text-sm text-slate-300">
                    {fmt(k("kpi.avgPods"), { n: num(s.desiredPods / res.nodes.steady, 1) })}
                  </p>
                )}
              </div>

              <div className="surface-card col-span-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="stat-label">{k("kpi.bottleneck")}</p>
                  <Badge tone={res.pods.bottleneck === "pods" ? "warn" : "signal"}>{bottleneckLabel}</Badge>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["cpu", k("kpi.fitCpu"), res.pods.podsFromCpu],
                    ["memory", k("kpi.fitMem"), res.pods.podsFromMem],
                    ["pods", isAws ? k("kpi.fitCni") : k("kpi.fitMaxPods"), res.limit.limit],
                  ].map(([key, label, value]) => (
                    <div
                      key={key}
                      className={`rounded-[10px] p-2 ring-1 ${
                        res.pods.bottleneck === key ? "bg-accent/10 ring-accent/50" : "bg-white/[0.02] ring-white/[0.12]"
                      }`}
                    >
                      <dt className="stat-label">{label}</dt>
                      <dd className="mt-0.5 font-mono text-sm text-white">{num(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="surface-card col-span-2 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="stat-label">{isAws ? k("kpi.ipAws") : k("kpi.ipGcp")}</p>
                  <p className="font-mono text-sm text-white">{pct(res.ip.utilization)}</p>
                </div>
                <div className="mt-3">
                  <UtilBar value={res.ip.utilization} label={isAws ? k("kpi.ipAws") : k("kpi.ipGcp")} />
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  {fmt(k("kpi.ipSub"), { used: num(res.ip.used), available: num(res.ip.available) })}
                </p>
                {nodesValid && !(res.ip.utilization <= 1) && <p className="mt-2 text-sm text-red-300">{k("kpi.ipNoFit")}</p>}
                {res.ip.utilization > 0.8 && res.ip.utilization <= 1 && (
                  <p className="mt-2 text-sm text-amber-200">{isAws ? k("kpi.ipHighAws") : k("kpi.ipHighGcp")}</p>
                )}
                {isAws && res.secondaryRequired && <p className="mt-2 text-sm text-signal">{k("kpi.ipSecondary")}</p>}
              </div>

              <div className="surface-card col-span-2 p-4">
                <p className="stat-label">{k("kpi.cost")}</p>
                <p className="mt-2 font-display text-4xl font-bold text-white">
                  {usd(res.cost.total)}
                  <span className="text-base font-medium text-muted">{k("kpi.perMonth")}</span>
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <CostRow label={isAws ? k("kpi.costControlAws") : k("kpi.costControlGcp")} value={usd(res.cost.controlPlaneMonthly)} />
                  <CostRow
                    label={fmt(k("kpi.costOd"), { n: res.cost.odNodes, price: usd(spec.od, 4) })}
                    value={usd(res.cost.odMonthly)}
                  />
                  <CostRow
                    label={fmt(k("kpi.costSpot"), { n: res.cost.spotNodes, price: usd(spec.spot, 4) })}
                    value={usd(res.cost.spotMonthly)}
                  />
                </dl>
                <p className="mt-3 text-[13px] leading-relaxed text-slate-300">
                  {fmt(isAws ? k("kpi.priceNoteAws") : k("kpi.priceNoteGcp"), { hours: HOURS_PER_MONTH })}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {isAws ? (
        <AwsCidrPanel s={s} set={set} res={res} k={k} num={num} />
      ) : (
        <GcpCidrPanel s={s} set={set} res={res} k={k} num={num} />
      )}

      <Panel eyebrow={k("code.eyebrow")} title={k("code.title")} description={isAws ? k("code.descriptionAws") : k("code.descriptionGcp")}>
        <div className="mb-4 max-w-sm">
          <Field label={k("code.clusterName")} htmlFor="cluster-name" hint={fmt(k("code.clusterNameHint"), { name: safeName(s.clusterName) })}>
            <input id="cluster-name" className={inputClass} value={s.clusterName} onChange={(e) => set("clusterName")(e.target.value)} spellCheck={false} />
          </Field>
        </div>
        {code.length > 0 && hasPlanIssues(res) && (
          <div className="mb-4">
            <Banner tone="warn">{k("code.issuesWarning")}</Banner>
          </div>
        )}
        {code.length > 0 && isAws && (
          <KarpenterFamilies
            k={k}
            selected={s.karpenterFamilies}
            refType={res.instance.type}
            refFamily={res.instance.family}
            onChange={set("karpenterFamilies")}
          />
        )}
        {code.length > 0 ? (
          <CodeTabs
            tabs={code.map((c) => ({ ...c, label: k(`code.tabs.${c.id}`) }))}
            labels={{ tablist: k("code.title"), copy: k("code.copy"), copied: k("code.copied"), copyFailed: k("code.copyFailed") }}
          />
        ) : (
          <Banner tone="error">{k("code.invalid")}</Banner>
        )}
      </Panel>
    </div>
  );
}

/** Banner + toggle chips choosing the EC2 families allowed in the Karpenter NodePool. YAML only. */
function KarpenterFamilies({ k, selected, refType, refFamily, onChange }) {
  const [notice, setNotice] = useState(false);
  const sel = resolveFamilies(selected, refFamily, AWS_INSTANCES);

  const toggle = (family) => {
    if (selected.includes(family)) {
      if (selected.length === 1) {
        // Never allow an empty selection: fall back to the reference family.
        if (family !== refFamily) onChange([refFamily]);
        setNotice(true);
        return;
      }
      onChange(selected.filter((f) => f !== family));
    } else {
      onChange([...selected, family]);
    }
    setNotice(false);
  };

  return (
    <div className="mb-5 space-y-4">
      <Banner tone="info" title={k("karpenter.bannerTitle")}>
        {fmt(k("karpenter.bannerBody"), { type: refType })}
      </Banner>

      <div>
        <p id="karpenter-families-label" className="mb-2 block text-[15px] font-medium text-slate-100">
          {k("karpenter.familiesLabel")}
        </p>
        <div role="group" aria-labelledby="karpenter-families-label" className="flex flex-wrap gap-2">
          {AWS_FAMILIES.map(({ family, arch }) => {
            const on = selected.includes(family);
            return (
              <button
                key={family}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(family)}
                className={`rounded-[10px] px-3.5 py-2 font-mono text-sm transition-colors ${
                  on ? "bg-accent/20 text-white ring-1 ring-accent" : "bg-white/[0.04] text-slate-300 ring-1 ring-white/15 hover:text-white"
                }`}
              >
                {on ? "✓ " : ""}
                {family} <span className={on ? "text-signal" : "text-slate-400"}>({arch})</span>
                {family === refFamily && <span className="ml-1.5 text-[13px] text-slate-400">· {k("karpenter.reference")}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {fmt(k("karpenter.familiesHint"), { size: instanceSize(refType), families: sel.families.join(", ") })}
        </p>
        {notice && (
          <p className="mt-2 text-sm text-amber-200" role="status">
            {fmt(k("karpenter.lastFamily"), { family: refFamily })}
          </p>
        )}
      </div>

      {sel.mixedArch && <Banner tone="warn">{k("karpenter.mixedArchWarning")}</Banner>}
    </div>
  );
}

function CostRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono text-white">{value}</dd>
    </div>
  );
}

function hasPlanIssues(res) {
  if (res.provider === "gcp") return res.issues.length > 0;
  const c = res.cidr;
  if (!c || c.error) return true;
  if (!c.primary.fits) return true;
  return Boolean(c.secondary && (c.secondary.error || !c.secondary.fits));
}

function buildCode(res, s) {
  if (!res.nodes.valid) return [];
  if (res.provider === "aws") {
    const karpenter = { id: "karpenter", filename: "karpenter-nodepool.yaml", code: karpenterYaml(res, { ...s, families: s.karpenterFamilies }) };
    if (!res.cidr || res.cidr.error || !res.cidr.primary.fitsInVpc) return [karpenter];
    const tabs = [
      karpenter,
      { id: "terraformAws", filename: "vpc.tf", code: awsTerraform(res, s) },
    ];
    const eni = res.secondaryRequired ? eniConfigYaml(res) : "";
    if (eni) tabs.push({ id: "eniConfig", filename: "eniconfig.yaml", code: eni });
    return tabs;
  }
  if (res.issues.some((i) => i.type === "baseInvalid" || i.type === "masterInvalid")) return [];
  return [{ id: "terraformGcp", filename: "gke.tf", code: gcpTerraform(res, s) }];
}

/* ------------------------------------------------------------------ */
/* AWS                                                                 */
/* ------------------------------------------------------------------ */

function AwsNodePanel({ s, set, res, k, usd }) {
  const inst = res.instance;
  const podEnis = res.customNetworking ? inst.enis - 1 : inst.enis;
  const formula = s.prefixDelegation
    ? `${podEnis} × ((${inst.ipsPerEni} − 1) × 16) + 2 = ${res.limit.theoretical}`
    : `${podEnis} × (${inst.ipsPerEni} − 1) + 2 = ${res.limit.theoretical}`;

  return (
    <Panel eyebrow={k("aws.eyebrow")} title={k("aws.title")} description={k("aws.description")}>
      <div className="space-y-5">
        <Field label={k("aws.instance")} htmlFor="instance-type" hint={fmt(k("aws.instanceHint"), { od: usd(inst.od, 4), spot: usd(inst.spot, 4) })}>
          <select id="instance-type" className={inputClass} value={s.instanceType} onChange={(e) => set("instanceType")(e.target.value)}>
            {AWS_INSTANCES.map((i) => (
              <option key={i.type} value={i.type}>
                {i.type} · {i.vcpu} vCPU · {i.ramGiB} GiB · {i.enis} ENI × {i.ipsPerEni} IP{i.arch === "arm64" ? " · arm64" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label={k("aws.prefixDelegation")} hint={k("aws.prefixDelegationHint")}>
          <Segmented
            label={k("aws.prefixDelegation")}
            value={s.prefixDelegation}
            onChange={set("prefixDelegation")}
            options={[
              { value: false, label: k("aws.pdOff") },
              { value: true, label: k("aws.pdOn") },
            ]}
          />
        </Field>

        <div className="rounded-[12px] bg-ink/60 p-3 ring-1 ring-white/[0.12]">
          <p className="stat-label">{k("aws.formula")}</p>
          <p className="mt-1 break-words font-mono text-sm text-white">maxPods = {formula}</p>
          <p className="mt-1 text-sm text-slate-300">
            {res.limit.capped
              ? fmt(k("aws.formulaCapped"), { cap: res.limit.cap, limit: res.limit.limit })
              : fmt(k("aws.formulaUncapped"), { limit: res.limit.limit })}
          </p>
        </div>

        {res.limit.canRaiseCap && (
          <Toggle id="raise-cap" checked={s.raiseCap} onChange={set("raiseCap")} label={k("aws.raiseCap")} hint={k("aws.raiseCapHint")} />
        )}

        <Toggle
          id="custom-networking"
          checked={s.customNetworking}
          onChange={set("customNetworking")}
          label={k("aws.customNetworking")}
          hint={k("aws.customNetworkingHint")}
        />
      </div>
    </Panel>
  );
}

function SubnetTable({ rows, k, num }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[460px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.14]">
            {[k("cidr.colZone"), k("cidr.colCidr"), k("cidr.colUsable"), k("cidr.colRequired")].map((h) => (
              <th key={h} scope="col" className="stat-label py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.zone} className="border-b border-white/[0.08] last:border-0">
              <td className="py-2 pr-3 font-mono text-muted">{r.zone}</td>
              <td className="py-2 pr-3 font-mono text-white">{r.cidr}</td>
              <td className="py-2 pr-3 font-mono text-white">{num(r.usable)}</td>
              <td className={`py-2 pr-3 font-mono ${r.required > r.usable ? "text-red-300" : "text-white"}`}>{num(r.required)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AwsCidrPanel({ s, set, res, k, num }) {
  const cidr = res.cidr;
  const vpcParsed = parseCidr(s.vpcCidr);
  const vpcError = !vpcParsed ? k("cidr.vpcInvalid") : vpcParsed.prefix < 16 || vpcParsed.prefix > 28 ? k("cidr.vpcPrefixRange") : null;
  const primary = cidr && !cidr.error ? cidr.primary : null;
  const sec = cidr && !cidr.error ? cidr.secondary : null;
  const pd = s.prefixDelegation;

  const prefixOptions = [
    { value: "auto", label: primary?.autoPrefix ? fmt(k("cidr.autoWith"), { p: primary.autoPrefix }) : k("cidr.auto") },
    ...AWS_SUBNET_PREFIXES.map((p) => ({ value: p, label: `/${p}` })),
  ];

  return (
    <Panel eyebrow={k("cidr.eyebrow")} title={k("cidr.titleAws")} description={k("cidr.descriptionAws")}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={k("cidr.vpc")} htmlFor="vpc-cidr" hint={vpcParsed && !vpcParsed.aligned ? fmt(k("cidr.normalized"), { cidr: vpcParsed.cidr }) : k("cidr.vpcHint")} error={vpcError}>
          <input id="vpc-cidr" className={inputClass} value={s.vpcCidr} onChange={(e) => set("vpcCidr")(e.target.value)} spellCheck={false} aria-invalid={Boolean(vpcError)} />
        </Field>
        <Field label={k("cidr.subnetPrefix")} hint={k("cidr.subnetPrefixHint")}>
          <Segmented label={k("cidr.subnetPrefix")} value={s.subnetPrefix} onChange={set("subnetPrefix")} options={prefixOptions} />
          {s.subnetPrefix !== "auto" && (
            <button type="button" onClick={() => set("subnetPrefix")("auto")} className="mt-2 text-sm text-accent hover:underline">
              {k("cidr.autoRecommend")}
            </button>
          )}
        </Field>
      </div>

      <p className="mt-5 rounded-[12px] bg-white/[0.02] p-3.5 text-sm leading-relaxed text-slate-300 ring-1 ring-white/[0.12]">
        {res.secondaryRequired ? fmt(k("cidr.modelCustom"), { headroom: NODE_SUBNET_HEADROOM * 100 }) : pd ? k("cidr.modelPd") : k("cidr.modelOff")}
      </p>

      {res.nodes.valid && primary && (
        <div className="mt-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label={k("cidr.nodesPerAz")} value={num(cidr.nodesPerAz)} />
            <Stat
              label={k("cidr.ipsPerNode")}
              value={num(res.perNode.primary + res.perNode.pods)}
              sub={res.secondaryRequired ? fmt(k("cidr.ipsPerNodeSplit"), { primary: res.perNode.primary, pods: num(res.perNode.pods) }) : null}
            />
            <Stat label={k("cidr.requiredTotal")} value={num(primary.totalRequired + (sec && !sec.error ? sec.totalRequired : 0))} />
            <Stat label={k("cidr.subnetSize")} value={`/${primary.prefix}`} sub={fmt(k("cidr.usableEach"), { n: num(primary.usable) })} />
          </div>

          {!primary.fitsInVpc && (
            <Banner tone="error" title={k("cidr.vpcTooSmallTitle")}>
              {fmt(k("cidr.vpcTooSmallText"), { n: s.azCount, p: primary.prefix, vpc: cidr.vpc.cidr })}
            </Banner>
          )}

          {primary.fitsInVpc && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">
                {res.secondaryRequired ? k("cidr.primaryNodesOnly") : k("cidr.primarySubnets")}
              </h3>
              <SubnetTable
                k={k}
                num={num}
                rows={primary.subnets.map((c, i) => ({ zone: res.zones[i], cidr: c, usable: primary.usable, required: primary.requiredPerAz }))}
              />
            </div>
          )}

          {res.secondaryRequired && (
            <div className="rounded-[16px] bg-signal/[0.06] p-4 ring-2 ring-signal/60 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="signal">{k("cidr.secondaryBadge")}</Badge>
                <h3 className="font-display text-lg font-bold text-white">{k("cidr.secondaryTitle")}</h3>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-200">
                {res.secondaryReason === "capacity" ? k("cidr.secondaryWhyCapacity") : k("cidr.secondaryWhyCustom")}
              </p>
              {res.secondaryReason === "capacity" && (
                <p className="mt-2 text-sm leading-relaxed text-amber-200">{k("cidr.secondaryAutoNote")}</p>
              )}
              {res.secondaryReason === "capacity" && s.subnetPrefix !== "auto" && (
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{k("cidr.secondaryTryAuto")}</p>
              )}

              <div className="mt-4 max-w-sm">
                <Field
                  label={k("cidr.secondaryCidr")}
                  htmlFor="secondary-cidr"
                  hint={k("cidr.secondaryCidrHint")}
                  error={sec?.error ? k(`cidr.${sec.error}`) : null}
                >
                  <input id="secondary-cidr" className={inputClass} value={s.secondaryCidr} onChange={(e) => set("secondaryCidr")(e.target.value)} spellCheck={false} aria-invalid={Boolean(sec?.error)} />
                </Field>
              </div>

              {sec && !sec.error && (
                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">{fmt(k("cidr.podSubnets"), { p: sec.prefix })}</h4>
                  <SubnetTable
                    k={k}
                    num={num}
                    rows={sec.subnets.map((c, i) => ({ zone: res.zones[i], cidr: c, usable: sec.usable, required: sec.requiredPerAz }))}
                  />
                  <p className="text-sm text-slate-300">
                    {fmt(k("cidr.secondaryTotals"), { used: num(sec.totalRequired), available: num(sec.totalUsable) })}
                  </p>
                  {!sec.fits && (
                    <Banner tone="error" title={k("cidr.secondaryTooSmallTitle")}>
                      {k("cidr.secondaryTooSmallText")}
                    </Banner>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* GCP                                                                 */
/* ------------------------------------------------------------------ */

function GcpNodePanel({ s, set, res, k, usd, num }) {
  const m = res.machine;
  return (
    <Panel eyebrow={k("gcp.eyebrow")} title={k("gcp.title")} description={k("gcp.description")}>
      <div className="space-y-5">
        <Field label={k("gcp.machine")} htmlFor="machine-type" hint={fmt(k("gcp.machineHint"), { od: usd(m.od, 4), spot: usd(m.spot, 4) })}>
          <select id="machine-type" className={inputClass} value={s.machineType} onChange={(e) => set("machineType")(e.target.value)}>
            {GCP_MACHINES.map((g) => (
              <option key={g.type} value={g.type}>
                {g.type} · {g.vcpu} vCPU · {g.ramGiB} GiB{g.arch === "arm64" ? " · arm64" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label={k("gcp.maxPods")} hint={fmt(k("gcp.maxPodsHint"), { ips: res.block.ips, p: res.block.prefix })}>
          <Segmented
            label={k("gcp.maxPods")}
            value={s.maxPodsPerNode}
            onChange={set("maxPodsPerNode")}
            options={GKE_MAX_PODS_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
          />
        </Field>

        {res.recommendedMaxPods < s.maxPodsPerNode && res.nodes.valid && (
          <Banner tone="info" title={fmt(k("gcp.recommendTitle"), { n: res.recommendedMaxPods })}>
            {fmt(k("gcp.recommendText"), { fit: num(Math.min(res.pods.podsFromCpu, res.pods.podsFromMem)), n: res.recommendedMaxPods })}
            <button type="button" onClick={() => set("maxPodsPerNode")(res.recommendedMaxPods)} className="ml-1 text-accent hover:underline">
              {k("gcp.recommendApply")}
            </button>
          </Banner>
        )}

        <Field label={k("gcp.services")} hint={k("gcp.servicesHint")}>
          <Segmented
            label={k("gcp.services")}
            value={s.servicesCount}
            onChange={set("servicesCount")}
            options={GKE_SERVICES_OPTIONS.map((o) => ({ value: o.services, label: `${o.services} → /${o.prefix}` }))}
          />
        </Field>
      </div>
    </Panel>
  );
}

function RangeCard({ title, badge, badgeTone = "signal", id, base, onBase, baseLabel, cidr, lines, error }) {
  return (
    <div className="rounded-[14px] bg-white/[0.03] p-4 ring-1 ring-white/[0.12]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {badge && <Badge tone={badgeTone}>{badge}</Badge>}
      </div>
      <p className="mt-3 font-mono text-xl text-white">{cidr || "—"}</p>
      <ul className="mt-2 space-y-0.5 text-sm text-slate-300">
        {lines.filter(Boolean).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <div className="mt-3">
        <label htmlFor={id} className="stat-label mb-1 block">
          {baseLabel}
        </label>
        <input id={id} className={inputClass} value={base} onChange={(e) => onBase(e.target.value)} spellCheck={false} aria-invalid={Boolean(error)} />
        {error && (
          <p className="mt-1 text-sm text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function GcpCidrPanel({ s, set, res, k, num }) {
  const rangeName = (key) => k(`gcpCidr.range.${key}`);
  const issueFor = (key) => res.issues.find((i) => i.range === key && (i.type === "baseInvalid" || i.type === "masterInvalid"));

  return (
    <Panel eyebrow={k("cidr.eyebrow")} title={k("gcpCidr.title")} description={k("gcpCidr.description")}>
      <Banner tone="signal" strong title={k("gcpCidr.bannerTitle")}>
        {k("gcpCidr.bannerText")}
      </Banner>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <RangeCard
          id="gke-nodes"
          title={k("gcpCidr.primaryTitle")}
          badge={k("gcpCidr.primaryBadge")}
          badgeTone="accent"
          cidr={res.primary.cidr}
          baseLabel={k("gcpCidr.base")}
          base={s.nodeBase}
          onBase={set("nodeBase")}
          error={issueFor("nodes") && k("gcpCidr.baseInvalid")}
          lines={[
            fmt(k("gcpCidr.primaryLine"), { nodes: num(res.primary.required), usable: num(res.primary.usable), p: res.primary.prefix }),
          ]}
        />
        <RangeCard
          id="gke-pods"
          title={k("gcpCidr.podsTitle")}
          badge={k("gcpCidr.required")}
          cidr={res.podRange.cidr}
          baseLabel={k("gcpCidr.base")}
          base={s.podBase}
          onBase={set("podBase")}
          error={issueFor("pods") && k("gcpCidr.baseInvalid")}
          lines={[
            fmt(k("gcpCidr.podsLine1"), { nodes: num(res.nodes.withSurge), block: res.block.ips, bp: res.block.prefix, need: num(res.podRange.required) }),
            fmt(k("gcpCidr.podsLine2"), { p: res.podRange.prefix, size: num(res.podRange.size), max: num(res.podRange.maxNodes) }),
          ]}
        />
        <RangeCard
          id="gke-services"
          title={k("gcpCidr.servicesTitle")}
          badge={k("gcpCidr.required")}
          cidr={res.servicesRange.cidr}
          baseLabel={k("gcpCidr.base")}
          base={s.servicesBase}
          onBase={set("servicesBase")}
          error={issueFor("services") && k("gcpCidr.baseInvalid")}
          lines={[fmt(k("gcpCidr.servicesLine"), { n: num(s.servicesCount), p: res.servicesRange.prefix })]}
        />
        <RangeCard
          id="gke-master"
          title={k("gcpCidr.masterTitle")}
          badge={k("gcpCidr.masterBadge")}
          badgeTone="warn"
          cidr={res.master}
          baseLabel={k("gcpCidr.masterInput")}
          base={s.masterCidr}
          onBase={set("masterCidr")}
          error={issueFor("master") && k("gcpCidr.masterInvalid")}
          lines={[k("gcpCidr.masterLine")]}
        />
      </div>

      {res.issues.filter((i) => i.type === "misaligned" || i.type === "overlap").length > 0 && (
        <div className="mt-5 space-y-3">
          {res.issues.map((i, idx) =>
            i.type === "misaligned" ? (
              <Banner key={idx} tone="warn" title={fmt(k("gcpCidr.misalignedTitle"), { range: rangeName(i.range) })}>
                {fmt(k("gcpCidr.misalignedText"), { cidr: i.cidr })}
              </Banner>
            ) : i.type === "overlap" ? (
              <Banner key={idx} tone="error" title={fmt(k("gcpCidr.overlapTitle"), { a: rangeName(i.range), b: rangeName(i.other) })}>
                {k("gcpCidr.overlapText")}
                {i.suggestion && <> {fmt(k("gcpCidr.overlapSuggestion"), { range: rangeName(i.other), cidr: i.suggestion })}</>}
              </Banner>
            ) : null
          )}
        </div>
      )}

      {res.nodes.valid && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-white">{k("gcpCidr.compareTitle")}</h3>
          <p className="mt-1 text-sm text-slate-300">{k("gcpCidr.compareText")}</p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.14]">
                  {["colMaxPods", "colBlock", "colNodes", "colPodRange", "colIps"].map((c) => (
                    <th key={c} scope="col" className="stat-label py-2 pr-3 font-medium">
                      {k(`gcpCidr.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {res.comparison.map((row) => {
                  const current = row.maxPods === s.maxPodsPerNode;
                  return (
                    <tr key={row.maxPods} className={`border-b border-white/[0.08] last:border-0 ${current ? "bg-accent/[0.07]" : ""}`}>
                      <td className="py-2 pr-3 font-mono text-white">
                        {row.maxPods}
                        {current && <span className="ml-2 text-[13px] text-accent">{k("gcpCidr.current")}</span>}
                        {row.maxPods === res.recommendedMaxPods && !current && (
                          <span className="ml-2 text-[13px] text-signal">{k("gcpCidr.recommended")}</span>
                        )}
                      </td>
                      <td className="py-2 pr-3 font-mono text-muted">
                        {row.blockIps} (/{32 - Math.log2(row.blockIps)})
                      </td>
                      <td className="py-2 pr-3 font-mono text-white">{row.valid ? num(row.nodes) : "—"}</td>
                      <td className="py-2 pr-3 font-mono text-white">/{row.podPrefix}</td>
                      <td className="py-2 pr-3 font-mono text-white">{num(row.podRangeSize)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  );
}
