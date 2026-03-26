import React, { useCallback, useRef } from "react";
import { Box } from "@mui/material";

interface Props {
  minWidth?: number;
  maxWidth?: number;
  onResize: (rightWidth: number) => void;
}

const DetailResizeDivider = React.memo(function DetailResizeDivider({
  minWidth = 200,
  maxWidth = 500,
  onResize,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  const rafRef = useRef<number | null>(null);

  const clamp = useCallback((clientX: number): number | null => {
    const el = containerRef.current;
    const parent = el?.parentElement;
    if (!parent) return null;
    const rect = parent.getBoundingClientRect();
    const raw = rect.right - clientX - 1;
    return Math.max(minWidth, Math.min(maxWidth, raw));
  }, [minWidth, maxWidth]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    el.classList.add("active");

    const onMove = (ev: MouseEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const v = clamp(ev.clientX);
        if (v !== null) onResizeRef.current(v);
      });
    };
    const onUp = (ev: MouseEvent) => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      el.classList.remove("active");
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      const v = clamp(ev.clientX);
      if (v !== null) onResizeRef.current(v);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [clamp]);

  return (
    <Box
      ref={containerRef}
      onMouseDown={onMouseDown}
      sx={{
        width: "100%",
        bgcolor: "divider",
        cursor: "col-resize",
        position: "relative",
        zIndex: 10,
        display: { xs: "none", md: "block" },
        "&::after": { content: '""', position: "absolute", top: 0, bottom: 0, left: -6, width: 13, cursor: "col-resize", zIndex: 10 },
        "&:hover, &.active": { bgcolor: "primary.main", width: 3 },
        transition: "background-color 0.15s, width 0.15s",
      }}
    />
  );
});

export default DetailResizeDivider;
