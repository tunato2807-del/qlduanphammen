export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
/** Session cookies stay HttpOnly. Mutations are never retried automatically. */
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch("/api" + path, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiError(
      "Không kết nối được máy chủ. Kiểm tra kết nối và thử lại.",
      0,
      "NETWORK_ERROR",
    );
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (response.status === 401 && path !== "/auth/me")
      window.dispatchEvent(new Event("session-expired"));
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message;
    throw new ApiError(
      typeof message === "string"
        ? message
        : "Thao tác chưa thành công. Vui lòng thử lại.",
      response.status,
      data?.code,
    );
  }
  return response.json() as Promise<T>;
}
