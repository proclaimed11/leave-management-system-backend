export const CONFIG = {
  DIRECTORY_SVC_URL: process.env.DIRECTORY_SVC_URL ?? "http://127.0.0.1:3002",
  POLICY_SVC_URL: process.env.POLICY_SVC_URL ?? "http://127.0.0.1:3004",
  HTTP_TIMEOUT_MS: Number(process.env.HTTP_TIMEOUT_MS ?? 4000),
  HTTP_RETRIES: Number(process.env.HTTP_RETRIES ?? 2),

  NEGATIVE_BALANCE_FLOOR: Number(process.env.NEGATIVE_BALANCE_FLOOR ?? -5),
};
