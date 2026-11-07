import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { colors } from "../styles/theme";
import FadeIn from "./FadeIn";
import Pagination from "./Pagination";
import { useLanguage } from "../i18n/LanguageContext";
import posts from "../data/posts";

const COLLAPSE_THRESHOLD = 700; // characters
const URL_RE = /(https?:\/\/[^\s]+)/g;
const LOCALES = { en: "en-US", pt: "pt-BR" };
const HOME_PAGE_SIZE = 3;

export const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const postPath = (slug) => `/posts/${slug}`;

/** Plain-text excerpt for meta descriptions. */
export function excerpt(text, max = 160) {
  const flat = text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

function formatDate(iso, lang) {
  const [y, m, d] = iso.split("-").map(Number);
  // Build a local date so the day never shifts with the visitor's timezone.
  return new Date(y, m - 1, d).toLocaleDateString(LOCALES[lang] || LOCALES.en, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Turns plain URLs in a line of text into links, keeping trailing punctuation outside.
function linkify(line, keyPrefix) {
  return line.split(URL_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const match = part.match(/^(.*?)([.,;:!?)\]]*)$/);
    const url = match[1];
    const trailing = match[2];
    return (
      <span key={`${keyPrefix}-${i}`}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all"
        >
          {url}
        </a>
        {trailing}
      </span>
    );
  });
}

function PostText({ text }) {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.map((para, pi) => (
    <p key={pi} className="leading-relaxed mb-4 last:mb-0 text-white/60">
      {para.split("\n").map((line, li, arr) => (
        <span key={li}>
          {linkify(line, `${pi}-${li}`)}
          {li < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  ));
}

/**
 * A post card. `full` renders the permalink-page variant: no collapsing and the
 * title as the page's h1 instead of a link.
 */
export function PostCard({ post, full = false }) {
  const { lang, t } = useLanguage();
  const collapsible = !full && post.text.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);
  const collapsed = collapsible && !expanded;

  return (
    <article
      id={`post-${post.slug}`}
      className="max-w-4xl mx-auto mb-8 glass-panel rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-white/20 transition-all duration-500 scroll-mt-24"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/5 to-blue-500/5 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <time dateTime={post.date} className="font-mono text-xs text-white/40">
            {formatDate(post.date, lang)}
          </time>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold tracking-wider text-white/60 bg-white/5 border border-white/10">
            {post.lang}
          </span>
        </div>

        {full ? (
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white mb-6" lang={post.lang}>
            {post.title}
          </h1>
        ) : (
          <h3 className="text-2xl font-medium tracking-tight text-white mb-5" lang={post.lang}>
            <Link to={postPath(post.slug)} className="hover:text-sky-300 transition-colors">
              {post.title}
            </Link>
          </h3>
        )}

        <div className="relative" lang={post.lang}>
          <div className={collapsed ? "max-h-64 overflow-hidden" : ""}>
            <PostText text={post.text} />
          </div>
          {collapsed && (
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
              style={{ background: `linear-gradient(to top, ${colors.dark}, transparent)` }}
            />
          )}
        </div>

        {collapsible && (
          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3 text-sm font-medium text-sky-400 hover:text-sky-300 bg-transparent border-none cursor-pointer p-0"
          >
            {expanded ? t("posts.readLess") : t("posts.readMore")}
          </button>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-1 rounded text-white/30 bg-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
          <span className="text-white/40">{t("posts.source")}:</span>
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/src inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
          >
            {post.sourceLabel || hostname(post.sourceUrl)}
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              className="group-hover/src:translate-x-0.5 transition-transform"
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
          {!full && (
            <Link
              to={postPath(post.slug)}
              className="ml-auto text-white/50 hover:text-white font-medium transition-colors"
            >
              {t("posts.permalink")} →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

/** Home page section: newest posts, 3 per page, paginated in place. */
export default function Posts() {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const listRef = useRef(null);

  if (sortedPosts.length === 0) return null;

  const totalPages = Math.ceil(sortedPosts.length / HOME_PAGE_SIZE);
  const visible = sortedPosts.slice((page - 1) * HOME_PAGE_SIZE, page * HOME_PAGE_SIZE);

  // Changing page swaps cards of different heights; keep the list's top in view
  // instead of leaving the reader stranded (or jumping to the top of the site).
  const changePage = (p) => {
    setPage(p);
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section id="posts" className="py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn>
          <p className="text-sky-500 font-mono text-xs tracking-widest uppercase mb-2 text-center">
            {t("posts.label")}
          </p>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-16 text-center text-white">
            {t("posts.heading")}
          </h2>
        </FadeIn>

        <div ref={listRef} className="scroll-mt-24">
          {visible.map((post, i) => (
            <FadeIn key={post.slug} delay={Math.min(i, 3) * 100}>
              <PostCard post={post} />
            </FadeIn>
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={changePage} />

        <div className="mt-10 text-center">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-sky-300 border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 hover:text-white transition-colors"
          >
            {t("posts.seeAll")} ({sortedPosts.length}) →
          </Link>
        </div>
      </div>
    </section>
  );
}
