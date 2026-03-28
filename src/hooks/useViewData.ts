/**
 * useViewData — Hook pour les vues spéciales (Recent, Favoris, Corbeille).
 *
 * 1ère visite de la session : skeleton → fetch → stocke en Redux + mémoire
 * Visites suivantes : données mémoire instantanées → fetch silencieux
 *   → toast SEULEMENT si les données ont changé
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setViewCache, type ViewCacheEntry } from "@/redux/data";
import { RootState } from "@/types";

interface UseViewDataOptions {
  viewKey: string;
  fetchFn: () => Promise<any[]>;
  mapFn: (raw: any[]) => any[];
}

function dataFingerprint(items: any[]): string {
  return items.map((x) => `${x._id}:${x.name}`).join("|");
}

// Cache mémoire global — survit aux remontages de composants
const memoryCache: Record<string, any[]> = {};

export default function useViewData({ viewKey, fetchFn, mapFn }: UseViewDataOptions) {
  const dispatch = useDispatch();
  const cached = useSelector(
    (store: RootState) => ((store.data as any).viewCache as Record<string, ViewCacheEntry>)?.[viewKey]
  );

  // Source de données initiale : mémoire > Redux > vide
  const initialData = memoryCache[viewKey] || (cached?.data as any[]) || [];
  const hasInitialData = initialData.length > 0;

  const [data, setData] = useState<any[]>(initialData);
  const [loading, setLoading] = useState(!hasInitialData);
  const [showToast, setShowToast] = useState(false);

  const dataRef = useRef(data);
  dataRef.current = data;
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback((silent: boolean) => {
    if (!silent) setLoading(true);
    fetchFn()
      .then((raw) => {
        if (!mountedRef.current) return;
        const mapped = mapFn(raw);
        const oldFp = dataFingerprint(dataRef.current);
        const newFp = dataFingerprint(mapped);

        if (oldFp === newFp) return;

        const hadData = dataRef.current.length > 0;
        setData(mapped);
        memoryCache[viewKey] = mapped; // Sauvegarder en mémoire
        dispatch(setViewCache({ view: viewKey, data: mapped }));

        if (silent && hadData) setShowToast(true);
      })
      .catch(() => { if (!silent && mountedRef.current) setData([]); })
      .finally(() => { if (mountedRef.current) setLoading(false); });
  }, [fetchFn, mapFn, viewKey, dispatch]);

  // Au montage : si données dispo → refresh silencieux. Sinon → skeleton.
  useEffect(() => {
    if (hasInitialData) {
      load(true);
    } else {
      load(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Écouter les événements de reload
  useEffect(() => {
    const root = document.getElementById("root");
    const handler = () => load(true);
    root?.addEventListener(`_reload_${viewKey}`, handler);
    root?.addEventListener("_reload_current_dir", handler);
    return () => {
      root?.removeEventListener(`_reload_${viewKey}`, handler);
      root?.removeEventListener("_reload_current_dir", handler);
    };
  }, [load, viewKey]);

  return { data, loading, showToast, hideToast: () => setShowToast(false), reload: load };
}
