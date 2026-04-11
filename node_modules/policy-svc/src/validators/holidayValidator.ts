import { CreateHolidayDTO, UpdateHolidayDTO } from "../types/holiday";

const ALLOWED_TYPES = ["PUBLIC", "COMPANY", "SPECIAL"];

export function validateCreateHoliday(dto: CreateHolidayDTO) {
  if (!dto.holiday_date) {
    throw new Error("holiday_date is required");
  }

  if (!dto.name || !dto.name.trim()) {
    throw new Error("Holiday name is required");
  }

  if (dto.holiday_type && !ALLOWED_TYPES.includes(dto.holiday_type)) {
    throw new Error("Invalid holiday_type");
  }

  if (dto.company_key && typeof dto.company_key !== "string") {
    throw new Error("company_key must be string");
  }

  if (dto.location && typeof dto.location !== "string") {
    throw new Error("location must be string");
  }
}

export function validateUpdateHoliday(dto: UpdateHolidayDTO) {
  if (dto.holiday_type && !ALLOWED_TYPES.includes(dto.holiday_type)) {
    throw new Error("Invalid holiday_type");
  }
}
