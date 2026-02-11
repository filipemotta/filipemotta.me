const data = {
  en: [
    {
      title: "The Official DevOps with AI Guide",
      subtitle: "The AI-Native DevOps Engineer — The Definitive Guide",
      description:
        "A comprehensive, hands-on guide to applying artificial intelligence in DevOps, SRE, and Platform Engineering. Covers everything from MCP with Kubernetes and Terraform to autonomous AI agents, intelligent observability, and cloud cost optimization with FinOps.",
      stats: [
        { label: "Chapters", value: "15" },
        { label: "Pages", value: "300+" },
        { label: "Practical Sections", value: "80+" },
      ],
      topics: [
        "MCP + Kubernetes / Terraform / Prometheus",
        "Claude & Cursor AI IDE",
        "Autonomous AI Agents",
        "CI/CD with AI",
        "Observability with AI",
        "FinOps",
        "RAG with Qdrant",
        "Governance & Guardrails",
        "Agent Teams",
      ],
      url: "https://www.devops-ai.tech",
      linkLabel: "Access the Guide",
    },
  ],
  pt: [
    {
      title: "O Guia Oficial DevOps com IA",
      subtitle: "O Engenheiro DevOps AI-Native — O Guia Definitivo",
      description:
        "Um guia completo e prático para aplicar inteligência artificial em DevOps, SRE e Platform Engineering. Cobre desde MCP com Kubernetes e Terraform até agentes autônomos de IA, observabilidade inteligente e otimização de custos cloud com FinOps.",
      stats: [
        { label: "Capítulos", value: "15" },
        { label: "Páginas", value: "300+" },
        { label: "Seções Práticas", value: "80+" },
      ],
      topics: [
        "MCP + Kubernetes / Terraform / Prometheus",
        "Claude & Cursor AI IDE",
        "Agentes Autônomos de IA",
        "CI/CD com IA",
        "Observabilidade com IA",
        "FinOps",
        "RAG com Qdrant",
        "Governança & Guardrails",
        "Times de Agentes",
      ],
      url: "https://www.devops-ai.com.br",
      linkLabel: "Acessar o Guia",
    },
  ],
};

export function getPublications(lang) {
  return data[lang] || data.en;
}

export default data.en;
