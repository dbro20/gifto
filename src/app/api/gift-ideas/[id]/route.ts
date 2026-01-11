import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getGiftIdeaById,
  updateGiftIdea,
  deleteGiftIdea,
} from "@/lib/db/queries/gift-ideas";
import { updateGiftIdeaSchema } from "@/lib/validations/gift-idea";
import { isAmazonUrl, convertToAffiliateLink } from "@/lib/amazon/affiliate-link";
import { extractASIN } from "@/lib/amazon/extract-asin";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/gift-ideas/[id]
 * Get a single gift idea by ID (with ownership verification)
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const giftIdea = await getGiftIdeaById(id, dbUser.id);

    if (!giftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(giftIdea);
  } catch (error) {
    console.error("Error fetching gift idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/gift-ideas/[id]
 * Update a gift idea (with ownership verification)
 * Re-processes Amazon URL if changed
 */
export async function PUT(request: Request, { params }: RouteParams) {
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

    const validationResult = updateGiftIdeaSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { url, price, ...restData } = validationResult.data;

    // Get the existing gift idea to compare URLs
    const existingGiftIdea = await getGiftIdeaById(id, dbUser.id);

    if (!existingGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { ...restData };

    // Handle price
    if (price !== undefined) {
      updateData.price = price && price.trim() !== "" ? price : null;
    }

    // Process URL if provided and changed
    if (url !== undefined) {
      if (url && url.trim() !== "") {
        // URL was provided and is not empty
        if (url !== existingGiftIdea.originalUrl) {
          // URL changed, re-process it
          if (isAmazonUrl(url)) {
            const extractedAsin = extractASIN(url);
            if (extractedAsin) {
              updateData.asin = extractedAsin;
              updateData.originalUrl = url;
              updateData.url = convertToAffiliateLink(url, extractedAsin);
              // Update original_price if price is provided
              if (price && price.trim() !== "") {
                updateData.originalPrice = price;
              }
            } else {
              // Amazon URL but couldn't extract ASIN
              updateData.url = url;
              updateData.originalUrl = url;
              updateData.asin = null;
            }
          } else {
            // Non-Amazon URL
            updateData.url = url;
            updateData.originalUrl = url;
            updateData.asin = null;
          }
        }
        // If URL hasn't changed, don't update URL-related fields
      } else {
        // URL was cleared
        updateData.url = null;
        updateData.originalUrl = null;
        updateData.asin = null;
      }
    }

    const updatedGiftIdea = await updateGiftIdea(id, dbUser.id, updateData);

    if (!updatedGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGiftIdea);
  } catch (error) {
    console.error("Error updating gift idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gift-ideas/[id]
 * Delete a gift idea (with ownership verification)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;
    const deleted = await deleteGiftIdea(id, dbUser.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting gift idea:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
