import type { Request, Response, NextFunction } from "express";
import { getSession } from "./session";

export type AuthRequest = Request & {
  session: Awaited<ReturnType<typeof getSession>>;
};

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const session = await getSession(req);

    if (!session) {
      return res.status(401).json({
        error: "Authentication required.",
      });
    }

    req.session = session;

    console.log("AUTH SESSION SET:", req.session);

    next();

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Authentication check failed.",
    });
  }
}