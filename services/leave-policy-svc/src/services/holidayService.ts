import { HolidayRepository } from "../repositories/holidayRepository";
import {
  CreateHolidayDTO,
  UpdateHolidayDTO,
  CompanyHolidayRow,
} from "../types/holiday";
import {
  validateCreateHoliday,
  validateUpdateHoliday,
} from "../validators/holidayValidator";

export class HolidayService {
  private repo: HolidayRepository;

  constructor(repo = new HolidayRepository()) {
    this.repo = repo;
  }

  async createHoliday(
    dto: CreateHolidayDTO,
    createdBy: string,
  ): Promise<CompanyHolidayRow> {
    validateCreateHoliday(dto);

    const normalized: CreateHolidayDTO = {
      ...dto,
      holiday_type: dto.holiday_type ?? "PUBLIC",
      company_key: dto.company_key?.toUpperCase() ?? null,
      location: dto.location ?? null,
      is_recurring: dto.is_recurring ?? false,
      notes: dto.notes ?? null,
    };

    try {
      return await this.repo.createHoliday({
        ...normalized,
        created_by: createdBy,
      });
    } catch (err: any) {
      if (err.code === "23505") {
        throw new Error("Holiday already exists for that date and scope");
      }
      throw err;
    }
  }

  async listHolidays(filter: {
    company_key?: string;
    year?: number;
  }): Promise<CompanyHolidayRow[]> {
    const repoFilter: any = {};

    if (filter.company_key) {
      repoFilter.company_key = filter.company_key.toUpperCase();
    }

    if (filter.year) {
      repoFilter.start = `${filter.year}-01-01`;
      repoFilter.end = `${filter.year}-12-31`;
    }

    return this.repo.listHolidays(repoFilter);
  }

  async getHolidaysBetween(params: {
    start: string;
    end: string;
    company_key: string;
    location?: string | null;
  }): Promise<CompanyHolidayRow[]> {
    if (!params.start || !params.end) {
      throw new Error("start and end dates are required");
    }

    return this.repo.getHolidaysBetween({
      start: params.start,
      end: params.end,
      company_key: params.company_key.toUpperCase(),
      location: params.location ?? null,
    });
  }

  async updateHoliday(
    id: number,
    dto: UpdateHolidayDTO,
  ): Promise<CompanyHolidayRow | null> {
    if (!id) {
      throw new Error("Holiday ID is required");
    }

    validateUpdateHoliday(dto);

    try {
      return await this.repo.updateHoliday(id, {
        ...dto,
        company_key: dto.company_key?.toUpperCase() ?? dto.company_key,
      });
    } catch (err: any) {
      if (err.code === "23505") {
        throw new Error(
          "Another holiday already exists for that date and scope",
        );
      }
      throw err;
    }
  }
  async deleteHoliday(id: number): Promise<void> {
    const deleted = await this.repo.deleteHoliday(id);

    if (!deleted) {
      throw new Error("Holiday not found");
    }
  }
}
