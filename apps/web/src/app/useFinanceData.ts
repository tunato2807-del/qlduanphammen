import { useEffect, useState } from "react";
import { api, type Summary, type Category } from "../types";
export function useFinanceData(
  userId: string | undefined,
  month: string,
  revision: number,
) {
  const [summary, setSummary] = useState<Summary | null>(null),
    [categories, setCategories] = useState<Category[]>([]),
    [owner, setOwner] = useState(""),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    if (!userId) {
      setSummary(null);
      setCategories([]);
      setOwner("");
      return () => controller.abort();
    }
    setLoading(true);
    Promise.all([
      api<Summary>("/reports/summary?month=" + month, {
        signal: controller.signal,
      }),
      api<Category[]>("/categories", { signal: controller.signal }),
    ])
      .then(([s, c]) => {
        if (!controller.signal.aborted) {
          setOwner(userId);
          setSummary(s);
          setCategories(c);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [userId, month, revision]);
  return {
    summary: owner === userId && summary?.month === month ? summary : null,
    categories: owner === userId ? categories : [],
    setSummary,
    setCategories,
    loading,
    error,
  };
}
