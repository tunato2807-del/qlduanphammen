import { BadRequestException } from "@nestjs/common";
import { plainToInstance, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
  validateSync,
  ArrayMaxSize,
  ArrayMinSize,
} from "class-validator";
export function parse<T extends object>(type: new () => T, input: unknown): T {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new BadRequestException("Dữ liệu không hợp lệ.");
  const value = plainToInstance(type, input);
  for (const key of ["name", "email"])
    if (typeof (value as Record<string, unknown>)[key] === "string")
      (value as Record<string, unknown>)[key] = (
        value as Record<string, string>
      )[key].trim();
  const errors = validateSync(value, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length)
    throw new BadRequestException(
      "Vui lòng kiểm tra các trường dữ liệu, định dạng và giới hạn số tiền.",
    );
  return value;
}
export class RegisterDto {
  @IsEmail() @MaxLength(200) email!: string;
  @IsString() @Length(8, 128) password!: string;
  @IsString() @Length(2, 60) name!: string;
}
export class LoginDto {
  @IsEmail() @MaxLength(200) email!: string;
  @IsString() @Length(1, 128) password!: string;
}
export class PasswordDto {
  @IsString() @Length(1, 128) currentPassword!: string;
  @IsString() @Length(8, 128) newPassword!: string;
}
export class WalletDto {
  @IsString() @Length(1, 60) name!: string;
  @IsIn(["BANK", "CASH", "EWALLET"]) kind!: string;
  @IsString() @Matches(/^\d{1,13}$/) openingBalance!: string;
  @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) color!: string;
}
export class WalletPatchDto {
  @IsOptional() @IsString() @Length(1, 60) name?: string;
  @IsOptional() @IsBoolean() archived?: boolean;
}
export class CategoryDto {
  @IsString() @Length(1, 40) name!: string;
  @IsIn(["INCOME", "EXPENSE"]) kind!: string;
  @IsString() @Matches(/^#[0-9a-fA-F]{6}$/) color!: string;
  @IsIn([
    "food",
    "home",
    "transport",
    "shopping",
    "health",
    "fun",
    "education",
    "salary",
    "gift",
    "other",
  ])
  icon!: string;
}
export class CategoryPatchDto {
  @IsOptional() @IsString() @Length(1, 40) name?: string;
  @IsOptional() @IsBoolean() archived?: boolean;
}
export class TransactionDto {
  @IsIn(["INCOME", "EXPENSE", "TRANSFER"]) kind!: string;
  @IsString() @Matches(/^[1-9]\d{0,12}$/) amount!: string;
  @IsUUID() walletId!: string;
  @IsOptional() @IsUUID() destinationWalletId?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsISO8601({ strict: true }) occurredAt!: string;
  @IsOptional() @IsString() @MaxLength(250) note?: string;
}
export class BudgetItemDto {
  @IsUUID() categoryId!: string;
  @IsString() @Matches(/^\d{1,13}$/) fixed!: string;
  @IsInt() @Min(0) @Max(1000) weight!: number;
  @IsOptional() @IsString() @Matches(/^\d{1,13}$/) limit?: string;
}
export class BudgetDto {
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/) month!: string;
  @IsString() @Matches(/^\d{1,13}$/) income!: string;
  @IsString() @Matches(/^\d{1,13}$/) savings!: string;
  @IsIn(["AUTO", "MANUAL"]) mode!: string;
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => BudgetItemDto)
  items!: BudgetItemDto[];
}
