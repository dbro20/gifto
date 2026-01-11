import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getGiftIdeasByUserId,
  createGiftIdea,
} from "@/lib/db/queries/gift-ideas";
import { createGiftIdeaSchema } from "@/lib/validations/gift-idea";
import { isAmazonUrl, convertToAffiliateLink } from "@/lib/amazon/affiliate-link";
import { extractASIN } from "@/lib/amazon/extract-asin";

/**
 * GET /api/gift-ideas
 * List all gift ideas for the authenticated user
 * Optionally filter by recipientId query param
 */
export async function GET(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get optional recipientId filter from query params
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get("recipientId") ?? undefined;

    const giftIdeas = await getGiftIdeasByUserId(dbUser.id, recipientId);

    return NextResponse.json(giftIdeas);
  } catch (error) {
    console.error("Error fetching gift ideas:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gift-ideas
 * Create a new gift idea for the authenticated user
 * If URL is Amazon, extract ASIN and convert to affiliate link
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    const validationResult = createGiftIdeaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientId, title, description, url, price } = validationResult.data;

    // Process URL for Amazon affiliate links
    let processedUrl: string | null = null;
    let originalUrl: string | null = null;
    let asin: string | null = null;
    let originalPrice: string | null = null;

    if (url && url.trim() !== "") {
      if (isAmazonUrl(url)) {
        const extractedAsin = extractASIN(url);
        if (extractedAsin) {
          asin = extractedAsin;
          originalUrl = url;
          processedUrl = convertToAffiliateLink(url, extractedAsin);
          // Store the entered price as original_price for Amazon products
          if (price && price.trim() !== "") {
            originalPrice = price;
          }
        } else {
          // Amazon URL but couldn't extract ASIN, store as-is
          processedUrl = url;
          originalUrl = url;
        }
      } else {
        // Non-Amazon URL, store as-is
        processedUrl = url;
        originalUrl = url;
      }
    }

    const giftIdea = await createGiftIdea({
      userId: dbUser.id,
      recipientId,
      title,
      description: description ?? null,
      url: processedUrl,
      originalUrl,
      price: price && price.trim() !== "" ? price : null,
      asin,
      originalPrice,
    });

    return NextResponse.json(giftIdea, { status: 201 });
  } catch (error) {
    console.error("Error creating gift idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
