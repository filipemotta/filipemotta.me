import { Link, useParams } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { PostCard, sortedPosts, excerpt, localizePost } from "../components/Posts";
import { useLanguage } from "../i18n/LanguageContext";
import useDocumentMeta from "../hooks/useDocumentMeta";

/** /posts/:slug — permalink page for a single post. */
export default function PostPage() {
  const { lang, t } = useLanguage();
  const { slug } = useParams();
  const post = sortedPosts.find((p) => p.slug === slug);
  const localized = post && localizePost(post, lang);

  useDocumentMeta(
    localized ? `${localized.title} — Filipe Motta` : `${t("posts.notFound")} — Filipe Motta`,
    localized ? excerpt(localized.text) : undefined
  );

  return (
    <>
      <Nav active="posts" />
      <main className="pt-32 pb-24 min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-8">
            <Link to="/posts" className="text-sm text-white/50 hover:text-white transition-colors">
              ← {t("posts.backToAll")}
            </Link>
          </div>

          {post ? (
            <PostCard post={post} full />
          ) : (
            <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-10">
              <h1 className="text-2xl font-medium text-white mb-3">{t("posts.notFound")}</h1>
              <p className="text-white/50">{t("posts.notFoundText")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
