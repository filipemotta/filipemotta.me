const data = {
  en: [
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
      title: "Multi-Cloud Migration (AWS & Azure \u2192 GCP)",
      category: "Cloud Migration",
      bullets: [
        "Led full-stack multi-cloud migrations covering databases, networking, identity, microservices, and serverless workloads.",
        "Migrated Azure workloads (AKS, Azure SQL, Azure AD, Azure Functions, Blob Storage) to GCP equivalents.",
        "Designed AWS-to-GCP migration strategies covering EKS\u2192GKE, RDS\u2192CloudSQL, Lambda\u2192Cloud Functions, S3\u2192Cloud Storage.",
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
  ],
  pt: [
    {
      title: "Plataforma Kubernetes em Larga Escala",
      category: "Infraestrutura Cloud",
      bullets: [
        "Gerencio e otimizo 300+ clusters Kubernetes na AWS com alta disponibilidade e performance.",
        "Projeto Infraestrutura como Código usando Terraform e Terragrunt para deploys escaláveis e em conformidade.",
        "Aprimoro pipelines CI/CD e aplico boas práticas de GitOps com ArgoCD, Kustomize e Backstage.",
        "Conduzo orquestração multi-cluster com Kubefed e acesso seguro via Teleport.",
        "Implemento Istio service mesh para controle de tráfego e Kyverno para enforcement de políticas.",
        "Melhoro eficiência de custos através de estratégias de autoscaling usando Karpenter e KEDA.",
      ],
      tech: [
        "AWS", "EKS", "Terraform", "ArgoCD", "Istio",
        "Karpenter", "KEDA", "Kyverno", "Teleport", "Backstage", "Datadog",
      ],
    },
    {
      title: "Migração Multi-Cloud (AWS & Azure \u2192 GCP)",
      category: "Migração Cloud",
      bullets: [
        "Liderei migrações multi-cloud full-stack cobrindo bancos de dados, rede, identidade, microsserviços e workloads serverless.",
        "Migrei workloads Azure (AKS, Azure SQL, Azure AD, Azure Functions, Blob Storage) para equivalentes GCP.",
        "Projetei estratégias de migração AWS para GCP cobrindo EKS\u2192GKE, RDS\u2192CloudSQL, Lambda\u2192Cloud Functions, S3\u2192Cloud Storage.",
        "Construí pipelines CI/CD substituindo ferramentas legadas por GitHub Actions e Terraform.",
        "Mantive clusters GKE, EKS e AKS durante transições, garantindo conformidade nos três provedores cloud.",
      ],
      tech: [
        "AWS", "Azure", "GCP", "AKS", "EKS", "GKE",
        "Terraform", "Istio", "Helm", "ArgoCD", "GitHub Actions",
      ],
    },
    {
      title: "Arquitetura Cloud Event-Driven & Observabilidade",
      category: "Arquitetura & Consultoria",
      bullets: [
        "Prestei serviços de consultoria em GCP e AWS cobrindo design de arquitetura, implementação e automação.",
        "Construí arquiteturas event-driven com Pub/Sub, Lambda, EventBridge e service meshes Kubernetes (GKE Anthos).",
        "Implementei stacks de observabilidade (Prometheus, Grafana, Thanos, Alertmanager) melhorando alertas e transparência.",
        "Contribuí para segurança de containers e governança com forte ênfase em práticas DevSecOps.",
      ],
      tech: [
        "AWS", "GCP", "Lambda", "EventBridge", "Anthos",
        "Prometheus", "Grafana", "Thanos", "Kong", "Terraform",
      ],
    },
    {
      title: "Migração Monolito para Microsserviços (Fintech)",
      category: "Fintech",
      bullets: [
        "Orquestrei migração de sistema monolítico para microsserviços no Azure Kubernetes Service (AKS).",
        "Construí e gerenciei infraestrutura Kubernetes on-premises e no Azure com alta disponibilidade e observabilidade.",
        "Implementei pipelines CI/CD com Azure DevOps, reduzindo tempos de deploy e erros.",
      ],
      tech: [
        "Azure", "AKS", "Kubernetes", "Terraform",
        "Azure DevOps", "Prometheus", "Grafana", "ELK",
      ],
    },
    {
      title: "Infraestrutura Empresarial & Virtualização",
      category: "Governo / Empresarial",
      bullets: [
        "Projetei arquitetura de storage SAN/NAS com provisionamento de LUN e migrações de storage em larga escala.",
        "Gerenciei ambientes VMware (ESXi, vSphere, vCenter) com foco em otimização de recursos.",
        "Automatizei infraestrutura com Ansible e Puppet para gerenciamento de configuração em escala.",
        "Mantive infraestrutura Unix/Linux suportando serviços de missão crítica com alta disponibilidade 24/7.",
      ],
      tech: [
        "Linux", "AWS", "VMware", "Docker", "Kubernetes",
        "Ansible", "Puppet", "Python", "Bash",
      ],
    },
  ],
};

export function getProjects(lang) {
  return data[lang] || data.en;
}

export default data.en;
