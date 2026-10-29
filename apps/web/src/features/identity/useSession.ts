import { useEffect, useState } from "react";
import { api, ApiError } from "../../shared/api";
import type { User } from "../../shared/models";

export function useSession() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setInitializing(true);
    setSessionError("");
    api<User>("/auth/me", { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setUser(value);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401) setUser(null);
        else
          setSessionError(
            error instanceof Error
              ? error.message
              : "Không mở được phiên đăng nhập.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setInitializing(false);
      });
    return () => controller.abort();
  }, [attempt]);
  return {
    user,
    setUser,
    initializing,
    sessionError,
    retrySession: () => setAttempt((value) => value + 1),
  };
}
