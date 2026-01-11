import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getOccasionById,
  updateOccasion,
  deleteOccasion,
} from "@/lib/db/queries/occasions";
import { updateOccasionSchema } from "@/lib/validations/occasion";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/occasions/[id]
 * Get a single occasion by ID (with ownership verification)
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
    const occasion = await getOccasionById(id, dbUser.id);

    if (!occasion) {
      return NextResponse.json(
        { error: "Occasion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(occasion);
  } catch (error) {
    console.error("Error fetching occasion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/occasions/[id]
 * Update an occasion (with ownership verification)
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

    const validationResult = updateOccasionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { id } = await params;
    const updatedOccasion = await updateOccasion(
      id,
      dbUser.id,
      validationResult.data
    );

    if (!updatedOccasion) {
      return NextResponse.json(
        { error: "Occasion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedOccasion);
  } catch (error) {
    console.error("Error updating occasion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/occasions/[id]
 * Delete an occasion (with ownership verification)
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
    const deleted = await deleteOccasion(id, dbUser.id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Occasion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting occasion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
