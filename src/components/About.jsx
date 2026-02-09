import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import TerminalText from "./TerminalText";
import profileImg from "../assets/profile.png";

const terminalLines = [
  { prompt: true, text: "whoami", color: "#E2E8F0" },
  { text: "Filipe Motta — Senior DevOps Engineer" },
  { text: "" },
  { prompt: true, text: "cat skills.yml", color: "#E2E8F0" },
  { text: "cloud_providers:", color: "#E2E8F0" },
  { text: "  - AWS (EKS, Lambda, CloudFormation)", color: colors.teal },
  { text: "  - GCP (GKE, Cloud Run, Anthos)", color: colors.teal },
  { text: "  - Azure (AKS, Azure DevOps, AD)", color: colors.teal },
  { text: "orchestration: Kubernetes (300+ clusters)", color: "#E2E8F0" },
  { text: "iac: Terraform, Terragrunt, Ansible", color: "#E2E8F0" },
  { text: "gitops: ArgoCD, Kustomize, Helm", color: "#E2E8F0" },
  { text: "mesh: Istio, Kyverno, Kong", color: "#E2E8F0" },
  { text: "monitoring: Prometheus, Grafana, Datadog", color: "#E2E8F0" },
  { text: "" },
  { prompt: true, text: "uptime --career", color: "#E2E8F0" },
  { text: "20+ years and counting ▮", color: "#22C55E" },
];

const specialties = [
  { icon: "☁️", title: "Multi-Cloud Mastery", text: "Deep hands-on experience with AWS, GCP, and Azure, designing resilient, scalable architectures that support mission-critical workloads." },
  { icon: "⚙️", title: "Kubernetes at Enterprise Scale", text: "Expert in EKS, GKE with advanced implementations including Istio service mesh, Karpenter/KEDA autoscaling, Kyverno policy enforcement, and multi-cluster orchestration." },
  { icon: "🚀", title: "GitOps & Automation", text: "Building frictionless CI/CD pipelines with ArgoCD, Terraform/Terragrunt, GitHub Actions, and Backstage — enabling teams to ship faster with confidence." },
  { icon: "📊", title: "Observability & Security", text: "Prometheus, Grafana, Datadog, Thanos, and ELK stacks that provide full-stack visibility and proactive incident management." },
];

export default function About() {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-center" style={{ color: colors.teal }}>About Me</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center" style={{ color: colors.white }}>
            Turning complex infrastructure into<span style={{ color: colors.teal }}> elegant systems</span>
          </h2>
        </FadeIn>

        <FadeIn>
          <div className="grid md:grid-cols-5 gap-10 items-start mb-16">
            <div className="md:col-span-2 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl opacity-40 blur-lg" style={{ background: colors.teal }} />
                <img src={profileImg} alt="Filipe Motta" className="relative w-72 h-72 md:w-80 md:h-80 object-cover rounded-2xl"
                  style={{ border: `2px solid ${colors.teal}40`, boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }} />
              </div>
            </div>

            <div className="md:col-span-3">
              <p className="text-lg leading-relaxed mb-5" style={{ color: colors.white }}>
                I architect and manage cloud-native infrastructure at scale, including experience overseeing{" "}
                <span style={{ color: colors.teal, fontWeight: 700 }}>300+ Kubernetes clusters</span> on AWS, driving high availability, cost optimization, and developer productivity for global platforms.
              </p>
              <p className="leading-relaxed mb-5" style={{ color: colors.gray }}>
                My career spans the full evolution of modern infrastructure — from traditional Linux administration to cutting-edge cloud-native ecosystems. Today, I specialize in:
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                {specialties.map((s) => (
                  <div key={s.title} className="p-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                    style={{ background: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{s.icon}</span>
                      <span className="text-sm font-bold" style={{ color: colors.white }}>{s.title}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: colors.gray }}>{s.text}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: colors.gray }}>
                I hold <span style={{ color: colors.teal, fontWeight: 600 }}>10 industry certifications</span>, including the complete Kubernetes trilogy (CKA, CKAD, CKS), AWS DevOps Professional, GCP Professional DevOps Engineer, and Terraform Associate.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: colors.gray }}>
                I thrive on solving complex infrastructure challenges, optimizing costs without sacrificing performance, and enabling engineering teams to focus on what matters —{" "}
                <span style={{ color: colors.white, fontWeight: 500 }}>building great products</span>.
              </p>

              <div className="flex items-center gap-2 text-sm mt-5" style={{ color: colors.gray }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                Brazil • Remote
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="max-w-3xl mx-auto">
            <TerminalText lines={terminalLines} />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
