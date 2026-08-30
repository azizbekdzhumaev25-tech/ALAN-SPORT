// Хранилище в оперативной памяти: IP -> { сколько попыток, когда сбросится }
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number
): { success: boolean } {
  const now = Date.now();
  const record = rateLimitCache.get(ip);

  // Очистка старых записей (чтобы память не переполнялась)
  if (rateLimitCache.size > 1000) {
    rateLimitCache.clear();
  }

  if (!record) {
    // Первый запрос
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (now > record.resetTime) {
    // Время блокировки прошло, сбрасываем счетчик
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }

  if (record.count >= maxRequests) {
    // Превышен лимит
    return { success: false };
  }

  // Увеличиваем счетчик попыток
  record.count += 1;
  return { success: true };
}

// Попытка достать IP адрес из заголовков Next.js
export function getIpFromRequest(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "unknown-ip";
}