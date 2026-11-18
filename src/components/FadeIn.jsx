import useInView from "../hooks/useInView";

export default function FadeIn({ children, delay = 0, className = "" }) {
  const { ref, isVisible } = useInView(0.1);

  return (
    <div
      ref={ref}
      className={`motion-reduce:!opacity-100 motion-reduce:!transform-none motion-reduce:!blur-0 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : "translateY(18px)",
        filter: isVisible ? "none" : "blur(6px)",
        transition: `opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
