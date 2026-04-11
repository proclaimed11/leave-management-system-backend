function toYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function addDaysUtc(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function isSundayUtc(d: Date): boolean {
  return d.getUTCDay() === 0; // Sunday = 0
}

export function countLeaveDays(params: {
  start: string;
  end: string;
  holidayDates: Set<string>;
}): number {
  const start = parseYmd(params.start);
  const end = parseYmd(params.end);

  let count = 0;

  for (let d = start; d.getTime() <= end.getTime(); d = addDaysUtc(d, 1)) {
    if (isSundayUtc(d)) continue;

    const ymd = toYmd(d);

    if (params.holidayDates.has(ymd)) continue;

    count++;
  }

  return count;
}
