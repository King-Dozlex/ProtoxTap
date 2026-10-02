import type { Request, Response, NextFunction } from "express";
import { getSession } from "./session";

export async function requireAuth(
  req: Request,
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

    next();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Authentication check failed.",
    });
  }
}
