import { useEffect, useState } from "react";
import { api, type TransactionPage } from "../../types";
export function useLedger(
  userId: string | undefined,
  enabled: boolean,
  month: string,
  revision: number,
) {
  const [search, setSearch] = useState(""),
    [kind, changeKind] = useState(""),
    [walletId, setWalletId] = useState(""),
    [categoryId, setCategoryId] = useState(""),
    [sort, setSort] = useState("desc"),
    [page, setPage] = useState(1),
    [txs, setTxs] = useState<TransactionPage | null>(null),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const setKind = (value: string) => {
    changeKind(value);
    if (value === "TRANSFER") setCategoryId("");
  };
  useEffect(() => {
    setSearch("");
    changeKind("");
    setWalletId("");
    setCategoryId("");
    setSort("desc");
    setTxs(null);
  }, [userId]);
  useEffect(
    () => setPage(1),
    [month, search, kind, walletId, categoryId, sort],
  );
  useEffect(() => {
    if (!userId || !enabled) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      api<TransactionPage>(
        "/transactions?" +
          new URLSearchParams({
            month,
            page: String(page),
            kind,
            search: search.trim(),
            walletId,
            categoryId,
            sort,
          }),
        { signal: controller.signal },
      )
        .then((data) => {
          if (!controller.signal.aborted) {
            setTxs(data);
            if (page > data.pages) setPage(data.pages);
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 150);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    userId,
    enabled,
    month,
    revision,
    page,
    kind,
    search,
    walletId,
    categoryId,
    sort,
  ]);
  const clear = () => {
    setSearch("");
    changeKind("");
    setWalletId("");
    setCategoryId("");
    setSort("desc");
  };
  return {
    search,
    setSearch,
    kind,
    setKind,
    walletId,
    setWalletId,
    categoryId,
    setCategoryId,
    sort,
    setSort,
    page,
    setPage,
    txs,
    setTxs,
    loading,
    error,
    clear,
    query: { month, kind, search: search.trim(), walletId, categoryId, sort },
  };
}
export type LedgerState = ReturnType<typeof useLedger>;
