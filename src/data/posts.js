/**
 * Posts shown in the "Posts" section.
 *
 * To add a post, append one object to the array below. Order in this file
 * does not matter: the component sorts by `date`, newest first. If the array
 * is empty, the section and its nav link are hidden.
 *
 * Schema:
 *   slug        string   required  Unique, URL-safe id. Anchor becomes #post-<slug>.
 *   date        string   required  Publication date, "yyyy-mm-dd".
 *   title       string   required  Post title.
 *   text        string   required  Full post text. Line breaks are preserved
 *                                  (blank line = new paragraph) and plain
 *                                  http(s) URLs are turned into links.
 *   sourceUrl   string   required  Original source of the subject (changelog,
 *                                  official blog, docs).
 *   sourceLabel string   optional  Text for the source link. Defaults to the URL's hostname.
 *   tags        string[] optional  Short topic tags.
 *   lang        "pt"|"en" required Language the post was written in.
 */
const posts = [
  {
    slug: "kubevirt-cncf-graduated",
    date: "2026-11-07",
    title: "KubeVirt se torna projeto Graduated da CNCF",
    lang: "en",
    sourceUrl: "https://www.cncf.io/projects/kubevirt/",
    sourceLabel: "CNCF – KubeVirt",
    tags: ["Kubernetes", "CNCF", "KubeVirt"],
    text: `KubeVirt lets you run virtual machines on Kubernetes next to your containers, managed with the same APIs and tools. It's now a CNCF Graduated project, after a TOC vote that closed on November 4 with nine in favor and none against.

For many teams this settles the maturity question that usually ends the conversation early.

What it doesn't settle is the migration. VMs that expect a flat network need real design work. And the people who run the hypervisor today have to become part of the platform team instead of a separate queue.

One control plane for VMs and containers is a strong argument. It's an operating model change before it's a technology change.

https://www.cncf.io/projects/kubevirt/`,
  },
  {
    slug: "aws-api-mcp-server-oauth",
    date: "2026-10-29",
    title: "OAuth e identidade no AWS API MCP Server",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/security/security-bulletins/2026-152-aws/",
    sourceLabel: "AWS Security Bulletin",
    tags: ["AWS", "MCP", "Security", "OAuth"],
    text: `A token that is valid is not the same as a token that is meant for you.

AWS just published a security bulletin for the AWS API MCP Server: when running over HTTP with OAuth, it accepted tokens without properly checking who they were issued for. A token minted for another app in the same identity provider could be used to make AWS API calls with the server's credentials. Around the same time, MCP tooling advisories fixed clients that didn't bind OAuth credentials to a verified issuer.

None of this is exotic. It's the same identity mistake we spent a decade fixing in service-to-service auth. The difference is that an MCP server for cloud operations usually sits on top of powerful credentials, so the blast radius is your account, not one endpoint.

What I check before an MCP server touches infrastructure:
- audience and issuer pinned explicitly, never "any valid token"
- local stdio transport unless there's a real reason to expose it over the network
- credentials scoped to the task, not an admin role
- the MCP server treated as a workload, with its own identity, owner and review

Agents in operations will be judged like any other workload: who it is, and what it's allowed to do.

https://aws.amazon.com/security/security-bulletins/2026-152-aws/`,
  },
  {
    slug: "eks-ca-rotation",
    date: "2026-10-29",
    title: "Rotação de certificados CA no EKS",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-dashboard-fleet-wide-visibility-certificate-authority-ca-rotation/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", "Certificates"],
    text: `The certificate that expires is usually the one nobody owned.

EKS clusters created in 2018 got a certificate authority issued for 10 years. AWS is now saying rotation should start, and the EKS Dashboard shows CA rotation status across your whole fleet.

If you run a handful of clusters, that is a calendar reminder. If you run hundreds, it is a program: inventory which clusters are affected, plan the rotation by environment, test what depends on the old CA (kubeconfigs, CI runners, webhooks, service mesh trust), and track it until the last cluster is done.

The lesson I keep seeing at scale: long-lived credentials don't fail on day one, they fail years later, when the person who created them has moved on. Put expiry dates in an inventory with an owner, not in someone's memory.

https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-dashboard-fleet-wide-visibility-certificate-authority-ca-rotation/`,
  },
  {
    slug: "github-actions-lockfiles",
    date: "2026-10-30",
    title: "Lockfiles para GitHub Actions",
    lang: "en",
    sourceUrl: "https://github.blog/changelog/2026-10-28-github-actions-workflow-lockfiles-are-generally-available/",
    sourceLabel: "GitHub Changelog",
    tags: ["GitHub Actions", "Supply Chain", "CI/CD"],
    text: `Pinning to a tag is not pinning.

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
  },
  {
    slug: "k8s-statefulset-confused-deputy",
    date: "2026-10-30",
    title: "Isolamento de namespaces e StatefulSet",
    lang: "en",
    sourceUrl: "https://groups.google.com/g/kubernetes-announce/c/gI9iatwmRbA",
    sourceLabel: "Kubernetes Announce",
    tags: ["Kubernetes", "CVE", "RBAC"],
    text: `Namespace isolation is only as strong as the controllers acting on your behalf.

Kubernetes disclosed CVE-2026-2270 this week: a confused deputy in the StatefulSet controller. A user with namespace-scoped write permission on StatefulSets and ControllerRevisions could make the controller create a pod in a different namespace, with full control over that pod's spec. The pod is garbage-collected right away unless the attacker builds a valid owner reference, which requires the UID of an existing StatefulSet in the victim namespace. It's rated Medium (5.9), but the pattern matters more than the score.

What to do:
- Upgrade kube-controller-manager to 1.34.12, 1.35.9, 1.36.5 or 1.37.1. On managed Kubernetes, check which control plane patch version your provider is running.
- The same releases fix CVE-2026-76654, an NTLM coercion issue on Windows nodes through subPath symlinks. If you run Windows node pools, give that one attention too.
- Until you're patched, review who holds write access on controllerrevisions. Most app teams never need it; it usually rides along in broad wildcard roles.

The lesson I keep relearning when operating many clusters: RBAC reviews tend to focus on pods, secrets and exec. The less obvious resources that controllers read from deserve the same scrutiny, because the controller has cluster-wide power and acts on whatever you feed it.

Advisory: https://groups.google.com/g/kubernetes-announce/c/gI9iatwmRbA`,
  },
  {
    slug: "eks-auto-mode-gateway-api",
    date: "2026-10-31",
    title: "Gateway API no EKS Auto Mode",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-auto-mode-kubernetes-gateway-api/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", "Gateway API"],
    text: `Ingress was never designed for teams that share a cluster. Gateway API was.

This week AWS added Kubernetes Gateway API support to EKS Auto Mode. You define Gateway and HTTPRoute resources, and Auto Mode provisions and manages the load balancers: an ALB for HTTP and gRPC routes, an NLB for TCP and UDP. No controller to install, patch or upgrade.

Why it matters: Gateway API splits ownership the way platform teams actually work. The platform team owns the Gateway (listeners, TLS, which namespaces may attach routes). App teams own their routes. Cross-namespace routing, weighted traffic splitting and header-based routing are part of the spec instead of controller-specific annotations.

What I'd check before turning it on:

1. CRD ownership. Enabling it means choosing whether AWS manages the Gateway API CRDs. Managed mode requires any CRDs already in the cluster to be at v1, otherwise the change is rejected. If a mesh or another gateway controller already installs them, start unmanaged.

2. Coexistence. The Auto Mode controllers have their own GatewayClass controller names, so they can run next to Istio or Envoy Gateway in the same cluster. Be explicit about which GatewayClass each team should use.

3. Feature gaps. Not every Gateway API field maps to an ALB or NLB capability. Read the feature comparison before promising a routing behavior to an app team.

4. Migration path. Existing Ingress and Service type LoadBalancer resources keep working, so move one route at a time and keep rollback trivial.

The paved road gets simpler when the platform owns the gateway and teams own their routes, as long as someone clearly owns the CRDs too.

Source: https://aws.amazon.com/about-aws/whats-new/2026/10/amazon-eks-auto-mode-kubernetes-gateway-api/`,
  },
  {
    slug: "aws-privateca-issuer-cve",
    date: "2026-10-31",
    title: "Falha de autorização no AWS Private CA Issuer",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/security/security-bulletins/2026-156-aws/",
    sourceLabel: "AWS Security Bulletin",
    tags: ["AWS", "cert-manager", "CVE", "PKI"],
    text: `A certificate issuer is a privilege boundary. Treat its configuration like RBAC.

AWS disclosed CVE-2026-119115 this week in the AWS Private CA Connector for Kubernetes (aws-privateca-issuer, the cert-manager issuer for AWS Private CA). In affected versions, under certain conditions, a user whose approval policy only authorized a namespace-scoped issuer could obtain certificates signed by a cluster-scoped issuer, including subordinate CA certificates. A subordinate CA is not just one certificate. It is the ability to mint more of them.

Fixed versions: aws-privateca-issuer v1.10.1 and the EKS add-on v1.10.1-eksbuild.1.

The catch: the fix requires issuerRef.kind to be exactly AWSPCAIssuer or AWSPCAClusterIssuer and to match the issuer it references. Certificates, CertificateRequests or Ingress annotations with a missing or wrong kind can stop renewing, and you may only notice when the current certificate expires.

What I'd do:

1. Inventory every issuerRef that points to a Private CA issuer and fix the kind before upgrading.
2. Upgrade, then force a test issuance and a renewal. A healthy pod does not prove renewals work.
3. If the upgrade has to wait, scope approval policies and RBAC by issuer name and kind.
4. Review who can create Certificate resources in each namespace. That list is your real exposure.

Source: https://aws.amazon.com/security/security-bulletins/2026-156-aws/`,
  },
  {
    slug: "emudhra-incident-go-binaries",
    date: "2026-11-02",
    title: "Incidente eMudhra e binários Go",
    lang: "en",
    sourceUrl: "https://go.dev/blog/emudhra-incident",
    sourceLabel: "Go Blog",
    tags: ["Go", "PKI", "Security"],
    text: `Did the eMudhra CA incident make it into your cluster, or only into your browser?

Browsers were covered within hours through their own revocation channels. Most of what runs a Kubernetes platform doesn't get that treatment.

On Linux, Go has no platform revocation API to lean on, so the Go team's fix (1.27.3 and 1.26.10, released Oct 19) is a denylist of the compromised intermediate keys compiled into crypto/x509. Compiled in is the part that matters. A Go binary built before that release still trusts those intermediates: Helm or OpenTofu on a CI runner, your operators, the internal controller nobody has rebuilt in two years. Containers also carry their own CA bundle, so refreshing the nodes doesn't reach them either.

This past week the cloud native projects shipped their side of it. cert-manager, Cilium, Envoy, Crossplane, Prometheus, SPIRE, Trivy and Atlantis, among others, cut patch releases. Upgrading those is the easy part.

The in-house binaries are where it gets slow. Two commands from Go's own write-up help:

go version -m ./your-binary
govulncheck -mode=binary ./your-binary

The first shows which toolchain built it, the second whether it's affected.

What this really tests is a question most platform teams can't answer fast: which toolchain built each binary we run, and could we rebuild all of them today? If answering takes a spreadsheet and a few days, that's the gap worth closing, more than this one CVE.

https://go.dev/blog/emudhra-incident`,
  },
  {
    slug: "step-functions-mcp-tools",
    date: "2026-11-03",
    title: "Step Functions como ferramentas MCP",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/10/step-functions-workflows-ai-agent-tools/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "Step Functions", "MCP", "AI Agents"],
    text: `Most agent demos I see let the model do two jobs at once: decide that something should happen and decide how it happens, step by step. The first job is where models are useful. The second one is where incidents come from.

AWS shipped something last week that splits those jobs cleanly. Step Functions workflows can now be exposed to agents as MCP tools through Bedrock AgentCore Gateway. The agent picks the workflow and the input. The state machine owns the order of the steps, the retries and the approvals. No Lambda glue, no custom MCP server, and existing Standard and Express workflows work unchanged.

For ops work I like this more than another clever prompt. A rollback, a node drain, a certificate rotation: these already have a correct sequence and on a bad night nobody wants a model improvising it. Wrap the runbook you already trust, let the agent call it, and keep the human approval as a task-token step inside the workflow instead of a sentence in the system prompt.

Two things I'd still check before wiring it up. The gateway calls Step Functions with its own service role, so that role, not the agent, is your real blast radius. Expose only the state machines and operations you'd hand to a new on-call engineer. And since the agent can read execution history, workflow input and output end up in the model's context, so keep secrets out of those payloads.

What I don't know yet is how well agents choose between twenty similar workflows. My guess is that naming and descriptions will matter more than anyone expects.

https://aws.amazon.com/about-aws/whats-new/2026/10/step-functions-workflows-ai-agent-tools/`,
  },
  {
    slug: "istio-free-ebook",
    date: "2026-11-03",
    title: "Ebook gratuito sobre Istio",
    lang: "en",
    sourceUrl: "https://filipemotta.me/istio/",
    sourceLabel: "filipemotta.me",
    tags: ["Istio", "Service Mesh", "Ebook"],
    text: `The last part of my Istio series went out yesterday, so I put all six into one free ebook.

It is 159 pages and six chapters, and every chapter has a lab repository you can run yourself. It starts at the first route and ends with GKE and EKS in one mesh. In between there is resilience and egress, mTLS and authorization policies, reading Envoy through proxy-config, and onboarding VMs behind an HA VPN.

I wrote it for people who run Istio on a platform that has to keep serving traffic while it changes. Sidecar and ambient are both covered on Istio 1.31. You leave an email and get the PDF and EPUB links in your inbox.

https://filipemotta.me/istio/`,
  },
  {
    slug: "eks-argocd-notifications",
    date: "2026-11-04",
    title: "Notificações do Argo CD no EKS",
    lang: "en",
    sourceUrl: "https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-argo-cd-notifications/",
    sourceLabel: "AWS What's New",
    tags: ["AWS", "EKS", "Argo CD", "GitOps"],
    text: `The first Argo CD notification most teams set up is "sync succeeded" in a Slack channel and a month later that channel is muted. A green sync only tells you git and the cluster agree. It says nothing about whether what you deployed is healthy, so the triggers I actually want are on-sync-failed and on-health-degraded, going to the same place as the rest of the on-call signal.

EKS Capabilities for Argo CD now supports Notifications, with the same triggers, templates and annotations you'd use upstream. The detail I liked is that SQS and EventBridge authenticate with the capability's IAM role and a Slack token can be a Secrets Manager ARN instead of one more secret living in the cluster. EventBridge is where it gets interesting, because a degraded app can start a workflow instead of waiting for someone to scroll a channel. https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-eks-argo-cd-notifications/`,
  },
  {
    slug: "openkruise-agents-credentials",
    date: "2026-11-05",
    title: "OpenKruise Agents e proteção de credenciais",
    lang: "en",
    sourceUrl: "https://www.cncf.io/blog/2026/11/03/openkruise-agents-v0-6-0-leaping-ahead-in-agent-sandbox-security-and-automation/",
    sourceLabel: "CNCF Blog",
    tags: ["Kubernetes", "AI Agents", "Security"],
    text: `Do you know OpenKruise?

It is worth a look this week because v0.6.0 of OpenKruise Agents just came out. It is a sandbox for AI agents that runs natively on Kubernetes and the part that got my attention is how it treats the API key. The key lives in a Kubernetes Secret and the egress proxy adds it to the request on the way out, so the agent only ever sees a placeholder. It can also allow MCP calls by exact tool name with deny as the default.

The maintainers say plainly that a container running as root or with NET_ADMIN can get around the in-pod controls, which I trust more than a perfect-sounding pitch. https://www.cncf.io/blog/2026/11/03/openkruise-agents-v0-6-0-leaping-ahead-in-agent-sandbox-security-and-automation/`,
  },
  {
    slug: "agent-substrate-gvisor",
    date: "2026-11-06",
    title: "Agent Substrate e isolamento com gVisor",
    lang: "en",
    sourceUrl: "https://opensource.googleblog.com/2026/11/sandboxing-untrusted-ai-agents-at-scale.html",
    sourceLabel: "Google Open Source Blog",
    tags: ["Kubernetes", "AI Agents", "gVisor"],
    text: `Still on agents and sandboxes. Yesterday it was about keeping the API key out of the agent. Today it is about where the agent actually runs.

Pods were built for services that stay up. Agents run a step, call a model and sit idle while still holding memory and a filesystem. Agent Substrate 1.0, now in the CNCF Sandbox with gVisor, snapshots the session when the agent pauses and returns the warm pod to a pool. Wakeup stays under half a second.

gVisor adds a userspace kernel underneath, so model-generated code never touches the host kernel. Density and isolation turn into the same design problem.
https://opensource.googleblog.com/2026/11/sandboxing-untrusted-ai-agents-at-scale.html`,
  },
];

export default posts;
