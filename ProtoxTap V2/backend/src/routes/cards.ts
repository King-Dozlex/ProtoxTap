import { requireAuth } from "../utils/require-auth";
import type { AuthRequest } from "../utils/require-auth";
import { createAuditLog } from "../services/audit-log";

import { Router } from "express";
import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index";
import { businesses, cards, cardEvents } from "../../db/schema";

const router = Router();

router.use(requireAuth);


// GET ALL CARDS
router.get("/", async (_req: AuthRequest, res) => {
  try {
    const result = await db
      .select()
      .from(cards)
      .orderBy(asc(cards.id));

    res.json(result);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch cards.",
    });
  }
});


// GET SINGLE CARD
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid card ID.",
      });
    }

    const result = await db
      .select()
      .from(cards)
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


// CREATE CARD
router.post("/", async (req: AuthRequest, res) => {
  try {
    const { cardCode } = req.body;


    if (!cardCode) {
      return res.status(400).json({
        error: "Card code is required.",
      });
    }


    const result = await db
      .insert(cards)
      .values({
        cardCode,
        status: "unassigned",
      })
      .returning();


    await createAuditLog({
      adminUserId: req.session.adminUserId,
      action: "CREATED_CARD",
      targetType: "CARD",
      targetId: result[0].id,
      targetLabel: result[0].cardCode,
    });


    res.status(201).json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create card.",
    });
  }
});


// ASSIGN CARD TO BUSINESS
router.post("/:id/assign", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { businessId } = req.body;


    if (!Number.isInteger(id)) {
      return res.status(400).json({
        error: "Invalid card ID.",
      });
    }


    if (!businessId) {
      return res.status(400).json({
        error: "Business ID is required.",
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


    const business = businessResult[0];


    if (!business.googlePlaceId) {
      return res.status(400).json({
        error: "Business has no Google Place ID.",
      });
    }


    const redirectUrl =
      `https://search.google.com/local/writereview?placeid=${business.googlePlaceId}`;


    const result = await db
      .update(cards)
      .set({
        businessId: Number(businessId),
        redirectUrl,
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


    await createAuditLog({
      adminUserId: req.session.adminUserId,
      action: "ASSIGNED_CARD",
      targetType: "CARD",
      targetId: id,
      targetLabel: card.cardCode,
      details: {
        businessId: Number(businessId),
        businessName: business.businessName,
      },
    });


    res.json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to assign card.",
    });
  }
});


// ACTIVATE CARD
router.post("/:id/activate", async (req: AuthRequest, res) => {
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


    if (!card.businessId || !card.redirectUrl) {
      return res.status(400).json({
        error: "Card must be assigned before activation.",
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


    await createAuditLog({
      adminUserId: req.session.adminUserId,
      action: "ACTIVATED_CARD",
      targetType: "CARD",
      targetId: id,
      targetLabel: card.cardCode,
      details: {
        businessId: card.businessId,
      },
    });


    res.json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to activate card.",
    });
  }
});


// DEACTIVATE CARD
router.post("/:id/deactivate", async (req: AuthRequest, res) => {
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


    await createAuditLog({
      adminUserId: req.session.adminUserId,
      action: "DEACTIVATED_CARD",
      targetType: "CARD",
      targetId: id,
      targetLabel: card.cardCode,
      details: {
        businessId: card.businessId,
      },
    });


    res.json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to deactivate card.",
    });
  }
});


// DELETE CARD
// Default behaviour: block deletion if history exists.
// Force deletion removes history after confirmation.
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    console.log("DELETE BODY:", req.body);

    const force = req.body?.force === true;


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
        error: "Active cards cannot be deleted.",
      });
    }


    const events = await db
      .select()
      .from(cardEvents)
      .where(eq(cardEvents.cardId, id));


    if (events.length > 0 && !force) {
      return res.status(409).json({
        error: "Card has history. Enable force deletion to remove it.",
        requiresForce: true,
      });
    }


    if (force) {
      await db
        .delete(cardEvents)
        .where(eq(cardEvents.cardId, id));
    }


    await db
      .delete(cards)
      .where(eq(cards.id, id));


    await createAuditLog({
      adminUserId: req.session.adminUserId,
      action: force ? "FORCE_DELETED_CARD" : "DELETED_CARD",
      targetType: "CARD",
      targetId: id,
      targetLabel: card.cardCode,
      details: {
        businessId: card.businessId,
        deletedHistoryRecords: events.length,
      },
    });


    res.json({
      message: force
        ? "Card and history deleted."
        : "Card deleted.",
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete card.",
    });
  }
});


export default router;