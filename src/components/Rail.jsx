import FadeIn from "./FadeIn";

/** Section layout: heading pinned in a left rail, content on the right. */
export default function Rail({ id, title, lead, children, className = "" }) {
  return (
    <section id={id} className={`section-y border-t border-white/[0.06] scroll-mt-16 ${className}`}>
      <div className="container-site grid gap-10 lg:grid-cols-12 lg:gap-12">
        <FadeIn className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-display-lg text-white text-balance">{title}</h2>
            {lead && <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-muted md:text-base">{lead}</p>}
          </div>
        </FadeIn>
        <div className="min-w-0 lg:col-span-8">{children}</div>
      </div>
    </section>
  );
}
