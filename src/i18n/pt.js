const pt = {
  nav: {
    links: [
      { label: "Sobre", id: "about" },
      { label: "Livros", id: "guide" },
      { label: "Posts", id: "posts" },
      { label: "Projetos", id: "projects" },
      { label: "Certificações", id: "certifications" },
    ],
    contact: "Falar comigo",
  },
  hero: {
    status: "Disponível para projetos",
    headline: "Plataformas Kubernetes que seguem no ar enquanto você muda tudo.",
    sub: "Sou Filipe Motta, engenheiro DevOps e arquiteto cloud. Há mais de 20 anos construo e opero infraestrutura em AWS, GCP e Azure.",
    primary: "Falar comigo",
    secondary: "Ler o ebook de Istio",
    rows: [
      { name: "experiencia", status: "Ready", value: "20+ anos" },
      { name: "clusters-k8s", status: "Running", value: "300+ na AWS" },
      { name: "certificacoes", status: "Valid", value: "10, com CKA, CKAD e CKS" },
      { name: "clouds", status: "Ready", value: "AWS, GCP, Azure" },
    ],
  },
  profile: {
    heading: "Quem está por trás",
    role: "Engenheiro DevOps Sênior, Arquiteto Cloud e Autor",
    founder: "Fundador da",
    bio: [
      "Engenheiro DevOps e arquiteto cloud com mais de 20 anos de carreira, da administração Linux tradicional às plataformas cloud-native. Hoje projeto e opero infraestrutura em escala, incluindo mais de 300 clusters Kubernetes na AWS. Também sou fundador da Uptime Soluções de TI.",
      "Conduzi migrações multi-cloud entre AWS, Azure e GCP, a saída de um monolito para microsserviços em uma fintech e a adoção de GitOps, service mesh com Istio e autoscaling com Karpenter e KEDA.",
      "Tenho 10 certificações, entre elas a trilogia de Kubernetes (CKA, CKAD e CKS), AWS DevOps Professional e GCP Professional Cloud DevOps Engineer. Sou autor do ebook Istio, Hands-On e do Guia Oficial DevOps com IA.",
    ],
    more: "Ver mais",
    less: "Ver menos",
    stats: [
      { label: "experiência", value: 20, suffix: "+", detail: "Anos em infraestrutura" },
      { label: "clusters", value: 300, suffix: "+", detail: "Kubernetes na AWS" },
      { label: "certificações", value: 10, suffix: "", detail: "Kubernetes, AWS, GCP, Terraform" },
    ],
  },
  sections: {
    guideLead: "Material gratuito, escrito a partir do que roda em produção e provado em laboratório.",
    postsLead: "Notas curtas sobre o que muda em Kubernetes, cloud e segurança, sempre com a fonte.",
    projectsLead: "Trabalhos que resumem o tipo de problema que eu resolvo.",
    stackHeading: "Com o que eu trabalho",
    certsLead: "Dez certificações ativas em Kubernetes, AWS, GCP, Terraform e Linux.",
    topics: "O que você encontra",
  },
  about: {
    label: "Sobre Mim",
    heading: "Transformando infraestrutura complexa em",
    headingAccent: " sistemas elegantes",
    bio1: "Eu projeto e gerencio infraestrutura cloud-native em escala, incluindo experiência supervisionando",
    bio1Accent: "300+ clusters Kubernetes",
    bio1End:
      " na AWS, garantindo alta disponibilidade, otimização de custos e produtividade para plataformas globais.",
    bio2: "Minha carreira abrange toda a evolução da infraestrutura moderna — da administração Linux tradicional aos ecossistemas cloud-native de ponta. Hoje, me especializo em:",
    specialties: [
      {
        icon: "\u2601\uFE0F",
        title: "Domínio Multi-Cloud",
        text: "Experiência prática profunda com AWS, GCP e Azure, projetando arquiteturas resilientes e escaláveis que suportam cargas de trabalho de missão crítica.",
      },
      {
        icon: "\u2699\uFE0F",
        title: "Kubernetes em Escala Empresarial",
        text: "Especialista em EKS, GKE com implementações avançadas incluindo Istio service mesh, autoscaling Karpenter/KEDA, enforcement de políticas Kyverno e orquestração multi-cluster.",
      },
      {
        icon: "\uD83D\uDE80",
        title: "GitOps & Automação",
        text: "Construindo pipelines CI/CD sem atrito com ArgoCD, Terraform/Terragrunt, GitHub Actions e Backstage — permitindo que times entreguem mais rápido com confiança.",
      },
      {
        icon: "\uD83D\uDCCA",
        title: "Observabilidade & Segurança",
        text: "Prometheus, Grafana, Datadog, Thanos e stacks ELK que fornecem visibilidade completa e gerenciamento proativo de incidentes.",
      },
    ],
    certs:
      "Possuo <accent>10 certificações da indústria</accent>, incluindo a trilogia completa de Kubernetes (CKA, CKAD, CKS), AWS DevOps Professional, GCP Professional DevOps Engineer e Terraform Associate.",
    passion:
      "Tenho paixão por resolver desafios complexos de infraestrutura, otimizar custos sem sacrificar performance, e capacitar times de engenharia a focar no que importa —",
    passionAccent: "construir grandes produtos",
    location: "Brasil \u2022 Remoto",
  },
  skills: {
    label: "Especialidades",
    heading: "Habilidades Técnicas",
  },
  experience: {
    label: "Principais Projetos",
    heading: "Projetos em Destaque",
  },
  certifications: {
    heading: "Certificações",
  },
  publications: {
    label: "Publicações",
    heading: "Guias e Ebooks",
  },
  posts: {
    label: "Posts",
    heading: "Notas sobre Cloud & Engenharia de Plataforma & DevOps",
    readMore: "Ler mais",
    readLess: "Mostrar menos",
    source: "Fonte",
    permalink: "Abrir post",
    seeAll: "Ver todos os posts",
    prev: "Anterior",
    next: "Próxima",
    pageN: "Página {n}",
    pagination: "Paginação dos posts",
    allTitle: "Todos os posts",
    allDescription: "Notas sobre Kubernetes, cloud, engenharia de plataforma e segurança por Filipe Motta.",
    backHome: "Voltar ao início",
    backToAll: "Todos os posts",
    empty: "Nenhum post ainda.",
    notFound: "Post não encontrado",
    notFoundText: "Este post não existe ou foi movido. Veja todos os posts.",
  },
  contact: {
    heading: "Precisa de ajuda com Kubernetes, migração cloud ou arquitetura DevOps?",
    description: "Me conte o cenário. Respondo por WhatsApp ou LinkedIn.",
    whatsapp: "Chamar no WhatsApp",
    linkedin: "Abrir o LinkedIn",
  },
  footer: {
    tagline: "Feito com paixão por infraestrutura",
  },
};

export default pt;
