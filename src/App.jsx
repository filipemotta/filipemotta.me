import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { colors, fonts } from "./styles/theme";
import useActiveSection from "./hooks/useActiveSection";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Publications from "./components/Publications";
import Posts from "./components/Posts";
import Experience from "./components/Experience";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import PostsPage from "./pages/PostsPage";
import PostPage from "./pages/PostPage";

function Home() {
  const activeSection = useActiveSection();
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Scroll to #section when arriving from another page (e.g. Nav on /posts),
  // and send legacy #post-<slug> anchors to the post's permalink.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    if (id.startsWith("post-")) {
      navigate(`/posts/${id.slice(5)}`, { replace: true });
      return;
    }
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => clearTimeout(timer);
  }, [hash, navigate]);

  return (
    <>
      <Nav active={activeSection} />
      <Hero />
      <About />
      <Skills />
      <Publications />
      <Posts />
      <Experience />
      <Certifications />
      <Contact />
      <Footer />
    </>
  );
}

// Start each new page at the top (hash links on home are handled by Home).
function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, search, hash]);
  return null;
}

export default function App() {
  return (
    <div style={{ background: colors.dark, color: colors.white, fontFamily: fonts.heading }}>
      <link href={fonts.googleImport} rel="stylesheet" />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:slug" element={<PostPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
