import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getGiftIdeasByUserId,
  createGiftIdea,
} from "@/lib/db/queries/gift-ideas";
import { isAmazonUrl, convertToAffiliateLink } from "@/lib/amazon/affiliate-link";
import { extractASIN } from "@/lib/amazon/extract-asin";

const createGiftSchema = z.object({
  recipientIds: z.array(z.string().uuid()).min(1),
  title: z.string().min(1).max(200),
  url: z.string().url().max(2000).optional().nullable().or(z.literal("")),
});

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
 * Create gift ideas for multiple recipients
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

    const validationResult = createGiftSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientIds, title, url } = validationResult.data;

    // Process URL for Amazon affiliate links
    let processedUrl: string | null = null;
    let originalUrl: string | null = null;
    let asin: string | null = null;

    if (url && url.trim() !== "") {
      if (isAmazonUrl(url)) {
        const extractedAsin = extractASIN(url);
        if (extractedAsin) {
          asin = extractedAsin;
          originalUrl = url;
          processedUrl = convertToAffiliateLink(url, extractedAsin);
        } else {
          processedUrl = url;
          originalUrl = url;
        }
      } else {
        processedUrl = url;
        originalUrl = url;
      }
    }

    // Create a gift idea for each selected recipient
    const createdGifts = await Promise.all(
      recipientIds.map((recipientId) =>
        createGiftIdea({
          userId: dbUser.id,
          recipientId,
          title,
          url: processedUrl,
          originalUrl,
          asin,
        })
      )
    );

    return NextResponse.json(createdGifts, { status: 201 });
  } catch (error) {
    console.error("Error creating gift idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
