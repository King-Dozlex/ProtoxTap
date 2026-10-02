import { createHash, randomBytes } from "node:crypto";
import { db } from "../../db/index";
import { sessions } from "../../db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "protoxtap_session";
const SESSION_LENGTH = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getSessionToken(req: {
  headers: {
    cookie?: string;
  };
}): string | null {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name === SESSION_COOKIE) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export async function createSession(adminUserId: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(Date.now() + SESSION_LENGTH);

  await db.insert(sessions).values({
    tokenHash,
    adminUserId,
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

export async function getSession(req: {
  headers: {
    cookie?: string;
  };
}) {
  const token = getSessionToken(req);

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const result = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const session = result[0];

  if (session.expiresAt < new Date()) {
    await db
      .delete(sessions)
      .where(eq(sessions.id, session.id));

    return null;
  }

  return session;
}

export function setSessionCookie(
  res: {
    setHeader: (name: string, value: string) => void;
  },
  token: string,
  expiresAt: Date
) {
  const maxAge = Math.floor(
    (expiresAt.getTime() - Date.now()) / 1000
  );

  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAge}`
  );
}

export function clearSessionCookie(
  res: {
    setHeader: (name: string, value: string) => void;
  }
) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`
  );
}