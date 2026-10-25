import type { Request, RequestHandler } from "express";
import { getSession } from "./session";

export type AuthRequest = Request & {
  session: NonNullable<Awaited<ReturnType<typeof getSession>>>;
};

export const requireAuth: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const session = await getSession(req);

    if (!session) {
      res.status(401).json({
        error: "Authentication required.",
      });
      return;
    }

    (req as AuthRequest).session = session;
    next();
  } catch (error) {
    console.error("Authentication middleware failed.");

    res.status(500).json({
      error: "Authentication check failed.",
    });
  }
};
