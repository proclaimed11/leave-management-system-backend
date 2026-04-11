export function assertDatesValid(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(+s) || Number.isNaN(+e)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD");
  }
  if (e < s) throw new Error("end_date cannot be before start_date");
}

export function calcDaysInclusive(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const ms = e.getTime() - s.getTime();
  // +1 day inclusive
  return Math.floor(ms / 86400000) + 1;
}
