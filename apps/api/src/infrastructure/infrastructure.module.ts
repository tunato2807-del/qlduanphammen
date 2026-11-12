import { Module, Global } from "@nestjs/common";
import { Database } from "../database";
import { Idempotency } from "../idempotency";
@Global()
@Module({
  imports: [],
  providers: [Database, Idempotency],
  controllers: [],
  exports: [Database, Idempotency],
})
export class InfrastructureModule {}
