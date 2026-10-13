import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hash password menggunakan bcrypt dengan cost 12
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifikasi password plaintext dengan hash yang tersimpan
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
