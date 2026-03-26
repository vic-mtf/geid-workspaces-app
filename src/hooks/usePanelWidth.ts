/**
 * usePanelWidth — Largeur persistee d'un panneau ajustable.
 *
 * Lit la valeur depuis Redux (persiste en sessionStorage).
 * Retourne [width, setWidth] — setWidth met a jour Redux.
 * Chaque panneau est identifie par une cle unique.
 */

import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store";
import { setPanelWidth } from "@/redux/data";

export default function usePanelWidth(key: string, defaultWidth: number): [number, (w: number) => void] {
  const dispatch = useDispatch<AppDispatch>();

  const width = useSelector((store: RootState) =>
    ((store.data as unknown as Record<string, unknown>).panelWidths as Record<string, number> | undefined)?.[key]
  ) ?? defaultWidth;

  const setWidth = useCallback((w: number) => {
    dispatch(setPanelWidth({ key, width: w }));
  }, [dispatch, key]);

  return [width, setWidth];
}
