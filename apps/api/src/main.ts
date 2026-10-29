import "reflect-metadata";
import "dotenv/config";
import {
  Controller,
  Get,
  Inject,
  Module,
  ServiceUnavailableException,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { SafeErrorFilter, requestContext } from "./http";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import express, { Response } from "express";
import { resolve } from "node:path";
import { Database } from "./database";
import { Accounts, SessionGuard } from "./auth";
import { Wallets } from "./wallets";
import { Transactions } from "./transactions";
import { Budgets } from "./budgets";
import { Reports } from "./reports";
import { Demo } from "./demo";
import { AuthController, FinanceController } from "./controllers";
@Controller("api/health")
class HealthController {
  constructor(@Inject(Database) private db: Database) {}
  @Get() async health() {
    try {
      await this.db.user.count();
      return { status: "ok", database: "connected" };
    } catch {
      throw new ServiceUnavailableException(
        "Database unavailable or not migrated",
      );
    }
  }
}
@Module({
  controllers: [HealthController, AuthController, FinanceController],
  providers: [
    Database,
    Accounts,
    SessionGuard,
    Wallets,
    Transactions,
    Budgets,
    Reports,
    Demo,
  ],
})
class AppModule {}
export async function createApp() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: process.env.NODE_ENV === "test" ? false : ["error", "warn", "log"],
  });
  app.use(requestContext);
  app.use(helmet());
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());
  app
    .getHttpAdapter()
    .getInstance()
    .set("json replacer", (_key: string, value: unknown) =>
      typeof value === "bigint" ? value.toString() : value,
    );
  app.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      res.setHeader("Cache-Control", "no-store");
      if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        const origin = req.get("origin");
        if (origin) {
          try {
            if (new URL(origin).host !== req.get("host"))
              return res
                .status(403)
                .json({ message: "Nguồn yêu cầu không hợp lệ." });
          } catch {
            return res
              .status(403)
              .json({ message: "Nguồn yêu cầu không hợp lệ." });
          }
        }
        if (!req.is("application/json"))
          return res
            .status(415)
            .json({ message: "Yêu cầu phải có định dạng JSON." });
      }
      next();
    },
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 60000,
      limit: 300,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { message: "Bạn thao tác quá nhanh, vui lòng thử lại sau." },
    }),
  );
  app.use(
    ["/api/auth/login", "/api/auth/register", "/api/auth/demo"],
    rateLimit({
      windowMs: 15 * 60000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        message: "Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau.",
      },
    }),
  );
  if (process.env.NODE_ENV === "production") {
    const directory = resolve(__dirname, "../../web/dist");
    app.use(express.static(directory));
    app.use(
      (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        if (req.method === "GET" && !req.path.startsWith("/api"))
          return res.sendFile(resolve(directory, "index.html"));
        next();
      },
    );
  }
  app.useGlobalFilters(new SafeErrorFilter());
  app.enableShutdownHooks();
  return app;
}
if (require.main === module)
  createApp()
    .then((app) => app.listen(Number(process.env.PORT) || 3001, "0.0.0.0"))
    .catch(() => {
      console.error(
        "Không khởi động được API. Kiểm tra PostgreSQL và DATABASE_URL.",
      );
      process.exit(1);
    });
