import { Router } from "express";
import { eq } from "drizzle-orm";

import { db } from "../../db/index";
import { adminUsers, sessions } from "../../db/schema";
import {
  clearSessionCookie,
  createSession,
  getSession,
  setSessionCookie,
  getSessionToken,
} from "../utils/session";
import { verifyPassword } from "../auth/password";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required.",
      });
    }

    const result = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.username, username))
      .limit(1);

    if (result.length === 0) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const user = result[0];

    const validPassword = verifyPassword(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid username or password.",
      });
    }

    const session = await createSession(user.id);

    setSessionCookie(
      res,
      session.token,
      session.expiresAt
    );

    res.json({
      message: "Login successful.",
      username: user.username,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Login failed.",
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    const session = await getSession(req);

    if (!session) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const result = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
      })
      .from(adminUsers)
      .where(eq(adminUsers.id, session.adminUserId))
      .limit(1);

    if (result.length === 0) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    res.json({
      authenticated: true,
      user: result[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to check authentication.",
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const token = getSessionToken(req);

    if (token) {
      const session = await getSession(req);

      if (session) {
        await db
          .delete(sessions)
          .where(eq(sessions.id, session.id));
      }
    }

    clearSessionCookie(res);

    res.json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Logout failed.",
    });
  }
});

export default router;