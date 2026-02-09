import { colors, fonts } from "./styles/theme";
import useActiveSection from "./hooks/useActiveSection";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import About from "./components/About";
import Skills from "./components/Skills";
import Experience from "./components/Experience";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

export default function App() {
  const activeSection = useActiveSection();

  return (
    <div style={{ background: colors.dark, color: colors.white, fontFamily: fonts.heading }}>
      <link href={fonts.googleImport} rel="stylesheet" />

      <Nav active={activeSection} />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Certifications />
      <Contact />
      <Footer />
    </div>
  );
}
