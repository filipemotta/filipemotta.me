import { useState, useEffect } from "react";

const SECTIONS = ["about", "skills", "guide", "projects", "certifications", "contact"];

/**
 * Returns the id of whichever section is closest to the top of the viewport.
 */
export default function useActiveSection() {
  const [active, setActive] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      // walk backwards so the *last* section whose top is above 200px wins
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i]);
        if (el && el.getBoundingClientRect().top < 200) {
          setActive(SECTIONS[i]);
          return;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return active;
}
