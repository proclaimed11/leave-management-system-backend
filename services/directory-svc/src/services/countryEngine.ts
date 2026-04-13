import { CountryRepository } from "../repositories/countryRepository";
import type { Country } from "../types/types";

export class CountryEngine {
  constructor(private repo = new CountryRepository()) {}

  async listCountries(): Promise<Country[]> {
    return this.repo.listAll();
  }
}
