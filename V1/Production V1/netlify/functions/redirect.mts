import { eq } from "drizzle-orm";
import type { Config } from "@netlify/functions";

import { db } from "../../../db";
import { cards } from "../../../db/schema";

export default async (req: Request) => {
  const url = new URL(req.url);

  // Extract the card code from /r/PT-0001
  const cardCode = url.pathname.split("/").filter(Boolean).pop();

  if (!cardCode) {
    return new Response("Invalid ProtoxTap card", {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Look for the card in the database
  const result = await db
    .select()
    .from(cards)
    .where(eq(cards.cardCode, cardCode))
    .limit(1);

  // Card does not exist
  if (result.length === 0) {
    return new Response(`Invalid ProtoxTap card: ${cardCode}`, {
      status: 404,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  const card = result[0];

  // Card exists, but is inactive
  if (card.status !== "active") {
    return new Response(`ProtoxTap card is inactive: ${cardCode}`, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }

  // Card is active - redirect to the Google review URL
  return Response.redirect(card.googleReviewUrl, 302);
};

export const config: Config = {
  path: "/r/*",
};