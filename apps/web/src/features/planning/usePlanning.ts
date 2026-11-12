import { useEffect, useState } from "react";
import { api } from "../../types";
import type { Rule, Draft, Goal, PlanningData } from "./models";
export function usePlanning(month: string) {
  const [data, setData] = useState<PlanningData | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [version, setVersion] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      api<{ rules: Rule[]; drafts: Draft[] }>("/recurring?month=" + month, {
        signal: abort.signal,
      }),
      api<Goal[]>("/goals", { signal: abort.signal }),
    ])
      .then(([r, goals]) => {
        if (!abort.signal.aborted) setData({ ...r, goals });
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false);
      });
    return () => abort.abort();
  }, [month, version]);
  return { data, loading, error, reload: () => setVersion((v) => v + 1) };
}
