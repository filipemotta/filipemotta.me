const TECH = [
  "Kubernetes", "AWS", "Google Cloud", "Azure", "Terraform", "Terragrunt", "ArgoCD", "Istio",
  "Karpenter", "KEDA", "Kyverno", "Helm", "Prometheus", "Grafana", "Thanos", "Datadog",
  "GitHub Actions", "Backstage", "Teleport", "Vault",
];

/** Decorative strip of the stack; the same names are listed as text further down. */
export default function Marquee() {
  return (
    <div className="marquee overflow-hidden border-y border-white/[0.06] py-5" aria-hidden="true">
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul key={copy} className="m-0 flex list-none items-center p-0">
            {TECH.map((name) => (
              <li key={name} className="flex items-center font-mono text-sm text-white/45">
                <span className="px-6">{name}</span>
                <span className="text-accent/60">/</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
