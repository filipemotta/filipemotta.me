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
];

export default posts;
