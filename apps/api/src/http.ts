import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const codes: Record<number, string> = {
  400: "INVALID_REQUEST",
  401: "UNAUTHENTICATED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  415: "UNSUPPORTED_MEDIA_TYPE",
  429: "RATE_LIMITED",
  503: "UNAVAILABLE",
};
export const errorCode = (status: number) => codes[status] ?? "INTERNAL_ERROR";
/** Allowlist metadata only: no URL/query, user identifiers, bodies, cookies or amounts. */
export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const requestId = randomUUID();
  const started = performance.now();
  res.setHeader("X-Request-Id", requestId);
  const json = res.json.bind(res);
  res.json = (body: unknown) => {
    if (res.statusCode >= 400) {
      const input =
        body && typeof body === "object"
          ? (body as Record<string, unknown>)
          : {};
      return json({
        ...input,
        statusCode: res.statusCode,
        code: errorCode(res.statusCode),
        requestId,
      });
    }
    return json(body);
  };
  res.on("finish", () => {
    if (process.env.NODE_ENV === "test") return;
    console.log(
      JSON.stringify({
        event: "http_request",
        entryPoint: "http",
        requestId,
        method: req.method,
        route:
          typeof req.route?.path === "string" ? req.route.path : "unmatched",
        status: res.statusCode,
        durationMs: Math.round((performance.now() - started) * 100) / 100,
      }),
    );
  });
  next();
}
@Catch()
export class SafeErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    let status = 500;
    let message: string | string[] =
      "Máy chủ tạm thời gặp sự cố. Vui lòng thử lại.";
    if (error instanceof HttpException) {
      status = error.getStatus();
      const response = error.getResponse();
      const detail =
        typeof response === "string"
          ? response
          : (response as { message?: string | string[] }).message;
      if (detail && status < 500) message = detail;
      if (status === 503) message = "Máy chủ tạm thời chưa sẵn sàng.";
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      status =
        error.code === "P2002" ? 409 : error.code === "P2025" ? 404 : 400;
      message =
        status === 409
          ? "Dữ liệu đã tồn tại."
          : status === 404
            ? "Không tìm thấy dữ liệu."
            : "Không thể lưu dữ liệu. Vui lòng kiểm tra thông tin.";
    } else if (
      error instanceof SyntaxError &&
      "status" in error &&
      error.status === 400
    ) {
      status = 400;
      message = "Nội dung JSON không hợp lệ.";
    } else if (
      error &&
      typeof error === "object" &&
      "type" in error &&
      error.type === "entity.too.large"
    ) {
      status = 413;
      message = "Nội dung yêu cầu quá lớn.";
    }
    if (status >= 500 && process.env.NODE_ENV !== "test")
      console.error(
        JSON.stringify({
          event: "request_failed",
          requestId: res.getHeader("X-Request-Id"),
          code: errorCode(status),
        }),
      );
    res.status(status).json({ message });
  }
}
