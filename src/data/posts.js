/**
 * Posts shown in the home "Posts" section (3 per page), on /posts (6 per
 * page) and each on its own permalink page, /posts/<slug>.
 *
 * To add a post, append one object to the array below. Order in this file
 * does not matter: the component sorts by `date`, newest first. If the array
 * is empty, the home section and its nav link are hidden.
 *
 * Posts are bilingual. A "localized" value is an object { en, pt } and is shown
 * in the site's current language; if that language is missing, the other one is
 * used. Where noted, a plain string is also accepted and used for both languages.
 *
 * Schema:
 *   slug        string            required  Unique, URL-safe id. Permalink becomes /posts/<slug>
 *                                           (legacy #post-<slug> anchors redirect there).
 *   date        string            required  Publication date, "yyyy-mm-dd".
 *   title       { en, pt }        required  Post title (at least one language).
 *   text        { en, pt }        required  Full post text (at least one language). Line
 *                                           breaks are preserved (blank line = new
 *                                           paragraph) and plain http(s) URLs are linked.
 *   sourceUrl   string            required  Original source of the subject (changelog,
 *                                           official blog, docs).
 *   sourceLabel string | { en, pt } optional Text for the source link. Defaults to the
 *                                           URL's hostname.
 *   tags        (string | { en, pt })[]
 *                                 optional  Short topic tags. Use a plain string for names
 *                                           that don't translate (e.g. "Kubernetes").
 */
const posts = [
  {
    slug: "aws-emulator-never-denies",
    date: "2026-11-12",
    title: {
      en: "AWS Emulator never says AccessDenied",
      pt: "O AWS Emulator nunca diz AccessDenied",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/11/aws-emulator-now-available/",
    sourceLabel: { en: "AWS What's New", pt: "Novidades da AWS" },
    tags: ["AWS", "IAM", "Security", "Testing", "AI Agents"],
    text: {
      en: `AWS shipped AWS Emulator yesterday, a local copy of AWS that answers your SDK and CLI calls in milliseconds with no account behind it. I can already picture coding agents looping against it until every test is green. The sentence I would read twice is on its own security page https://docs.aws.amazon.com/emulator/latest/userguide/security.html where it says the emulator never denies a request signed with its own key. It also doesn't evaluate S3 bucket policies or KMS key policies, so an agent can spend a whole afternoon in there without ever meeting an AccessDenied. In my experience the first deploy of a new service rarely breaks on logic. It breaks on who is allowed to do what. A green run against the emulator tells you the code works and nothing about whether production will let it run.`,
      pt: `A AWS lançou ontem o AWS Emulator, uma cópia local da AWS que responde às suas chamadas de SDK e CLI em milissegundos, sem nenhuma conta por trás. Já consigo imaginar agentes de código rodando em loop contra ele até todos os testes ficarem verdes. A frase que eu leria duas vezes está na própria página de segurança dele https://docs.aws.amazon.com/emulator/latest/userguide/security.html, onde diz que o emulador nunca nega uma requisição assinada com a chave dele. Ele também não avalia bucket policies do S3 nem key policies do KMS, então um agente pode passar a tarde inteira lá dentro sem nunca encontrar um AccessDenied. Na minha experiência, o primeiro deploy de um serviço novo raramente quebra na lógica. Ele quebra em quem tem permissão para fazer o quê. Uma execução verde contra o emulador diz que o código funciona e não diz nada sobre se a produção vai deixar ele rodar.`,
    },
  },
  {
    slug: "eks-auto-mode-karpenter-dra",
    date: "2026-11-11",
    title: {
      en: "DRA for NVIDIA GPUs and EFA in EKS Auto Mode and Karpenter",
      pt: "DRA para GPUs NVIDIA e EFA no EKS Auto Mode e no Karpenter",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-auto-mode-karpenter-dra/",
    sourceLabel: { en: "AWS What's New", pt: "Novidades da AWS" },
    tags: ["AWS", "EKS", "Karpenter", "GPU", "Kubernetes"],
    text: {
      en: `If you split GPUs into smaller slices with NVIDIA MIG (Multi-Instance GPU) today, the Dynamic Resource Allocation support that EKS Auto Mode and Karpenter got this week is not your migration yet. Dynamic Resource Allocation, or DRA, is the newer Kubernetes way to ask for devices like GPUs through a claim instead of a fixed count on the node. The announcement says pods can share GPU devices, but in Auto Mode that means several pods pointing at the same claim and getting the same whole GPU, because time-slicing and MIG through DRA are not available there.

The other line worth reading twice is that each node stays a DRA node or an old-style device plugin node for its whole lifetime, so moving a GPU workload over is a node rotation you plan for and not a flag you flip on a Friday. Claims that keep GPUs and EFA (Elastic Fabric Adapter, the AWS low-latency network for training) on the same hardware topology, on Kubernetes 1.36, are still a real step for training clusters. https://docs.aws.amazon.com/eks/latest/userguide/auto-change.html`,
      pt: `Se hoje você divide GPUs em fatias menores com NVIDIA MIG (Multi-Instance GPU), o suporte a Dynamic Resource Allocation que o EKS Auto Mode e o Karpenter ganharam esta semana ainda não é a sua migração. Dynamic Resource Allocation, ou DRA, é a forma mais nova do Kubernetes de pedir dispositivos como GPUs por meio de um claim, em vez de uma contagem fixa no node. O anúncio diz que pods podem compartilhar GPUs, mas no Auto Mode isso significa vários pods apontando para o mesmo claim e recebendo a mesma GPU inteira, porque time-slicing e MIG via DRA não estão disponíveis lá.

A outra linha que vale ler duas vezes é que cada node continua sendo um node DRA ou um node com o device plugin antigo durante toda a sua vida útil. Então migrar uma carga de GPU é uma rotação de nodes que você planeja, e não uma flag que você liga numa sexta-feira. Claims que mantêm GPUs e EFA (Elastic Fabric Adapter, a rede de baixa latência da AWS para treinamento) na mesma topologia de hardware, no Kubernetes 1.36, ainda são um passo real para clusters de treinamento. https://docs.aws.amazon.com/eks/latest/userguide/auto-change.html`,
    },
  },
  {
    slug: "aws-nitro-sandboxes-eks",
    date: "2026-11-10",
    title: {
      en: "AWS Nitro Sandboxes: each EKS pod in its own VM",
      pt: "AWS Nitro Sandboxes: cada pod do EKS em sua própria VM",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/11/nitro-sandboxes-eks-ecs-ec2/",
    sourceLabel: { en: "AWS What's New", pt: "Novidades da AWS" },
    tags: ["AWS", "EKS", "Kubernetes", { en: "Security", pt: "Segurança" }],
    text: {
      en: `I spent years running VMware and the hypervisor was rarely the part that worried me. Isolation between VMs just held. What went wrong was usually the wiring around them, like a port group shared by the wrong machines or a service account with far more rights than it needed.

AWS Nitro Sandboxes, announced yesterday, bring that kind of boundary to EKS. Set runtimeClassName to isolated-sandbox and the pod boots in its own lightweight VM on the Nitro Hypervisor with its own kernel, while Pod Identity, VPC CNI, EBS and kubectl exec keep working. It needs Kubernetes 1.36 or later and there is no extra charge. https://aws.amazon.com/about-aws/whats-new/2026/11/nitro-sandboxes-eks-ecs-ec2/

The detail I would point a platform team at sits in AWS's own coding-agent example. The VM stops a kernel escape. What the agent can reach is still a hostname egress policy, enforced only after the VPC CNI ConfigMap turns on the network policy controller. github.com stays reachable as a whole, so the scoped GitHub token is what actually limits what gets pushed. Twenty years in and it is the same story. The box holds and the wiring is where it leaks.`,
      pt: `Passei anos operando VMware e o hypervisor raramente era a parte que me preocupava. O isolamento entre VMs simplesmente segurava. O que dava errado costumava ser a fiação em volta delas, como um port group compartilhado pelas máquinas erradas ou uma service account com muito mais permissões do que precisava.

O AWS Nitro Sandboxes, anunciado ontem, traz esse tipo de fronteira para o EKS. Basta definir runtimeClassName como isolated-sandbox e o pod sobe na sua própria VM leve no Nitro Hypervisor, com kernel próprio, enquanto Pod Identity, VPC CNI, EBS e kubectl exec continuam funcionando. Exige Kubernetes 1.36 ou superior e não tem custo extra. https://aws.amazon.com/about-aws/whats-new/2026/11/nitro-sandboxes-eks-ecs-ec2/

O detalhe para o qual eu chamaria a atenção de um time de plataforma está no próprio exemplo de agente de código da AWS. A VM impede um escape de kernel. O que o agente consegue alcançar continua sendo uma política de egress por hostname, aplicada só depois que o ConfigMap do VPC CNI liga o network policy controller. O github.com continua acessível por inteiro, então é o token do GitHub com escopo restrito que de fato limita o que pode ser enviado. Vinte anos depois, a história é a mesma. A caixa segura, e é na fiação que vaza.`,
    },
  },
  {
    slug: "kubevirt-cncf-graduated",
    date: "2026-11-07",
    title: {
      en: "KubeVirt becomes a CNCF Graduated project",
      pt: "KubeVirt se torna projeto Graduated da CNCF",
    },
    sourceUrl: "https://www.cncf.io/projects/kubevirt/",
    sourceLabel: "CNCF – KubeVirt",
    tags: ["Kubernetes", "CNCF", "KubeVirt"],
    text: {
      en: `KubeVirt lets you run virtual machines on Kubernetes next to your containers, managed with the same APIs and tools. It's now a CNCF Graduated project, after a TOC vote that closed on November 4 with nine in favor and none against.

For many teams this settles the maturity question that usually ends the conversation early.

What it doesn't settle is the migration. VMs that expect a flat network need real design work. And the people who run the hypervisor today have to become part of the platform team instead of a separate queue.

One control plane for VMs and containers is a strong argument. It's an operating model change before it's a technology change.

https://www.cncf.io/projects/kubevirt/`,
      pt: `O KubeVirt permite rodar máquinas virtuais no Kubernetes ao lado dos seus containers, gerenciadas com as mesmas APIs e ferramentas. Agora ele é um projeto Graduated da CNCF, depois de uma votação do TOC encerrada em 4 de novembro com nove votos a favor e nenhum contra.

Para muitos times, isso resolve a questão de maturidade que costuma encerrar a conversa logo no começo.

O que isso não resolve é a migração. VMs que esperam uma rede plana exigem trabalho de design de verdade. E quem opera o hypervisor hoje precisa passar a fazer parte do time de plataforma, em vez de ser uma fila separada.

Um único control plane para VMs e containers é um argumento forte. Mas é uma mudança de modelo operacional antes de ser uma mudança de tecnologia.

https://www.cncf.io/projects/kubevirt/`,
    },
  },
  {
    slug: "aws-api-mcp-server-oauth",
    date: "2026-10-29",
    title: {
      en: "OAuth and identity in the AWS API MCP Server",
      pt: "OAuth e identidade no AWS API MCP Server",
    },
    sourceUrl: "https://aws.amazon.com/security/security-bulletins/2026-152-aws/",
    sourceLabel: { en: "AWS Security Bulletin", pt: "Boletim de segurança da AWS" },
    tags: ["AWS", "MCP", { en: "Security", pt: "Segurança" }, "OAuth"],
    text: {
      en: `A token that is valid is not the same as a token that is meant for you.

AWS just published a security bulletin for the AWS API MCP Server: when running over HTTP with OAuth, it accepted tokens without properly checking who they were issued for. A token minted for another app in the same identity provider could be used to make AWS API calls with the server's credentials. Around the same time, MCP tooling advisories fixed clients that didn't bind OAuth credentials to a verified issuer.

None of this is exotic. It's the same identity mistake we spent a decade fixing in service-to-service auth. The difference is that an MCP server for cloud operations usually sits on top of powerful credentials, so the blast radius is your account, not one endpoint.

What I check before an MCP server touches infrastructure:
- audience and issuer pinned explicitly, never "any valid token"
- local stdio transport unless there's a real reason to expose it over the network
- credentials scoped to the task, not an admin role
- the MCP server treated as a workload, with its own identity, owner and review

Agents in operations will be judged like any other workload: who it is, and what it's allowed to do.

https://aws.amazon.com/security/security-bulletins/2026-152-aws/`,
      pt: `Um token válido não é a mesma coisa que um token emitido para você.

A AWS acabou de publicar um boletim de segurança sobre o AWS API MCP Server: rodando sobre HTTP com OAuth, ele aceitava tokens sem verificar direito para quem eles tinham sido emitidos. Um token gerado para outra aplicação no mesmo identity provider podia ser usado para fazer chamadas à API da AWS com as credenciais do servidor. Na mesma época, advisories de ferramentas MCP corrigiram clientes que não vinculavam as credenciais OAuth a um issuer verificado.

Nada disso é exótico. É o mesmo erro de identidade que passamos uma década corrigindo na autenticação entre serviços. A diferença é que um MCP server para operações de cloud normalmente fica em cima de credenciais poderosas, então o blast radius é a sua conta, não um endpoint.

O que eu verifico antes de um MCP server encostar em infraestrutura:
- audience e issuer fixados explicitamente, nunca "qualquer token válido"
- transporte stdio local, a menos que exista um motivo real para expô-lo na rede
- credenciais com o escopo da tarefa, não uma role de admin
- o MCP server tratado como um workload, com identidade, dono e revisão próprios

Agentes em operações vão ser avaliados como qualquer outro workload: quem ele é e o que ele tem permissão para fazer.

https://aws.amazon.com/security/security-bulletins/2026-152-aws/`,
    },
  },
  {
    slug: "eks-ca-rotation",
    date: "2026-10-29",
    title: {
      en: "CA certificate rotation on EKS",
      pt: "Rotação de certificados CA no EKS",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-dashboard-fleet-wide-visibility-certificate-authority-ca-rotation/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", { en: "Certificates", pt: "Certificados" }],
    text: {
      en: `The certificate that expires is usually the one nobody owned.

EKS clusters created in 2018 got a certificate authority issued for 10 years. AWS is now saying rotation should start, and the EKS Dashboard shows CA rotation status across your whole fleet.

If you run a handful of clusters, that is a calendar reminder. If you run hundreds, it is a program: inventory which clusters are affected, plan the rotation by environment, test what depends on the old CA (kubeconfigs, CI runners, webhooks, service mesh trust), and track it until the last cluster is done.

The lesson I keep seeing at scale: long-lived credentials don't fail on day one, they fail years later, when the person who created them has moved on. Put expiry dates in an inventory with an owner, not in someone's memory.

https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-dashboard-fleet-wide-visibility-certificate-authority-ca-rotation/`,
      pt: `O certificado que expira normalmente é aquele que não tinha dono.

Clusters EKS criados em 2018 receberam uma certificate authority emitida com validade de 10 anos. A AWS agora diz que é hora de começar a rotação, e o EKS Dashboard mostra o status da rotação da CA em toda a sua frota.

Se você roda meia dúzia de clusters, isso é um lembrete na agenda. Se você roda centenas, é um programa: inventariar quais clusters são afetados, planejar a rotação por ambiente, testar o que depende da CA antiga (kubeconfigs, CI runners, webhooks, trust do service mesh) e acompanhar até o último cluster ser concluído.

A lição que eu continuo vendo em escala: credenciais de longa duração não falham no primeiro dia, falham anos depois, quando quem as criou já não está mais por perto. Coloque as datas de expiração em um inventário com um dono, não na memória de alguém.

https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-dashboard-fleet-wide-visibility-certificate-authority-ca-rotation/`,
    },
  },
  {
    slug: "github-actions-lockfiles",
    date: "2026-10-30",
    title: {
      en: "Lockfiles for GitHub Actions",
      pt: "Lockfiles para GitHub Actions",
    },
    sourceUrl: "https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/",
    sourceLabel: "GitHub Changelog",
    tags: ["GitHub Actions", "Supply Chain", "CI/CD"],
    text: {
      en: `Pinning to a tag is not pinning.

When a workflow says uses: some-org/some-action@v4, you reviewed the code that tag pointed to on the day you added it. Tags and branches can move. If the action's maintainer account is compromised, the next run of your pipeline executes whatever the tag points to now, with your secrets and your OIDC token in scope.

GitHub just made workflow lockfiles generally available (Oct 28). It's the package-lock.json idea applied to Actions:
- gh actions-lock generates .github/workflows/actions.lock with the exact commits of every action, transitive dependencies included
- onboarded workflows run only the recorded commits, even if the tag moves
- Dependabot regenerates the lockfile entry in the same PR when it bumps an action
- admins can enforce it with a Require lockfile policy, and a CI check can flag stale lockfiles

How I'd roll it out on a large platform:
1. Start with the workflows that touch production credentials or publish artifacts.
2. Make the stale-lockfile check a required status.
3. Treat lockfile diffs as code review, not noise. Locking doesn't make a dependency safe; it guarantees you run what you reviewed.
4. Only then turn on Require lockfile at the org level.

Manual SHA pinning always worked, but almost nobody kept it up to date. This makes the secure option the easy one.

Source: https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/`,
      pt: `Apontar para uma tag não é fazer pinning.

Quando um workflow diz uses: some-org/some-action@v4, você revisou o código para o qual aquela tag apontava no dia em que a adicionou. Tags e branches podem mudar. Se a conta do mantenedor da action for comprometida, a próxima execução do seu pipeline roda o que quer que a tag aponte agora, com os seus secrets e o seu token OIDC no escopo.

O GitHub acabou de liberar os workflow lockfiles em GA (28 de outubro). É a ideia do package-lock.json aplicada às Actions:
- gh actions-lock gera .github/workflows/actions.lock com os commits exatos de cada action, incluindo dependências transitivas
- workflows que adotaram o lockfile rodam apenas os commits registrados, mesmo que a tag mude
- o Dependabot regenera a entrada do lockfile no mesmo PR quando atualiza uma action
- admins podem exigir o lockfile com uma policy Require lockfile, e um check de CI pode sinalizar lockfiles desatualizados

Como eu faria o rollout em uma plataforma grande:
1. Começar pelos workflows que mexem com credenciais de produção ou publicam artefatos.
2. Tornar o check de lockfile desatualizado um status obrigatório.
3. Tratar diffs de lockfile como code review, não como ruído. Travar a versão não torna uma dependência segura; garante que você roda o que revisou.
4. Só então ativar o Require lockfile no nível da organização.

Pinning manual por SHA sempre funcionou, mas quase ninguém mantinha isso atualizado. Agora a opção segura passa a ser a opção fácil.

Fonte: https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/`,
    },
  },
  {
    slug: "k8s-statefulset-confused-deputy",
    date: "2026-10-30",
    title: {
      en: "Namespace isolation and StatefulSet",
      pt: "Isolamento de namespaces e StatefulSet",
    },
    sourceUrl: "https://groups.google.com/g/kubernetes-announce/c/gI9iatwmRbA",
    sourceLabel: "Kubernetes Announce",
    tags: ["Kubernetes", "CVE", "RBAC"],
    text: {
      en: `Namespace isolation is only as strong as the controllers acting on your behalf.

Kubernetes disclosed CVE-2026-2270 this week: a confused deputy in the StatefulSet controller. A user with namespace-scoped write permission on StatefulSets and ControllerRevisions could make the controller create a pod in a different namespace, with full control over that pod's spec. The pod is garbage-collected right away unless the attacker builds a valid owner reference, which requires the UID of an existing StatefulSet in the victim namespace. It's rated Medium (5.9), but the pattern matters more than the score.

What to do:
- Upgrade kube-controller-manager to 1.34.12, 1.35.9, 1.36.5 or 1.37.1. On managed Kubernetes, check which control plane patch version your provider is running.
- The same releases fix CVE-2026-76654, an NTLM coercion issue on Windows nodes through subPath symlinks. If you run Windows node pools, give that one attention too.
- Until you're patched, review who holds write access on controllerrevisions. Most app teams never need it; it usually rides along in broad wildcard roles.

The lesson I keep relearning when operating many clusters: RBAC reviews tend to focus on pods, secrets and exec. The less obvious resources that controllers read from deserve the same scrutiny, because the controller has cluster-wide power and acts on whatever you feed it.

Advisory: https://groups.google.com/g/kubernetes-announce/c/gI9iatwmRbA`,
      pt: `O isolamento de namespaces é tão forte quanto os controllers que agem em seu nome.

O Kubernetes divulgou esta semana a CVE-2026-2270: um confused deputy no controller de StatefulSet. Um usuário com permissão de escrita com escopo de namespace em StatefulSets e ControllerRevisions conseguia fazer o controller criar um pod em outro namespace, com controle total sobre o spec desse pod. O pod é removido pelo garbage collector na hora, a menos que o atacante monte uma owner reference válida, o que exige o UID de um StatefulSet existente no namespace da vítima. A severidade é Medium (5.9), mas o padrão importa mais do que a nota.

O que fazer:
- Atualizar o kube-controller-manager para 1.34.12, 1.35.9, 1.36.5 ou 1.37.1. Em Kubernetes gerenciado, verifique qual versão de patch do control plane o seu provedor está rodando.
- As mesmas releases corrigem a CVE-2026-76654, um problema de NTLM coercion em nodes Windows via symlinks de subPath. Se você roda node pools Windows, dê atenção a essa também.
- Até aplicar o patch, revise quem tem acesso de escrita em controllerrevisions. A maioria dos times de aplicação nunca precisa disso; normalmente vem de carona em roles amplas com wildcard.

A lição que eu continuo reaprendendo ao operar muitos clusters: revisões de RBAC costumam focar em pods, secrets e exec. Os recursos menos óbvios que os controllers leem merecem o mesmo escrutínio, porque o controller tem poder sobre o cluster inteiro e age sobre qualquer coisa que você entregar a ele.

Advisory: https://groups.google.com/g/kubernetes-announce/c/gI9iatwmRbA`,
    },
  },
  {
    slug: "eks-auto-mode-gateway-api",
    date: "2026-10-31",
    title: {
      en: "Gateway API on EKS Auto Mode",
      pt: "Gateway API no EKS Auto Mode",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-auto-mode-kubernetes-gateway-api/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", "Gateway API"],
    text: {
      en: `Ingress was never designed for teams that share a cluster. Gateway API was.

This week AWS added Kubernetes Gateway API support to EKS Auto Mode. You define Gateway and HTTPRoute resources, and Auto Mode provisions and manages the load balancers: an ALB for HTTP and gRPC routes, an NLB for TCP and UDP. No controller to install, patch or upgrade.

Why it matters: Gateway API splits ownership the way platform teams actually work. The platform team owns the Gateway (listeners, TLS, which namespaces may attach routes). App teams own their routes. Cross-namespace routing, weighted traffic splitting and header-based routing are part of the spec instead of controller-specific annotations.

What I'd check before turning it on:

1. CRD ownership. Enabling it means choosing whether AWS manages the Gateway API CRDs. Managed mode requires any CRDs already in the cluster to be at v1, otherwise the change is rejected. If a mesh or another gateway controller already installs them, start unmanaged.

2. Coexistence. The Auto Mode controllers have their own GatewayClass controller names, so they can run next to Istio or Envoy Gateway in the same cluster. Be explicit about which GatewayClass each team should use.

3. Feature gaps. Not every Gateway API field maps to an ALB or NLB capability. Read the feature comparison before promising a routing behavior to an app team.

4. Migration path. Existing Ingress and Service type LoadBalancer resources keep working, so move one route at a time and keep rollback trivial.

The paved road gets simpler when the platform owns the gateway and teams own their routes, as long as someone clearly owns the CRDs too.

Source: https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-auto-mode-kubernetes-gateway-api/`,
      pt: `O Ingress nunca foi pensado para times que compartilham um cluster. O Gateway API foi.

Esta semana a AWS adicionou suporte ao Kubernetes Gateway API no EKS Auto Mode. Você define recursos Gateway e HTTPRoute, e o Auto Mode provisiona e gerencia os load balancers: um ALB para rotas HTTP e gRPC, um NLB para TCP e UDP. Nenhum controller para instalar, aplicar patch ou atualizar.

Por que isso importa: o Gateway API divide as responsabilidades do jeito que times de plataforma realmente trabalham. O time de plataforma é dono do Gateway (listeners, TLS, quais namespaces podem anexar rotas). Os times de aplicação são donos das suas rotas. Roteamento entre namespaces, divisão de tráfego por peso e roteamento por header fazem parte da spec, em vez de annotations específicas de cada controller.

O que eu verificaria antes de ativar:

1. Quem é dono das CRDs. Ativar significa escolher se a AWS gerencia as CRDs do Gateway API. O modo gerenciado exige que qualquer CRD já existente no cluster esteja na v1; caso contrário, a mudança é rejeitada. Se um mesh ou outro gateway controller já instala essas CRDs, comece no modo não gerenciado.

2. Coexistência. Os controllers do Auto Mode têm seus próprios nomes de controller de GatewayClass, então podem rodar ao lado do Istio ou do Envoy Gateway no mesmo cluster. Deixe explícito qual GatewayClass cada time deve usar.

3. Lacunas de funcionalidade. Nem todo campo do Gateway API tem equivalente em uma capacidade do ALB ou do NLB. Leia a comparação de funcionalidades antes de prometer um comportamento de roteamento a um time de aplicação.

4. Caminho de migração. Recursos Ingress e Service do tipo LoadBalancer existentes continuam funcionando, então migre uma rota por vez e mantenha o rollback trivial.

O paved road fica mais simples quando a plataforma é dona do gateway e os times são donos das suas rotas, desde que alguém também seja claramente dono das CRDs.

Fonte: https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-auto-mode-kubernetes-gateway-api/`,
    },
  },
  {
    slug: "aws-privateca-issuer-cve",
    date: "2026-10-31",
    title: {
      en: "Authorization flaw in the AWS Private CA Issuer",
      pt: "Falha de autorização no AWS Private CA Issuer",
    },
    sourceUrl: "https://aws.amazon.com/security/security-bulletins/2026-156-aws/",
    sourceLabel: { en: "AWS Security Bulletin", pt: "Boletim de segurança da AWS" },
    tags: ["AWS", "cert-manager", "CVE", "PKI"],
    text: {
      en: `A certificate issuer is a privilege boundary. Treat its configuration like RBAC.

AWS disclosed CVE-2026-119115 this week in the AWS Private CA Connector for Kubernetes (aws-privateca-issuer, the cert-manager issuer for AWS Private CA). In affected versions, under certain conditions, a user whose approval policy only authorized a namespace-scoped issuer could obtain certificates signed by a cluster-scoped issuer, including subordinate CA certificates. A subordinate CA is not just one certificate. It is the ability to mint more of them.

Fixed versions: aws-privateca-issuer v1.10.1 and the EKS add-on v1.10.1-eksbuild.1.

The catch: the fix requires issuerRef.kind to be exactly AWSPCAIssuer or AWSPCAClusterIssuer and to match the issuer it references. Certificates, CertificateRequests or Ingress annotations with a missing or wrong kind can stop renewing, and you may only notice when the current certificate expires.

What I'd do:

1. Inventory every issuerRef that points to a Private CA issuer and fix the kind before upgrading.
2. Upgrade, then force a test issuance and a renewal. A healthy pod does not prove renewals work.
3. If the upgrade has to wait, scope approval policies and RBAC by issuer name and kind.
4. Review who can create Certificate resources in each namespace. That list is your real exposure.

Source: https://aws.amazon.com/security/security-bulletins/2026-156-aws/`,
      pt: `Um issuer de certificados é uma fronteira de privilégio. Trate a configuração dele como RBAC.

A AWS divulgou esta semana a CVE-2026-119115 no AWS Private CA Connector for Kubernetes (aws-privateca-issuer, o issuer do cert-manager para o AWS Private CA). Nas versões afetadas, sob certas condições, um usuário cuja approval policy só autorizava um issuer com escopo de namespace conseguia obter certificados assinados por um issuer com escopo de cluster, incluindo certificados de CA subordinada. Uma CA subordinada não é só um certificado. É a capacidade de emitir muitos outros.

Versões corrigidas: aws-privateca-issuer v1.10.1 e o add-on do EKS v1.10.1-eksbuild.1.

O porém: a correção exige que issuerRef.kind seja exatamente AWSPCAIssuer ou AWSPCAClusterIssuer e corresponda ao issuer referenciado. Certificates, CertificateRequests ou annotations de Ingress com kind ausente ou errado podem parar de renovar, e talvez você só perceba quando o certificado atual expirar.

O que eu faria:

1. Inventariar todo issuerRef que aponta para um issuer do Private CA e corrigir o kind antes de atualizar.
2. Atualizar e, em seguida, forçar uma emissão de teste e uma renovação. Um pod saudável não prova que as renovações funcionam.
3. Se a atualização precisar esperar, restringir approval policies e RBAC por nome e kind do issuer.
4. Revisar quem pode criar recursos Certificate em cada namespace. Essa lista é a sua exposição real.

Fonte: https://aws.amazon.com/security/security-bulletins/2026-156-aws/`,
    },
  },
  {
    slug: "emudhra-incident-go-binaries",
    date: "2026-11-02",
    title: {
      en: "The eMudhra incident and Go binaries",
      pt: "Incidente eMudhra e binários Go",
    },
    sourceUrl: "https://go.dev/blog/emudhra-incident",
    sourceLabel: "Go Blog",
    tags: ["Go", "PKI", { en: "Security", pt: "Segurança" }],
    text: {
      en: `Did the eMudhra CA incident make it into your cluster, or only into your browser?

Browsers were covered within hours through their own revocation channels. Most of what runs a Kubernetes platform doesn't get that treatment.

On Linux, Go has no platform revocation API to lean on, so the Go team's fix (1.27.3 and 1.26.10, released Oct 19) is a denylist of the compromised intermediate keys compiled into crypto/x509. Compiled in is the part that matters. A Go binary built before that release still trusts those intermediates: Helm or OpenTofu on a CI runner, your operators, the internal controller nobody has rebuilt in two years. Containers also carry their own CA bundle, so refreshing the nodes doesn't reach them either.

This past week the cloud native projects shipped their side of it. cert-manager, Cilium, Envoy, Crossplane, Prometheus, SPIRE, Trivy and Atlantis, among others, cut patch releases. Upgrading those is the easy part.

The in-house binaries are where it gets slow. Two commands from Go's own write-up help:

go version -m ./your-binary
govulncheck -mode=binary ./your-binary

The first shows which toolchain built it, the second whether it's affected.

What this really tests is a question most platform teams can't answer fast: which toolchain built each binary we run, and could we rebuild all of them today? If answering takes a spreadsheet and a few days, that's the gap worth closing, more than this one CVE.

https://go.dev/blog/emudhra-incident`,
      pt: `O incidente da CA eMudhra chegou ao seu cluster ou só ao seu navegador?

Os navegadores foram cobertos em poucas horas pelos seus próprios canais de revogação. A maior parte do que roda uma plataforma Kubernetes não recebe esse tratamento.

No Linux, o Go não tem uma API de revogação da plataforma em que se apoiar, então a correção do time do Go (1.27.3 e 1.26.10, lançadas em 19 de outubro) é uma denylist das chaves intermediárias comprometidas compilada dentro do crypto/x509. Compilada dentro é a parte que importa. Um binário Go gerado antes dessa release ainda confia nesses intermediários: Helm ou OpenTofu em um CI runner, seus operators, aquele controller interno que ninguém recompila há dois anos. Containers também carregam o próprio CA bundle, então atualizar os nodes também não chega até eles.

Na última semana, os projetos cloud native fizeram a parte deles. cert-manager, Cilium, Envoy, Crossplane, Prometheus, SPIRE, Trivy e Atlantis, entre outros, publicaram patch releases. Atualizar esses é a parte fácil.

Os binários internos são onde a coisa fica lenta. Dois comandos do próprio texto do time do Go ajudam:

go version -m ./your-binary
govulncheck -mode=binary ./your-binary

O primeiro mostra qual toolchain gerou o binário; o segundo, se ele é afetado.

O que isso realmente testa é uma pergunta que a maioria dos times de plataforma não consegue responder rápido: qual toolchain gerou cada binário que rodamos, e conseguiríamos recompilar todos hoje? Se responder exige uma planilha e alguns dias, essa é a lacuna que vale fechar, mais do que esta CVE específica.

https://go.dev/blog/emudhra-incident`,
    },
  },
  {
    slug: "step-functions-mcp-tools",
    date: "2026-11-03",
    title: {
      en: "Step Functions as MCP tools",
      pt: "Step Functions como ferramentas MCP",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/step-functions-workflows-ai-agent-tools/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "Step Functions", "MCP", { en: "AI Agents", pt: "Agentes de IA" }],
    text: {
      en: `Most agent demos I see let the model do two jobs at once: decide that something should happen and decide how it happens, step by step. The first job is where models are useful. The second one is where incidents come from.

AWS shipped something last week that splits those jobs cleanly. Step Functions workflows can now be exposed to agents as MCP tools through Bedrock AgentCore Gateway. The agent picks the workflow and the input. The state machine owns the order of the steps, the retries and the approvals. No Lambda glue, no custom MCP server, and existing Standard and Express workflows work unchanged.

For ops work I like this more than another clever prompt. A rollback, a node drain, a certificate rotation: these already have a correct sequence and on a bad night nobody wants a model improvising it. Wrap the runbook you already trust, let the agent call it, and keep the human approval as a task-token step inside the workflow instead of a sentence in the system prompt.

Two things I'd still check before wiring it up. The gateway calls Step Functions with its own service role, so that role, not the agent, is your real blast radius. Expose only the state machines and operations you'd hand to a new on-call engineer. And since the agent can read execution history, workflow input and output end up in the model's context, so keep secrets out of those payloads.

What I don't know yet is how well agents choose between twenty similar workflows. My guess is that naming and descriptions will matter more than anyone expects.

https://aws.amazon.com/about-aws/whats-new/2026/10/step-functions-workflows-ai-agent-tools/`,
      pt: `A maioria das demos de agentes que eu vejo deixa o modelo fazer dois trabalhos ao mesmo tempo: decidir que algo deve acontecer e decidir como isso acontece, passo a passo. O primeiro trabalho é onde os modelos são úteis. O segundo é de onde vêm os incidentes.

A AWS lançou na semana passada algo que separa bem esses dois trabalhos. Workflows do Step Functions agora podem ser expostos a agentes como ferramentas MCP por meio do Bedrock AgentCore Gateway. O agente escolhe o workflow e o input. A state machine é dona da ordem dos passos, dos retries e das aprovações. Sem Lambda servindo de cola, sem MCP server customizado, e workflows Standard e Express existentes funcionam sem mudanças.

Para trabalho de operações, eu gosto mais disso do que de mais um prompt esperto. Um rollback, um drain de node, uma rotação de certificado: tudo isso já tem uma sequência correta, e numa noite ruim ninguém quer um modelo improvisando. Encapsule o runbook em que você já confia, deixe o agente chamá-lo e mantenha a aprovação humana como um passo com task token dentro do workflow, em vez de uma frase no system prompt.

Duas coisas que eu ainda verificaria antes de ligar tudo. O gateway chama o Step Functions com uma service role própria, então essa role, e não o agente, é o seu blast radius real. Exponha apenas as state machines e operações que você entregaria a um engenheiro recém-chegado no on-call. E como o agente pode ler o histórico de execução, o input e o output do workflow acabam no contexto do modelo, então mantenha secrets fora desses payloads.

O que eu ainda não sei é quão bem os agentes escolhem entre vinte workflows parecidos. Meu palpite é que nomes e descrições vão importar mais do que qualquer um espera.

https://aws.amazon.com/about-aws/whats-new/2026/10/step-functions-workflows-ai-agent-tools/`,
    },
  },
  {
    slug: "istio-free-ebook",
    date: "2026-11-03",
    title: {
      en: "Free ebook on Istio",
      pt: "Ebook gratuito sobre Istio",
    },
    sourceUrl: "https://filipemotta.me/istio/",
    sourceLabel: "filipemotta.me",
    tags: ["Istio", "Service Mesh", "Ebook"],
    text: {
      en: `The last part of my Istio series went out yesterday, so I put all six into one free ebook.

It is 159 pages and six chapters, and every chapter has a lab repository you can run yourself. It starts at the first route and ends with GKE and EKS in one mesh. In between there is resilience and egress, mTLS and authorization policies, reading Envoy through proxy-config, and onboarding VMs behind an HA VPN.

I wrote it for people who run Istio on a platform that has to keep serving traffic while it changes. Sidecar and ambient are both covered on Istio 1.31. You leave an email and get the PDF and EPUB links in your inbox.

https://filipemotta.me/istio/`,
      pt: `A última parte da minha série sobre Istio saiu ontem, então juntei as seis em um ebook gratuito.

São 159 páginas e seis capítulos, e cada capítulo tem um repositório de lab que você pode rodar por conta própria. Começa na primeira rota e termina com GKE e EKS em um único mesh. No meio do caminho tem resiliência e egress, mTLS e authorization policies, leitura do Envoy com proxy-config e onboarding de VMs atrás de uma HA VPN.

Escrevi para quem roda Istio em uma plataforma que precisa continuar servindo tráfego enquanto muda. Sidecar e ambient são cobertos, no Istio 1.31. Você deixa um e-mail e recebe os links do PDF e do EPUB na sua caixa de entrada.

https://filipemotta.me/istio/`,
    },
  },
  {
    slug: "eks-argocd-notifications",
    date: "2026-11-04",
    title: {
      en: "Argo CD notifications on EKS",
      pt: "Notificações do Argo CD no EKS",
    },
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-argo-cd-notifications/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", "Argo CD", "GitOps"],
    text: {
      en: `The first Argo CD notification most teams set up is "sync succeeded" in a Slack channel and a month later that channel is muted. A green sync only tells you git and the cluster agree. It says nothing about whether what you deployed is healthy, so the triggers I actually want are on-sync-failed and on-health-degraded, going to the same place as the rest of the on-call signal.

EKS Capabilities for Argo CD now supports Notifications, with the same triggers, templates and annotations you'd use upstream. The detail I liked is that SQS and EventBridge authenticate with the capability's IAM role and a Slack token can be a Secrets Manager ARN instead of one more secret living in the cluster. EventBridge is where it gets interesting, because a degraded app can start a workflow instead of waiting for someone to scroll a channel. https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-argo-cd-notifications/`,
      pt: `A primeira notificação do Argo CD que a maioria dos times configura é "sync succeeded" em um canal do Slack, e um mês depois esse canal está silenciado. Um sync verde só diz que o git e o cluster concordam. Não diz nada sobre se o que você fez deploy está saudável, então os triggers que eu realmente quero são on-sync-failed e on-health-degraded, indo para o mesmo lugar que o resto dos sinais de on-call.

O EKS Capabilities for Argo CD agora suporta Notifications, com os mesmos triggers, templates e annotations que você usaria no upstream. O detalhe de que eu gostei é que SQS e EventBridge autenticam com a IAM role da capability, e um token do Slack pode ser um ARN do Secrets Manager em vez de mais um secret morando no cluster. O EventBridge é onde fica interessante, porque uma aplicação degradada pode disparar um workflow em vez de esperar alguém rolar um canal. https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-argo-cd-notifications/`,
    },
  },
  {
    slug: "openkruise-agents-credentials",
    date: "2026-11-05",
    title: {
      en: "OpenKruise Agents and credential protection",
      pt: "OpenKruise Agents e proteção de credenciais",
    },
    sourceUrl: "https://www.cncf.io/blog/2026/11/03/openkruise-agents-v0-6-0-leaping-ahead-in-agent-sandbox-security-and-automation/",
    sourceLabel: "CNCF Blog",
    tags: ["Kubernetes", { en: "AI Agents", pt: "Agentes de IA" }, { en: "Security", pt: "Segurança" }],
    text: {
      en: `Do you know OpenKruise?

It is worth a look this week because v0.6.0 of OpenKruise Agents just came out. It is a sandbox for AI agents that runs natively on Kubernetes and the part that got my attention is how it treats the API key. The key lives in a Kubernetes Secret and the egress proxy adds it to the request on the way out, so the agent only ever sees a placeholder. It can also allow MCP calls by exact tool name with deny as the default.

The maintainers say plainly that a container running as root or with NET_ADMIN can get around the in-pod controls, which I trust more than a perfect-sounding pitch. https://www.cncf.io/blog/2026/11/03/openkruise-agents-v0-6-0-leaping-ahead-in-agent-sandbox-security-and-automation/`,
      pt: `Você conhece o OpenKruise?

Vale dar uma olhada esta semana, porque acabou de sair a v0.6.0 do OpenKruise Agents. É um sandbox para agentes de IA que roda nativamente no Kubernetes, e o que chamou minha atenção é como ele trata a API key. A chave fica em um Secret do Kubernetes e o proxy de egress a adiciona à requisição na saída, então o agente só enxerga um placeholder. Ele também pode liberar chamadas MCP pelo nome exato da ferramenta, com deny como padrão.

Os mantenedores dizem com todas as letras que um container rodando como root ou com NET_ADMIN consegue contornar os controles dentro do pod, o que me passa mais confiança do que um pitch que soa perfeito. https://www.cncf.io/blog/2026/11/03/openkruise-agents-v0-6-0-leaping-ahead-in-agent-sandbox-security-and-automation/`,
    },
  },
  {
    slug: "agent-substrate-gvisor",
    date: "2026-11-06",
    title: {
      en: "Agent Substrate and gVisor isolation",
      pt: "Agent Substrate e isolamento com gVisor",
    },
    sourceUrl: "https://opensource.googleblog.com/2026/11/sandboxing-untrusted-ai-agents-at-scale.html",
    sourceLabel: "Google Open Source Blog",
    tags: ["Kubernetes", { en: "AI Agents", pt: "Agentes de IA" }, "gVisor"],
    text: {
      en: `Still on agents and sandboxes. Yesterday it was about keeping the API key out of the agent. Today it is about where the agent actually runs.

Pods were built for services that stay up. Agents run a step, call a model and sit idle while still holding memory and a filesystem. Agent Substrate 1.0, now in the CNCF Sandbox with gVisor, snapshots the session when the agent pauses and returns the warm pod to a pool. Wakeup stays under half a second.

gVisor adds a userspace kernel underneath, so model-generated code never touches the host kernel. Density and isolation turn into the same design problem.
https://opensource.googleblog.com/2026/11/sandboxing-untrusted-ai-agents-at-scale.html`,
      pt: `Ainda sobre agentes e sandboxes. Ontem o assunto foi manter a API key longe do agente. Hoje é sobre onde o agente de fato roda.

Pods foram feitos para serviços que ficam no ar. Agentes executam um passo, chamam um modelo e ficam ociosos, ainda segurando memória e um filesystem. O Agent Substrate 1.0, agora no CNCF Sandbox com gVisor, tira um snapshot da sessão quando o agente pausa e devolve o pod aquecido para um pool. O wakeup fica abaixo de meio segundo.

O gVisor adiciona um kernel em userspace por baixo, então o código gerado pelo modelo nunca toca o kernel do host. Densidade e isolamento viram o mesmo problema de design.
https://opensource.googleblog.com/2026/11/sandboxing-untrusted-ai-agents-at-scale.html`,
    },
  },
  {
    slug: "github-actions-pull-request-target-block",
    date: "2026-11-09",
    title: {
      en: "GitHub Actions blocks pull_request_target by default in public repos",
      pt: "GitHub Actions bloqueia pull_request_target por padrão em repositórios públicos",
    },
    sourceUrl: "https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/",
    sourceLabel: "GitHub Changelog",
    tags: ["GitHub Actions", "CI/CD", { en: "Security", pt: "Segurança" }],
    text: {
      en: `Between 1 pm and 3 pm Brasília time today (4 to 6 pm UTC), GitHub switches on the pull_request_target block for public repositories as a dress rehearsal. Workflows on that trigger fail with an error annotation and never start a job. The permanent default lands on December 2.

The catch is that a brownout only catches what happens inside it. The trigger fires on pull request events, so a repo where nobody opens or pushes to a PR in those two hours sails through looking healthy. A quiet afternoon proves nothing. The real list is in Actions Insights, which already shows what the rule would block because it has been running in evaluate mode.

Most hits will be the boring automation everyone forgot. Labelers, greetings for first-time contributors, bots that post test results back on fork PRs. Moving them to pull_request is the advice you will read everywhere, but on a fork PR that trigger gets no secrets and a read-only GITHUB_TOKEN, so the bot that comments simply stops commenting. For those, an event policy that allows that one workflow file is the honest fix.

Private and internal repos and GitHub Enterprise Server are left out of this change. The trigger keeps working there, with the same risk it always had.

https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/`,
      pt: `Hoje, entre 13h e 15h no horário de Brasília (16h às 18h UTC), o GitHub liga o bloqueio do pull_request_target em repositórios públicos como um ensaio geral. Workflows com esse trigger falham com uma anotação de erro e nenhum job chega a começar. O bloqueio definitivo, por padrão, entra em 2 de dezembro.

O problema é que um brownout só pega o que acontece dentro dele. O trigger dispara em eventos de pull request, então um repositório em que ninguém abre ou faz push em um PR nessas duas horas passa ileso, com cara de saudável. Uma tarde tranquila não prova nada. A lista de verdade está no Actions Insights, que já mostra o que a regra bloquearia, porque ela vem rodando em modo de avaliação.

A maioria dos casos vai ser aquela automação chata que todo mundo esqueceu. Labelers, mensagens de boas-vindas para quem contribui pela primeira vez, bots que publicam resultados de teste em PRs de fork. Migrar para pull_request é o conselho que você vai ler em todo lugar, mas em PR de fork esse trigger não recebe secrets e ganha um GITHUB_TOKEN somente leitura, então o bot que comenta simplesmente para de comentar. Nesses casos, uma event policy que libere aquele arquivo de workflow específico é a correção honesta.

Repositórios privados e internos e o GitHub Enterprise Server ficam fora dessa mudança. Lá o trigger continua funcionando, com o mesmo risco de sempre.

https://github.blog/changelog/2026-11-02-pull_request_target-blocked-by-default-december-2/`,
    },
  },
];

export default posts;
