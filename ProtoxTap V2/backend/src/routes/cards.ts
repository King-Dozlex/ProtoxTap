
import { Router } from "express";
import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index";
import { businesses, cards, cardEvents } from "../../db/schema";
import { requireAuth } from "../utils/require-auth";

const router = Router();

router.use(requireAuth);


// GET ALL CARDS
router.get("/", async (_req, res) => {
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
router.get("/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
  try {
    const {
      cardCode,
    } = req.body;


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


    res.status(201).json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create card.",
    });
  }
});


// ASSIGN CARD TO BUSINESS
router.post("/:id/assign", async (req, res) => {
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


    res.json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to assign card.",
    });
  }
});


// ACTIVATE CARD
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


    res.json(result[0]);


  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to activate card.",
    });
  }
});


// DEACTIVATE CARD
router.post("/:id/deactivate", async (req, res) => {
  try {
    const id = Number(req.params.id);


    const result = await db
      .update(cards)
      .set({
        status: "inactive",
        deactivatedAt: new Date(),
      })
      .where(eq(cards.id, id))
      .returning();


    if (result.length === 0) {
      return res.status(404).json({
        error: "Card not found.",
      });
    }


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
        error: "Active cards cannot be deleted.",
      });
    }

    await db
      .delete(cards)
      .where(eq(cards.id, id));

    res.json({
      message: "Card deleted.",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to delete card.",
    });
  }
});

export default router;