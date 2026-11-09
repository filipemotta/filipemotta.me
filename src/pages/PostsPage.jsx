import { Link, useSearchParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import FadeIn from "../components/FadeIn";
import Pagination from "../components/Pagination";
import { PostCard, sortedPosts } from "../components/Posts";
import { useLanguage } from "../i18n/LanguageContext";
import useDocumentMeta from "../hooks/useDocumentMeta";

const PAGE_SIZE = 6;

/** /posts — every post, 6 per page; the page lives in ?page=N. */
export default function PostsPage() {
  const { t } = useLanguage();
  const [params] = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / PAGE_SIZE));
  const requested = parseInt(params.get("page"), 10);
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1;
  const visible = sortedPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageSuffix = page > 1 ? ` (${t("posts.pageN").replace("{n}", page)})` : "";
  useDocumentMeta(`${t("posts.allTitle")}${pageSuffix} — Filipe Motta`, t("posts.allDescription"));

  return (
    <>
      <Nav active="posts" />
      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-12">
            <Link to="/#posts" className="text-sm text-white/50 hover:text-white transition-colors">
              ← {t("posts.backHome")}
            </Link>
            <p className="text-sky-500 font-mono text-xs tracking-widest uppercase mt-8 mb-2">
              {t("posts.label")}
            </p>
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-white">
              {t("posts.allTitle")}
            </h1>
            <p className="mt-3 text-white/50">{t("posts.allDescription")}</p>
          </div>

          {visible.length === 0 ? (
            <p className="max-w-4xl mx-auto text-white/50">{t("posts.empty")}</p>
          ) : (
            visible.map((post, i) => (
              <FadeIn key={post.slug} delay={Math.min(i, 3) * 80}>
                <PostCard post={post} />
              </FadeIn>
            ))
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            hrefFor={(p) => (p === 1 ? "/posts" : `/posts?page=${p}`)}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
