import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(
    password,
    salt,
    64
  ).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  const [salt, key] = storedHash.split(":");

  if (!salt || !key) {
    return false;
  }

  const hash = scryptSync(
    password,
    salt,
    64
  );

  const storedKey = Buffer.from(key, "hex");

  if (hash.length !== storedKey.length) {
    return false;
  }

  return timingSafeEqual(hash, storedKey);
}
