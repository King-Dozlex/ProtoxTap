import { Router } from "express";
import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index";
import { businesses, cards } from "../../db/schema";
import { requireAuth } from "../utils/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select()
      .from(businesses)
      .orderBy(asc(businesses.id));

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch businesses.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid business ID.",
      });
    }

    const result = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        error: "Business not found.",
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch business.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      businessName,
      contactName,
      email,
      phone,
      notes,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({
        error: "Business name is required.",
      });
    }

    const result = await db
      .insert(businesses)
      .values({
        businessName,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
      .returning();

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create business.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid business ID.",
      });
    }

    const {
      businessName,
      contactName,
      email,
      phone,
      notes,
    } = req.body;

    if (!businessName) {
      return res.status(400).json({
        error: "Business name is required.",
      });
    }

    const result = await db
      .update(businesses)
      .set({
        businessName,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      })
      .where(eq(businesses.id, id))
      .returning();

    if (result.length === 0) {
      return res.status(404).json({
        error: "Business not found.",
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to update business.",
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid business ID.",
      });
    }

    const business = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id))
      .limit(1);

    if (business.length === 0) {
      return res.status(404).json({
        error: "Business not found.",
      });
    }

    const resetCards = await db
      .update(cards)
      .set({
        businessId: null,
        googleReviewUrl: "https://www.protoxtap.com/inactive",
        status: "inactive",
        activatedAt: null,
        deactivatedAt: new Date(),
      })
      .where(eq(cards.businessId, id))
      .returning();

    await db
      .delete(businesses)
      .where(eq(businesses.id, id));

    res.json({
      message: "Business deleted.",
      cardsReset: resetCards.length,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete business.",
    });
  }
});


export default router;