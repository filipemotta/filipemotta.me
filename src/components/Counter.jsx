import { useState, useEffect } from "react";
import useInView from "../hooks/useInView";

export default function Counter({ end, suffix = "", duration = 2000 }) {
  const { ref, isVisible } = useInView(0.5);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let current = 0;
    const step = Math.ceil(end / (duration / 16));

    const id = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(id);
      } else {
        setCount(current);
      }
    }, 16);

    return () => clearInterval(id);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
