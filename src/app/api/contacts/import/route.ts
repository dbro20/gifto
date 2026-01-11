import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db/queries/users";
import { createRecipient } from "@/lib/db/queries/recipients";
import { createOccasion } from "@/lib/db/queries/occasions";

interface ImportContact {
  name: string;
  birthday: string;
  email?: string;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { contacts } = (await request.json()) as { contacts: ImportContact[] };

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json(
        { error: "Invalid contacts data" },
        { status: 400 }
      );
    }

    // Get database user
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(
      clerkUser.id,
      clerkUser.emailAddresses[0]?.emailAddress ?? "",
      clerkUser.fullName ?? clerkUser.firstName
    );

    const imported: string[] = [];
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        // Create recipient
        const recipient = await createRecipient({
          userId: dbUser.id,
          name: contact.name,
          relationship: "friend", // Default relationship
          notes: contact.email ? `Email: ${contact.email}` : undefined,
        });

        // Create birthday occasion
        await createOccasion({
          recipientId: recipient.id,
          userId: dbUser.id,
          occasionType: "Birthday",
          date: contact.birthday,
          isAnnual: true,
        });

        imported.push(contact.name);
      } catch (error) {
        console.error(`Failed to import ${contact.name}:`, error);
        errors.push(contact.name);
      }
    }

    return NextResponse.json({
      success: true,
      imported: imported.length,
      errors: errors.length,
      importedNames: imported,
      errorNames: errors,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" },
      { status: 500 }
    );
  }
}
