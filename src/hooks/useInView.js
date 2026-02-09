import { useState, useEffect, useRef } from "react";

/**
 * Returns { ref, isVisible } — attach `ref` to a DOM node
 * and `isVisible` flips to true once the element enters the viewport.
 */
export default function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
