// bcryptjs wrappers — single place to swap hashing algorithm later (e.g. argon2).
// Cost 10 is a reasonable balance between security and latency for student PINs + parent passwords.
import bcrypt from "bcryptjs";

const COST = 10;

/** Hash a student's 4-digit PIN */
export async function hashPin(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

/** Verify a plain PIN against a stored bcrypt hash */
export async function verifyPin(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Hash a parent's password */
export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, COST);
}

/** Verify a plain password against a stored bcrypt hash */
export async function verifySecret(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
