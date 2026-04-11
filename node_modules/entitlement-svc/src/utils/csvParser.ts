import csv from "csv-parser";
import { Readable } from "stream";

export async function parseCsvBuffer<T>(
  buffer: Buffer
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: T[] = [];

    Readable.from(buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}
