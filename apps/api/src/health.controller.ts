import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Database } from "./database";
@Controller("api/health")
export class HealthController {
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
