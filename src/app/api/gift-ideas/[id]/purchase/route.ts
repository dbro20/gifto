import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  markAsPurchased,
  markAsUnpurchased,
  getGiftIdeaById,
} from "@/lib/db/queries/gift-ideas";
import { purchaseGiftSchema } from "@/lib/validations/gift-idea";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/gift-ideas/[id]/purchase
 * Mark a gift idea as purchased (with optional occasion_id)
 */
export async function POST(request: Request, { params }: RouteParams) {
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

    // Verify the gift idea exists and belongs to the user
    const existingGiftIdea = await getGiftIdeaById(id, dbUser.id);

    if (!existingGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    // Parse optional body for occasion ID
    let occasionId: string | null = null;
    try {
      const body = await request.json();
      const validationResult = purchaseGiftSchema.safeParse(body);

      if (validationResult.success && validationResult.data.occasionId) {
        occasionId = validationResult.data.occasionId;
      }
    } catch {
      // Body might be empty, which is fine
    }

    const updatedGiftIdea = await markAsPurchased(id, dbUser.id, occasionId);

    if (!updatedGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGiftIdea);
  } catch (error) {
    console.error("Error marking gift idea as purchased:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gift-ideas/[id]/purchase
 * Mark a gift idea as unpurchased
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

    // Verify the gift idea exists and belongs to the user
    const existingGiftIdea = await getGiftIdeaById(id, dbUser.id);

    if (!existingGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    const updatedGiftIdea = await markAsUnpurchased(id, dbUser.id);

    if (!updatedGiftIdea) {
      return NextResponse.json(
        { error: "Gift idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedGiftIdea);
  } catch (error) {
    console.error("Error marking gift idea as unpurchased:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
