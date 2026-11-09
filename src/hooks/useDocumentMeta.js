import { useEffect } from "react";

/**
 * Sets document.title and <meta name="description"> while the calling page is
 * mounted, restoring the previous values (from index.html) on unmount.
 */
export default function useDocumentMeta(title, description) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    const prevTitle = document.title;
    const prevDescription = meta?.getAttribute("content");

    if (title) document.title = title;
    if (meta && description) meta.setAttribute("content", description);

    return () => {
      document.title = prevTitle;
      if (meta && prevDescription != null) meta.setAttribute("content", prevDescription);
    };
  }, [title, description]);
}
