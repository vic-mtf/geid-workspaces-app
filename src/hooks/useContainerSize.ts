/**
 * useContainerSize — Observe la taille d'un conteneur via ResizeObserver.
 *
 * Retourne [ref, { width, height }]
 * Le composant se re-rend quand la taille change.
 */

import { useCallback, useRef, useState } from "react";

interface Size { width: number; height: number }

export default function useContainerSize(): [
  (node: HTMLElement | null) => void,
  Size,
] {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === Math.round(width) && prev.height === Math.round(height)
          ? prev
          : { width: Math.round(width), height: Math.round(height) }
      );
    });
    ro.observe(node);
    observerRef.current = ro;

    // Mesure initiale
    const rect = node.getBoundingClientRect();
    setSize({ width: Math.round(rect.width), height: Math.round(rect.height) });
  }, []);

  return [ref, size];
}
