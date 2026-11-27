import { useMemo, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { DEFAULT_CONFIG, ENGINES, PRESETS, PSA_LEVELS, PSA_VERSIONS, RULE_IDS, RULE_SEVERITY, generatePolicies } from "../../utils/k8sPolicies";
import CodeTabs from "./CodeTabs";
import { Badge, Banner, Field, Panel, Segmented, Stat, Toggle, fmt, inputClass } from "./ui";

// List inputs are kept as raw text while editing; generatePolicies parses them.
const INITIAL = {
  ...DEFAULT_CONFIG,
  excludedNamespaces: DEFAULT_CONFIG.excludedNamespaces.join(", "),
  allowedRegistries: DEFAULT_CONFIG.allowedRegistries.join("\n"),
  networkPolicy: { ...DEFAULT_CONFIG.networkPolicy, allowedEgressCidrs: "" },
};

const PRESET_IDS = ["baseline", "restricted", "supplyChain", "zeroTrust"];
const NP_TOGGLES = ["defaultDenyIngress", "defaultDenyEgress", "allowDns", "allowSameNamespace", "allowFromIngressNs"];
const CODE_TABS = [
  { id: "kyverno", filename: "policy.kyverno.yaml" },
  { id: "gatekeeper", filename: "policy.gatekeeper.yaml" },
  { id: "vap", filename: "policy.vap.yaml" },
  { id: "psa", filename: "namespace.psa.yaml" },
  { id: "networkPolicy", filename: "networkpolicy.yaml" },
];
const CELL_CLASS = {
  full: "text-signal",
  partial: "text-amber-200",
  none: "text-slate-400",
};
const CELL_ICON = { full: "●", partial: "◐", none: "—" };

export default function K8sPolicyGenerator() {
  const { t } = useLanguage();
  const k = (key) => t(`tools.policies.${key}`);
  const [s, setS] = useState(INITIAL);
  const [lastPreset, setLastPreset] = useState(null);

  const set = (key) => (value) => setS((prev) => ({ ...prev, [key]: value }));
  const setRule = (id) => (value) => setS((prev) => ({ ...prev, rules: { ...prev.rules, [id]: value } }));
  const setNp = (key) => (value) => setS((prev) => ({ ...prev, networkPolicy: { ...prev.networkPolicy, [key]: value } }));
  const setPsa = (key) => (value) => setS((prev) => ({ ...prev, psa: { ...prev.psa, [key]: value } }));
  const applyPreset = (id) => {
    setS((prev) => PRESETS[id](prev));
    setLastPreset(id);
  };

  const out = useMemo(() => generatePolicies(s), [s]);
  const cfg = out.config;
  const selectedCount = RULE_IDS.filter((id) => cfg.rules[id]).length;
  const psaNeedsRestricted = out.coverage.filter((r) => r.psaNeedsRestricted);
  const ruleTitle = (id) => (id === "networkIsolation" ? k("coverage.networkIsolation") : k(`rules.items.${id}.title`));
  const levelLabel = (lvl) => k(`psa.${lvl}`);
  const scopeText = cfg.scope === "cluster" ? k("scope.cluster") : fmt(k("code.scopeNamespace"), { ns: cfg.namespace });
  const modeText = cfg.enforcement === "enforce" ? k("scope.enforce") : k("scope.audit");

  return (
    <div className="space-y-6">
      {/* 01 Scope & enforcement */}
      <Panel eyebrow={k("scope.eyebrow")} title={k("scope.title")} description={k("scope.description")}>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            <Field label={k("scope.label")}>
              <Segmented
                label={k("scope.label")}
                size="lg"
                value={s.scope}
                onChange={set("scope")}
                options={[
                  { value: "cluster", label: k("scope.cluster") },
                  { value: "namespace", label: k("scope.namespace") },
                ]}
              />
            </Field>
            <Field label={k("scope.nsLabel")} htmlFor="pol-namespace" hint={s.scope === "cluster" ? k("scope.nsHintCluster") : k("scope.nsHint")}>
              <input id="pol-namespace" className={inputClass} value={s.namespace} onChange={(e) => set("namespace")(e.target.value)} spellCheck={false} />
            </Field>
            <Field label={k("scope.excludedLabel")} htmlFor="pol-excluded" hint={k("scope.excludedHint")}>
              <input
                id="pol-excluded"
                className={inputClass}
                value={s.excludedNamespaces}
                onChange={(e) => set("excludedNamespaces")(e.target.value)}
                spellCheck={false}
              />
            </Field>
          </div>
          <div className="space-y-5">
            <Field label={k("scope.enforcementLabel")} hint={k("scope.enforcementHint")}>
              <Segmented
                label={k("scope.enforcementLabel")}
                size="lg"
                value={s.enforcement}
                onChange={set("enforcement")}
                options={[
                  { value: "audit", label: k("scope.audit") },
                  { value: "enforce", label: k("scope.enforce") },
                ]}
              />
            </Field>
            {s.enforcement === "audit" ? (
              <Banner tone="info" title={k("scope.rolloutTitle")}>
                {k("scope.rolloutBody")}
              </Banner>
            ) : (
              <Banner tone="warn" title={k("scope.enforceTitle")}>
                {k("scope.enforceBody")}
              </Banner>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Stat label={k("scope.statRules")} value={`${selectedCount}/${RULE_IDS.length}`} />
              <Stat label={k("scope.statScope")} value={cfg.scope === "cluster" ? k("scope.clusterShort") : cfg.namespace} />
              <Stat label={k("scope.statMode")} value={cfg.enforcement === "enforce" ? k("scope.enforceShort") : k("scope.auditShort")} />
            </div>
          </div>
        </div>
      </Panel>

      {/* 02 Presets */}
      <Panel eyebrow={k("presets.eyebrow")} title={k("presets.title")} description={k("presets.description")}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRESET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => applyPreset(id)}
              className={`flex h-full flex-col rounded-[14px] p-4 text-left ring-1 transition-colors ${
                lastPreset === id ? "bg-accent/[0.10] ring-accent/70" : "bg-white/[0.03] ring-white/[0.12] hover:ring-white/30"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-bold text-white">{k(`presets.${id}.name`)}</span>
                {lastPreset === id && <span className="font-mono text-[13px] text-signal">✓ {k("presets.applied")}</span>}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-slate-300">{k(`presets.${id}.desc`)}</span>
              <span className="mt-3 font-mono text-[13px] text-accent">{k("presets.apply")} →</span>
            </button>
          ))}
        </div>
      </Panel>

      {/* 03 Rules */}
      <Panel eyebrow={k("rules.eyebrow")} title={k("rules.title")} description={k("rules.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          {RULE_IDS.map((id) => {
            const sev = RULE_SEVERITY[id];
            return (
              <div
                key={id}
                className={`rounded-[14px] p-4 ring-1 transition-colors ${cfg.rules[id] ? "bg-accent/[0.06] ring-accent/40" : "bg-white/[0.02] ring-white/[0.12]"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <Toggle id={`rule-${id}`} checked={Boolean(s.rules[id])} onChange={setRule(id)} label={k(`rules.items.${id}.title`)} hint={k(`rules.items.${id}.desc`)} />
                  <Badge tone={sev === "high" ? "danger" : "warn"}>{k(`rules.severity.${sev}`)}</Badge>
                </div>
                {id === "restrictImages" && s.rules.restrictImages && (
                  <div className="mt-4 pl-14">
                    <Field label={k("rules.registriesLabel")} htmlFor="pol-registries" hint={cfg.allowedRegistries.length ? k("rules.registriesHint") : undefined}>
                      <textarea
                        id="pol-registries"
                        rows={3}
                        className={`${inputClass} resize-y`}
                        value={s.allowedRegistries}
                        placeholder={"123456789012.dkr.ecr.us-east-1.amazonaws.com/\nghcr.io/my-org/"}
                        onChange={(e) => set("allowedRegistries")(e.target.value)}
                        spellCheck={false}
                      />
                    </Field>
                    {!cfg.allowedRegistries.length && (
                      <div className="mt-3">
                        <Banner tone="warn">{k("rules.registriesEmpty")}</Banner>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 04 NetworkPolicy */}
        <Panel eyebrow={k("np.eyebrow")} title={k("np.title")} description={k("np.description")}>
          <div className="space-y-4">
            {NP_TOGGLES.map((key) => (
              <Toggle key={key} id={`np-${key}`} checked={Boolean(s.networkPolicy[key])} onChange={setNp(key)} label={k(`np.${key}.label`)} hint={k(`np.${key}.hint`)} />
            ))}
            {s.networkPolicy.allowFromIngressNs && (
              <Field label={k("np.ingressNsLabel")} htmlFor="np-ingress-ns" hint={k("np.ingressNsHint")}>
                <input
                  id="np-ingress-ns"
                  className={inputClass}
                  value={s.networkPolicy.ingressNamespace}
                  onChange={(e) => setNp("ingressNamespace")(e.target.value)}
                  spellCheck={false}
                />
              </Field>
            )}
            <Field
              label={k("np.cidrsLabel")}
              htmlFor="np-cidrs"
              hint={k("np.cidrsHint")}
              error={cfg.networkPolicy.invalidCidrs.length ? fmt(k("np.invalidCidrs"), { list: cfg.networkPolicy.invalidCidrs.join(", ") }) : undefined}
            >
              <input
                id="np-cidrs"
                className={inputClass}
                value={s.networkPolicy.allowedEgressCidrs}
                placeholder="10.0.0.0/8, 0.0.0.0/0:443"
                onChange={(e) => setNp("allowedEgressCidrs")(e.target.value)}
                spellCheck={false}
              />
            </Field>
            {!cfg.networkPolicy.defaultDenyEgress && (cfg.networkPolicy.allowDns || cfg.networkPolicy.egress.length > 0) && (
              <Banner tone="warn">{k("np.egressIsolationNote")}</Banner>
            )}
          </div>
        </Panel>

        {/* 05 PSA */}
        <Panel eyebrow={k("psa.eyebrow")} title={k("psa.title")} description={k("psa.description")}>
          <div className="space-y-5">
            {["enforce", "audit", "warn"].map((mode) => (
              <Field key={mode} label={k(`psa.${mode}`)} hint={k(`psa.${mode}Hint`)}>
                <Segmented label={k(`psa.${mode}`)} value={s.psa[mode]} onChange={setPsa(mode)} options={PSA_LEVELS.map((lvl) => ({ value: lvl, label: levelLabel(lvl) }))} />
              </Field>
            ))}
            <Field label={k("psa.version")} hint={k("psa.versionHint")}>
              <Segmented label={k("psa.version")} value={s.psa.version} onChange={setPsa("version")} options={PSA_VERSIONS.map((v) => ({ value: v, label: v }))} />
            </Field>
            {psaNeedsRestricted.length > 0 && (
              <Banner tone="warn" title={k("psa.gapTitle")}>
                {fmt(k("psa.gapBody"), { rules: psaNeedsRestricted.map((r) => ruleTitle(r.id)).join(", ") })}
                <button type="button" onClick={() => setPsa("enforce")("restricted")} className="btn-ghost mt-3 !px-3.5 !py-2 !text-sm">
                  {k("psa.raise")}
                </button>
              </Banner>
            )}
          </div>
        </Panel>
      </div>

      {/* 06 Engines + coverage */}
      <Panel eyebrow={k("engines.eyebrow")} title={k("engines.title")} description={k("engines.description")}>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {ENGINES.map((e) => (
            <div key={e} className="rounded-[12px] bg-white/[0.03] p-4 ring-1 ring-white/[0.12]">
              <dt className="font-display text-base font-bold text-white">{k(`engines.items.${e}.name`)}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-slate-300">{k(`engines.items.${e}.when`)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <h3 className="text-[17px] font-semibold text-white">{k("coverage.title")}</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-300">{fmt(k("coverage.description"), { level: levelLabel(cfg.psa.enforce) })}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.14]">
                  <th scope="col" className="stat-label py-2.5 pr-3 font-medium">
                    {k("coverage.rule")}
                  </th>
                  {ENGINES.map((e) => (
                    <th key={e} scope="col" className="stat-label py-2.5 pr-3 font-medium">
                      {e === "psa" ? fmt(k("coverage.psaAt"), { level: levelLabel(cfg.psa.enforce) }) : k(`code.tabs.${e}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {out.coverage.map((row) => (
                  <tr key={row.id} className={`border-b border-white/[0.08] last:border-0 ${row.selected ? "" : "opacity-50"}`}>
                    <th scope="row" className="py-2.5 pr-3 font-medium text-white">
                      {ruleTitle(row.id)}
                      {!row.selected && <span className="ml-2 font-mono text-[13px] text-slate-400">{k("coverage.notSelected")}</span>}
                    </th>
                    {ENGINES.map((e) => (
                      <td key={e} className={`py-2.5 pr-3 font-mono ${CELL_CLASS[row[e]]}`}>
                        <span aria-hidden="true">{CELL_ICON[row[e]]}</span> {k(`coverage.legend.${row[e]}`)}
                        {e === "psa" && row.psaRestricted !== row.psa && (
                          <span className="block text-[12px] text-slate-400">{fmt(k("coverage.withRestricted"), { value: k(`coverage.legend.${row.psaRestricted}`) })}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{k("coverage.footnote")}</p>
        </div>
      </Panel>

      {/* 07 Generated YAML */}
      <Panel eyebrow={k("code.eyebrow")} title={k("code.title")}>
        <div className="mb-5">
          <Banner tone="signal" title={k("code.liveTitle")}>
            {fmt(k("code.liveBody"), { count: selectedCount, scope: scopeText, mode: modeText })}
          </Banner>
        </div>
        <CodeTabs
          tabs={CODE_TABS.map((tab) => ({ ...tab, label: k(`code.tabs.${tab.id}`), code: out[tab.id] }))}
          labels={{ tablist: k("code.title"), copy: k("code.copy"), copied: k("code.copied"), copyFailed: k("code.copyFailed") }}
        />
      </Panel>
    </div>
  );
}
