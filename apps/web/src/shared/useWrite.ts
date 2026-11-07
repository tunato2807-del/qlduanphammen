import { useCallback, useRef } from "react";
import { api } from "./api";
/** Preserve the request key after every failed response, until a response confirms success. */
export function useWrite() {
  const pending = useRef(new Map<string, string>());
  return useCallback(
    async <T>(path: string, body: unknown, method = "POST"): Promise<T> => {
      const json = JSON.stringify(body),
        intent = method + path + json;
      let key = pending.current.get(intent);
      if (!key) {
        key = crypto.randomUUID();
        pending.current.set(intent, key);
      }
      const result = await api<T>(path, {
        method,
        body: json,
        headers: { "Idempotency-Key": key },
      });
      pending.current.delete(intent);
      return result;
    },
    [],
  );
}
