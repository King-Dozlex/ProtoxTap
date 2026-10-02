import { Router } from "express";
import { eq } from "drizzle-orm";

import { db } from "../../db/index";
import { cards, cardEvents } from "../../db/schema";

const router = Router();

router.get("/r/:cardCode", async (req, res) => {
  try {
    const cardCode = req.params.cardCode;

    const result = await db
      .select()
      .from(cards)
      .where(eq(cards.cardCode, cardCode))
      .limit(1);

    // Card does not exist
    if (result.length === 0) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>ProtoxTap</title>
          </head>
          <body>
            <h1>Card not found</h1>
            <p>This ProtoxTap card does not exist.</p>
          </body>
        </html>
      `);
    }

    const card = result[0];

    // Card exists but is inactive or has no review URL
    if (card.status !== "active" || !card.redirectUrl) {
      return res.redirect("/inactive");
    }

    // Active card tap
    await db.insert(cardEvents).values({
      cardId: card.id,
      eventType: "tap",
    });

    // Send the customer to the Google review page
    return res.redirect(card.redirectUrl);

  } catch (error) {
    console.error(error);

    return res.status(500).send("ProtoxTap server error.");
  }
});

export default router;
