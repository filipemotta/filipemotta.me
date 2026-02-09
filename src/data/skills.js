const skillGroups = [
  {
    title: "Cloud & Orchestration",
    icon: "☸",
    skills: [
      { name: "Kubernetes (EKS/GKE/AKS)", level: 97 },
      { name: "AWS", level: 95 },
      { name: "Google Cloud Platform", level: 90 },
      { name: "Microsoft Azure", level: 85 },
      { name: "Docker & Containers", level: 95 },
    ],
  },
  {
    title: "IaC & Automation",
    icon: "⚙",
    skills: [
      { name: "Terraform / Terragrunt", level: 95 },
      { name: "Ansible", level: 88 },
      { name: "CI/CD (GitHub Actions, ArgoCD)", level: 93 },
      { name: "GitOps (ArgoCD, Kustomize, Helm)", level: 92 },
      { name: "Python / Shell Script", level: 88 },
    ],
  },
  {
    title: "Service Mesh & Security",
    icon: "🛡",
    skills: [
      { name: "Istio Service Mesh", level: 92 },
      { name: "Kyverno (Policy Engine)", level: 88 },
      { name: "Kong API Gateway", level: 85 },
      { name: "Vault (Secrets)", level: 83 },
    ],
  },
  {
    title: "Observability & Monitoring",
    icon: "📊",
    skills: [
      { name: "Prometheus & AlertManager", level: 94 },
      { name: "Grafana & Thanos", level: 92 },
      { name: "ELK Stack", level: 85 },
      { name: "Datadog", level: 82 },
    ],
  },
];

export default skillGroups;
