export function isClientError(msg: string): boolean {
  return /required|invalid|missing|not found|exists|balance|notice|weekend|gender|overlap|entitlement|document|reject/i.test(
    msg
  );
}
