import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db/queries/users";
import {
  getRecipientsByUserId,
  createRecipient,
} from "@/lib/db/queries/recipients";
import { createOccasion } from "@/lib/db/queries/occasions";
import { createRecipientSchema } from "@/lib/validations/recipient";

/**
 * GET /api/recipients
 * List all recipients for the authenticated user
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(
      user.id,
      user.emailAddresses[0]?.emailAddress ?? "",
      user.fullName ?? user.firstName
    );

    const recipients = await getRecipientsByUserId(dbUser.id);

    return NextResponse.json(recipients);
  } catch (error) {
    console.error("Error fetching recipients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recipients
 * Create a new recipient for the authenticated user
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(
      user.id,
      user.emailAddresses[0]?.emailAddress ?? "",
      user.fullName ?? user.firstName
    );

    const body = await request.json();

    const validationResult = createRecipientSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, relationship, notes } = validationResult.data;

    // Create recipient
    const recipient = await createRecipient({
      userId: dbUser.id,
      name,
      relationship: relationship ?? null,
      notes: notes ?? null,
    });

    // Create occasions if provided
    const occasions = body.occasions as Array<{
      occasionType: string;
      date: string;
      isAnnual?: boolean;
    }> | undefined;

    if (occasions && occasions.length > 0) {
      for (const occasion of occasions) {
        await createOccasion({
          recipientId: recipient.id,
          userId: dbUser.id,
          occasionType: occasion.occasionType,
          date: occasion.date,
          isAnnual: occasion.isAnnual ?? true,
        });
      }
    }

    return NextResponse.json(recipient, { status: 201 });
  } catch (error) {
    console.error("Error creating recipient:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
