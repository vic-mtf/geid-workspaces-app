import { useState, useCallback, useRef } from "react";

export default function useAdaptiveLoading<T>(fetchFn: () => Promise<T[]>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNewData, setHasNewData] = useState(false);
  const visitedRef = useRef(false);

  const load = useCallback(async () => {
    const isFirstLoad = !visitedRef.current;
    if (isFirstLoad) setLoading(true);
    try {
      const result = await fetchFn();
      const changed = JSON.stringify(result.map((r: any) => r._id || r.name)) !== JSON.stringify(data.map((r: any) => r._id || r.name));
      setData(result);
      if (!isFirstLoad && changed) {
        setHasNewData(true);
        setTimeout(() => setHasNewData(false), 3000);
      }
    } catch {
      if (isFirstLoad) setData([]);
    } finally {
      setLoading(false);
      visitedRef.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn]);

  return { data, loading: loading && !visitedRef.current, hasNewData, load };
}
