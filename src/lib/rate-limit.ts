interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Pembersih berkala entri yang kedaluwarsa untuk menghemat memori
 */
function cleanupExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

// Jalankan pembersihan setiap 5 menit tanpa menahan event loop Node.js
if (typeof setInterval !== "undefined") {
  const timer = setInterval(cleanupExpiredRecords, 5 * 60 * 1000);
  if (timer && typeof (timer as any).unref === "function") {
    (timer as any).unref();
  }
}

export interface RateLimitOptions {
  limit: number; // Jumlah request maksimum
  windowMs: number; // Jendela waktu dalam milidetik
}

/**
 * Memeriksa apakah request melebihi batas laju (Rate Limit)
 * @returns { success: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 10, windowMs: 60 * 1000 }
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || record.resetAt <= now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + options.windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      success: true,
      remaining: options.limit - 1,
      resetAt: newRecord.resetAt,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: options.limit - record.count,
    resetAt: record.resetAt,
  };
}
