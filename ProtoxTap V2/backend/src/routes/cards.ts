import { Router } from "express";
import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index";
import {
  cards,
  businesses,
  cardEvents,
} from "../../db/schema";
import { requireAuth } from "../utils/require-auth";

const router = Router();

router.use(requireAuth);

router.get("/", async (_req, res) => {
  try {
    const result = await db
      .select({
        id: cards.id,
        cardCode: cards.cardCode,
        businessId: cards.businessId,
        businessName: businesses.businessName,
        googleReviewUrl: cards.googleReviewUrl,
        status: cards.status,
        createdAt: cards.createdAt,
        activatedAt: cards.activatedAt,
        deactivatedAt: cards.deactivatedAt,
      })
      .from(cards)
      .leftJoin(
        businesses,
        eq(cards.businessId, businesses.id)
      )
      .orderBy(asc(cards.id));

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch cards.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid card ID.",
      });
    }

    const result = await db
      .select({
        id: cards.id,
        cardCode: cards.cardCode,
        businessId: cards.businessId,
        businessName: businesses.businessName,
        googleReviewUrl: cards.googleReviewUrl,
        status: cards.status,
        createdAt: cards.createdAt,
        activatedAt: cards.activatedAt,
        deactivatedAt: cards.deactivatedAt,
      })
      .from(cards)
      .leftJoin(
        businesses,
        eq(cards.businessId, businesses.id)
      )
      .where(eq(cards.id, id))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch card.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      cardCode,
      businessId,
      googleReviewUrl,
    } = req.body;

    if (!cardCode) {
      return res.status(400).json({
        error: "Card code is required.",
      });
    }

    const existingCard = await db
      .select()
      .from(cards)
      .where(eq(cards.cardCode, cardCode))
      .limit(1);

    if (existingCard.length > 0) {
      return res.status(409).json({
        error: "Card code already exists.",
      });
    }

    if (businessId !== undefined && businessId !== null) {
      const business = await db
        .select()
        .from(businesses)
        .where(eq(businesses.id, Number(businessId)))
        .limit(1);

      if (business.length === 0) {
        return res.status(404).json({
          error: "Business not found.",
        });
      }
    }

    const assigned =
      businessId !== undefined &&
      businessId !== null;

    const result = await db
      .insert(cards)
      .values({
        cardCode,
        businessId: assigned ? Number(businessId) : null,
        googleReviewUrl: googleReviewUrl || null,
        status: assigned ? "inactive" : "unassigned",
      })
      .returning();

    if (assigned) {
      await db.insert(cardEvents).values({
        cardId: result[0].id,
        eventType: "assigned",
      });
    }

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create card.",
    });
  }
});

router.post("/:id/assign", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { businessId, googleReviewUrl } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid card ID.",
      });
    }

    if (!businessId || !googleReviewUrl) {
      return res.status(400).json({
        error: "Business ID and Google review URL are required.",
      });
    }

    const cardResult = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);

    if (cardResult.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }

    const card = cardResult[0];

    if (card.status === "active") {
      return res.status(409).json({
        error: "Active cards cannot be reassigned.",
      });
    }

    const businessResult = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, Number(businessId)))
      .limit(1);

    if (businessResult.length === 0) {
      return res.status(404).json({
        error: "Business not found.",
      });
    }

    const result = await db
      .update(cards)
      .set({
        businessId: Number(businessId),
        googleReviewUrl,
        status: "inactive",
        activatedAt: null,
        deactivatedAt: null,
      })
      .where(eq(cards.id, id))
      .returning();

    await db.insert(cardEvents).values({
      cardId: id,
      eventType: "assigned",
    });

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to assign card.",
    });
  }
});

router.post("/:id/activate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cardResult = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);

    if (cardResult.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }

    const card = cardResult[0];

    if (!card.businessId || !card.googleReviewUrl) {
      return res.status(400).json({
        error: "Card must be assigned before activation.",
      });
    }

    if (card.status === "active") {
      return res.status(409).json({
        error: "Card is already active.",
      });
    }

    const result = await db
      .update(cards)
      .set({
        status: "active",
        activatedAt: new Date(),
        deactivatedAt: null,
      })
      .where(eq(cards.id, id))
      .returning();

    await db.insert(cardEvents).values({
      cardId: id,
      eventType: "activated",
    });

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to activate card.",
    });
  }
});

router.post("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const cardResult = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);

    if (cardResult.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }

    const card = cardResult[0];

    if (card.status !== "active") {
      return res.status(409).json({
        error: "Card is not active.",
      });
    }

    const result = await db
      .update(cards)
      .set({
        status: "inactive",
        deactivatedAt: new Date(),
      })
      .where(eq(cards.id, id))
      .returning();

    await db.insert(cardEvents).values({
      cardId: id,
      eventType: "deactivated",
    });

    res.json(result[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to deactivate card.",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid card ID.",
      });
    }

    const cardResult = await db
      .select()
      .from(cards)
      .where(eq(cards.id, id))
      .limit(1);

    if (cardResult.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }

    const card = cardResult[0];

    if (card.status === "active") {
      return res.status(409).json({
        error: "Active cards cannot be deleted. Deactivate the card first.",
      });
    }

    // Remove event history first because card_events references the card.
    await db
      .delete(cardEvents)
      .where(eq(cardEvents.cardId, id));

    await db
      .delete(cards)
      .where(eq(cards.id, id));

    res.json({
      message: "Card deleted.",
      cardCode: card.cardCode,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete card.",
    });
  }
});

export default router;