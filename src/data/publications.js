const data = {
  en: [
    {
      badge: "FREE EBOOK",
      title: "Istio, Hands-On",
      subtitle: "From the First Route to Multi-Cluster",
      description:
        "Six chapters on running Istio on a platform that has to keep serving traffic while you change it: routing, resilience, mTLS and authorization, Envoy internals, VMs and VPN partners, and GKE + EKS in one mesh. Every chapter is proved in a lab you can run.",
      stats: [
        { label: "Chapters", value: "6" },
        { label: "Pages", value: "159" },
        { label: "Tested Labs", value: "6" },
      ],
      topics: [
        "Gateway API & VirtualService",
        "Sidecar & Ambient",
        "Resilience & Egress",
        "mTLS & AuthorizationPolicy",
        "Envoy & proxy-config",
        "VMs & HA VPN on GKE",
        "Multi-Cluster GKE + EKS",
      ],
      url: "/istio/",
      linkLabel: "Get the Free Ebook",
      external: false,
    },
    {
      badge: "GUIDE",
      title: "The Official DevOps with AI Guide",
      subtitle: "The AI-Native DevOps Engineer",
      description:
        "A hands-on guide to bringing Claude Code, MCP and subagents into daily Terraform, Kubernetes, AWS and CI/CD work, with the safeguards a production environment demands. Available as a free book and as an interactive guide updated every week.",
      stats: [
        { label: "Chapters", value: "16" },
        { label: "Sections", value: "148" },
        { label: "Free Book Pages", value: "780+" },
      ],
      topics: [
        "MCP + Kubernetes / Terraform",
        "Claude Code",
        "Subagents, Skills & Hooks",
        "CI/CD with AI",
        "Observability with AI",
        "FinOps",
        "Governance & Guardrails",
      ],
      url: "https://devops-ai.tech",
      linkLabel: "Access the Guide",
      external: true,
    },
  ],
  pt: [
    {
      badge: "EBOOK GRÁTIS",
      title: "Istio, Hands-On",
      subtitle: "From the First Route to Multi-Cluster (em inglês)",
      description:
        "Seis capítulos sobre operar Istio numa plataforma que precisa continuar servindo tráfego enquanto você muda: roteamento, resiliência, mTLS e autorização, Envoy por dentro, VMs e parceiros via VPN, e GKE + EKS em um só mesh. Cada capítulo é provado num laboratório que você pode rodar.",
      stats: [
        { label: "Capítulos", value: "6" },
        { label: "Páginas", value: "159" },
        { label: "Labs Testados", value: "6" },
      ],
      topics: [
        "Gateway API & VirtualService",
        "Sidecar & Ambient",
        "Resiliência & Egress",
        "mTLS & AuthorizationPolicy",
        "Envoy & proxy-config",
        "VMs & HA VPN no GKE",
        "Multi-Cluster GKE + EKS",
      ],
      url: "/istio/",
      linkLabel: "Baixar o Ebook Grátis",
      external: false,
    },
    {
      badge: "GUIA",
      title: "O Guia Oficial DevOps com IA",
      subtitle: "O Engenheiro DevOps AI-Native",
      description:
        "Um guia prático para levar Claude Code, MCP e subagentes ao dia a dia de Terraform, Kubernetes, AWS e CI/CD, com as salvaguardas que um ambiente de produção exige. Disponível como livro grátis e como guia interativo atualizado toda semana.",
      stats: [
        { label: "Capítulos", value: "16" },
        { label: "Seções", value: "148" },
        { label: "Páginas no Livro", value: "820+" },
      ],
      topics: [
        "MCP + Kubernetes / Terraform",
        "Claude Code",
        "Subagentes, Skills & Hooks",
        "CI/CD com IA",
        "Observabilidade com IA",
        "FinOps",
        "Governança & Guardrails",
      ],
      url: "https://www.devops-ai.com.br",
      linkLabel: "Acessar o Guia",
      external: true,
    },
  ],
};

export function getPublications(lang) {
  return data[lang] || data.en;
}

export default data.en;
