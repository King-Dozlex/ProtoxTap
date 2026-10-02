export async function findGooglePlaceId(
  businessName: string
): Promise<string | null> {

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_PLACES_API_KEY is missing"
    );
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({
        textQuery: businessName,
      }),
    }
  );

  if (!response.ok) {
    console.error(
      "Google Places API error:",
      await response.text()
    );

    return null;
  }

  const data = await response.json();

  return data.places?.[0]?.id ?? null;
}
