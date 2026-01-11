import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getRecipientById,
  updateRecipient,
  deleteRecipient,
} from "@/lib/db/queries/recipients";
import {
  getOccasionsByUserId,
  createOccasion,
  deleteOccasion,
} from "@/lib/db/queries/occasions";

const updateRecipientWithOccasionsSchema = z.object({
  name: z.string().min(1).optional(),
  notes: z.string().optional().nullable(),
  occasions: z.array(z.object({
    id: z.string().optional(),
    occasionType: z.string().min(1),
    date: z.string().min(1),
    isAnnual: z.boolean(),
  })).optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/recipients/[id]
 * Get a single recipient by ID (with ownership verification)
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
    const recipient = await getRecipientById(id, dbUser.id);

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipient);
  } catch (error) {
    console.error("Error fetching recipient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/recipients/[id]
 * Update a recipient and their occasions (with ownership verification)
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

    const validationResult = updateRecipientWithOccasionsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await params;
    const { occasions, ...recipientData } = validationResult.data;

    // Update recipient info
    const updatedRecipient = await updateRecipient(id, dbUser.id, recipientData);

    if (!updatedRecipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Handle occasions if provided
    if (occasions) {
      // Get existing occasions
      const existingOccasions = await getOccasionsByUserId(dbUser.id, id);
      const existingIds = new Set(existingOccasions.map((o) => o.id));
      const newIds = new Set(occasions.filter((o) => o.id).map((o) => o.id));

      // Delete occasions that are no longer in the list
      for (const existing of existingOccasions) {
        if (!newIds.has(existing.id)) {
          await deleteOccasion(existing.id, dbUser.id);
        }
      }

      // Create or update occasions
      for (const occasion of occasions) {
        if (!occasion.id || !existingIds.has(occasion.id)) {
          // Create new occasion
          await createOccasion({
            recipientId: id,
            userId: dbUser.id,
            occasionType: occasion.occasionType,
            date: occasion.date,
            isAnnual: occasion.isAnnual,
          });
        }
        // Note: We're not updating existing occasions here since we're just
        // using delete + create pattern for simplicity
      }
    }

    return NextResponse.json(updatedRecipient);
  } catch (error) {
    console.error("Error updating recipient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/recipients/[id]
 * Delete a recipient (with ownership verification)
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
    const deleted = await deleteRecipient(id, dbUser.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
