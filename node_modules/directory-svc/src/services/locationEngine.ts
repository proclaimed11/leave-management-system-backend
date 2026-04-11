import { LocationRepository } from "../repositories/locationRepository";
import { Location } from "../types/types";

export class LocationEngine {
  constructor(private repo = new LocationRepository()) {}

  async listLocations(): Promise<Location[]> {
    return this.repo.listActive();
  }
}
