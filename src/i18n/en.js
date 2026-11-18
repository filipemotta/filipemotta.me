const en = {
  nav: {
    links: [
      { label: "About", id: "about" },
      { label: "Books", id: "guide" },
      { label: "Posts", id: "posts" },
      { label: "Projects", id: "projects" },
      { label: "Certifications", id: "certifications" },
    ],
    contact: "Get in touch",
  },
  hero: {
    status: "Available for projects",
    headline: "Kubernetes platforms that stay up while you change everything.",
    sub: "I'm Filipe Motta, DevOps engineer and cloud architect. For over 20 years I've been building and running infrastructure on AWS, GCP and Azure.",
    primary: "Get in touch",
    secondary: "Read the Istio ebook",
    rows: [
      { name: "experience", status: "Ready", value: "20+ years" },
      { name: "k8s-clusters", status: "Running", value: "300+ on AWS" },
      { name: "certifications", status: "Valid", value: "10, with CKA, CKAD and CKS" },
      { name: "clouds", status: "Ready", value: "AWS, GCP, Azure" },
    ],
  },
  profile: {
    heading: "Who's behind this",
    role: "Senior DevOps Engineer, Cloud Architect and Author",
    bio: [
      "DevOps engineer and cloud architect with over 20 years of career, from traditional Linux administration to cloud-native platforms. Today I design and run infrastructure at scale, including more than 300 Kubernetes clusters on AWS.",
      "I've led multi-cloud migrations between AWS, Azure and GCP, a fintech's move from a monolith to microservices, and the adoption of GitOps, service mesh with Istio and autoscaling with Karpenter and KEDA.",
      "I hold 10 certifications, among them the Kubernetes trilogy (CKA, CKAD and CKS), AWS DevOps Professional and GCP Professional Cloud DevOps Engineer. I'm the author of the ebook Istio, Hands-On and of The Official DevOps with AI Guide.",
    ],
    more: "Read more",
    less: "Read less",
    stats: [
      { label: "experience", value: 20, suffix: "+", detail: "Years in infrastructure" },
      { label: "clusters", value: 300, suffix: "+", detail: "Kubernetes on AWS" },
      { label: "certifications", value: 10, suffix: "", detail: "Kubernetes, AWS, GCP, Terraform" },
    ],
  },
  sections: {
    guideLead: "Free material, written from what runs in production and proved in a lab.",
    postsLead: "Short notes on what changes in Kubernetes, cloud and security, always with the source.",
    projectsLead: "Work that sums up the kind of problem I solve.",
    stackHeading: "What I work with",
    certsLead: "Ten active certifications across Kubernetes, AWS, GCP, Terraform and Linux.",
    topics: "What's inside",
  },
  about: {
    label: "About Me",
    heading: "Turning complex infrastructure into",
    headingAccent: " elegant systems",
    bio1: "I architect and manage cloud-native infrastructure at scale, including experience overseeing",
    bio1Accent: "300+ Kubernetes clusters",
    bio1End:
      " on AWS, driving high availability, cost optimization, and developer productivity for global platforms.",
    bio2: "My career spans the full evolution of modern infrastructure — from traditional Linux administration to cutting-edge cloud-native ecosystems. Today, I specialize in:",
    specialties: [
      {
        icon: "\u2601\uFE0F",
        title: "Multi-Cloud Mastery",
        text: "Deep hands-on experience with AWS, GCP, and Azure, designing resilient, scalable architectures that support mission-critical workloads.",
      },
      {
        icon: "\u2699\uFE0F",
        title: "Kubernetes at Enterprise Scale",
        text: "Expert in EKS, GKE with advanced implementations including Istio service mesh, Karpenter/KEDA autoscaling, Kyverno policy enforcement, and multi-cluster orchestration.",
      },
      {
        icon: "\uD83D\uDE80",
        title: "GitOps & Automation",
        text: "Building frictionless CI/CD pipelines with ArgoCD, Terraform/Terragrunt, GitHub Actions, and Backstage — enabling teams to ship faster with confidence.",
      },
      {
        icon: "\uD83D\uDCCA",
        title: "Observability & Security",
        text: "Prometheus, Grafana, Datadog, Thanos, and ELK stacks that provide full-stack visibility and proactive incident management.",
      },
    ],
    certs:
      "I hold <accent>10 industry certifications</accent>, including the complete Kubernetes trilogy (CKA, CKAD, CKS), AWS DevOps Professional, GCP Professional DevOps Engineer, and Terraform Associate.",
    passion:
      "I thrive on solving complex infrastructure challenges, optimizing costs without sacrificing performance, and enabling engineering teams to focus on what matters —",
    passionAccent: "building great products",
    location: "Brazil \u2022 Remote",
  },
  skills: {
    label: "Expertise",
    heading: "Technical Skills",
  },
  experience: {
    label: "Key Projects",
    heading: "Featured Projects",
  },
  certifications: {
    heading: "Certifications",
  },
  publications: {
    label: "Publications",
    heading: "Guides and Ebooks",
  },
  posts: {
    label: "Posts",
    heading: "Notes on Cloud & Platform Engineering & DevOps",
    readMore: "Read more",
    readLess: "Show less",
    source: "Source",
    permalink: "Open post",
    seeAll: "See all posts",
    prev: "Previous",
    next: "Next",
    pageN: "Page {n}",
    pagination: "Posts pagination",
    allTitle: "All posts",
    allDescription: "Notes on Kubernetes, cloud, platform engineering and security by Filipe Motta.",
    backHome: "Back to home",
    backToAll: "All posts",
    empty: "No posts yet.",
    notFound: "Post not found",
    notFoundText: "This post doesn’t exist or was moved. Browse all posts instead.",
  },
  contact: {
    heading: "Need help with Kubernetes, a cloud migration or DevOps architecture?",
    description: "Tell me the scenario. I answer on WhatsApp or LinkedIn.",
    whatsapp: "Message on WhatsApp",
    linkedin: "Open LinkedIn",
  },
  footer: {
    tagline: "Built with passion for infrastructure",
  },
};

export default en;
