export class AppError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const isClientError = (e: unknown) =>
  e instanceof AppError && e.status >= 400 && e.status < 500;
