import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  if (!hash) {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    // Malformed (e.g. legacy plaintext) hashes never match
    return false;
  }
}
