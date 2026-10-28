import { BadRequestException } from "@nestjs/common";
import { currentMonth } from "./budget";
export function validMonth(value?: string) {
  const month = value || currentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new BadRequestException("Tháng không hợp lệ.");
  return month;
}
