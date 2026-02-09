const projects = [
  {
    title: "Large-Scale Kubernetes Platform",
    category: "Cloud Infrastructure",
    bullets: [
      "Manage and optimize 300+ Kubernetes clusters on AWS with high availability and performance.",
      "Architect Infrastructure as Code using Terraform and Terragrunt for scalable, compliant deployments.",
      "Enhance CI/CD pipelines and enforce GitOps best practices through ArgoCD, Kustomize, and Backstage.",
      "Drive multi-cluster orchestration with Kubefed and secure access via Teleport.",
      "Deploy Istio service mesh for traffic control and Kyverno for policy enforcement.",
      "Improve cost efficiency through autoscaling strategies using Karpenter and KEDA.",
    ],
    tech: [
      "AWS", "EKS", "Terraform", "ArgoCD", "Istio",
      "Karpenter", "KEDA", "Kyverno", "Teleport", "Backstage", "Datadog",
    ],
  },
  {
    title: "Multi-Cloud Migration (AWS & Azure → GCP)",
    category: "Cloud Migration",
    bullets: [
      "Led full-stack multi-cloud migrations covering databases, networking, identity, microservices, and serverless workloads.",
      "Migrated Azure workloads (AKS, Azure SQL, Azure AD, Azure Functions, Blob Storage) to GCP equivalents.",
      "Designed AWS-to-GCP migration strategies covering EKS→GKE, RDS→CloudSQL, Lambda→Cloud Functions, S3→Cloud Storage.",
      "Built CI/CD pipelines replacing legacy tooling with GitHub Actions and Terraform.",
      "Maintained GKE, EKS, and AKS clusters during transitions, ensuring compliance across all three cloud providers.",
    ],
    tech: [
      "AWS", "Azure", "GCP", "AKS", "EKS", "GKE",
      "Terraform", "Istio", "Helm", "ArgoCD", "GitHub Actions",
    ],
  },
  {
    title: "Event-Driven Cloud Architecture & Observability",
    category: "Architecture & Consulting",
    bullets: [
      "Delivered consulting services across GCP and AWS covering architecture design, implementation, and automation.",
      "Built event-driven architectures with Pub/Sub, Lambda, EventBridge and Kubernetes service meshes (GKE Anthos).",
      "Implemented observability stacks (Prometheus, Grafana, Thanos, Alertmanager) improving alerting and transparency.",
      "Contributed to container security and governance with strong emphasis on DevSecOps practices.",
    ],
    tech: [
      "AWS", "GCP", "Lambda", "EventBridge", "Anthos",
      "Prometheus", "Grafana", "Thanos", "Kong", "Terraform",
    ],
  },
  {
    title: "Fintech Monolith-to-Microservices Migration",
    category: "Fintech",
    bullets: [
      "Orchestrated migration from monolithic system to microservices on Azure Kubernetes Service (AKS).",
      "Built and managed Kubernetes infrastructure on-premises and in Azure with high-availability and observability.",
      "Implemented CI/CD pipelines with Azure DevOps, reducing deployment times and errors.",
    ],
    tech: [
      "Azure", "AKS", "Kubernetes", "Terraform",
      "Azure DevOps", "Prometheus", "Grafana", "ELK",
    ],
  },
  {
    title: "Enterprise Infrastructure & Virtualization",
    category: "Government / Enterprise",
    bullets: [
      "Designed SAN/NAS storage architecture with LUN provisioning and large-scale storage migrations.",
      "Managed VMware environments (ESXi, vSphere, vCenter) with focus on resource optimization.",
      "Automated infrastructure with Ansible and Puppet for configuration management at scale.",
      "Maintained Unix/Linux infrastructure supporting mission-critical services with 24/7 high-availability.",
    ],
    tech: [
      "Linux", "AWS", "VMware", "Docker", "Kubernetes",
      "Ansible", "Puppet", "Python", "Bash",
    ],
  },
];

export default projects;
