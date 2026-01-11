import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getOccasionsByUserId,
  createOccasion,
} from "@/lib/db/queries/occasions";
import { createOccasionSchema } from "@/lib/validations/occasion";

/**
 * GET /api/occasions
 * List all occasions for the authenticated user
 * Optional query param: ?recipientId= to filter by recipient
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get("recipientId") ?? undefined;

    const occasions = await getOccasionsByUserId(dbUser.id, recipientId);

    return NextResponse.json(occasions);
  } catch (error) {
    console.error("Error fetching occasions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/occasions
 * Create a new occasion for the authenticated user
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

    const validationResult = createOccasionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { recipientId, occasionType, date, isAnnual, notes } =
      validationResult.data;

    const occasion = await createOccasion({
      userId: dbUser.id,
      recipientId,
      occasionType,
      date,
      isAnnual: isAnnual ?? false,
      notes: notes ?? null,
    });

    return NextResponse.json(occasion, { status: 201 });
  } catch (error) {
    console.error("Error creating occasion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
