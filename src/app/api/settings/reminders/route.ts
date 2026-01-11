import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import {
  getOrCreateReminderSettings,
  updateReminderSettings,
} from "@/lib/db/queries/reminders";
import { updateReminderSettingsSchema } from "@/lib/validations/reminder";

/**
 * GET /api/settings/reminders
 * Get the authenticated user's reminder settings
 */
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getUserByClerkId(user.id);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get or create reminder settings for the user
    const settings = await getOrCreateReminderSettings(dbUser.id);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching reminder settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/settings/reminders
 * Update the authenticated user's reminder settings
 */
export async function PUT(request: Request) {
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

    // Validate the request body
    const validationResult = updateReminderSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { daysBefore, emailEnabled } = validationResult.data;

    // Ensure settings exist before updating
    await getOrCreateReminderSettings(dbUser.id);

    // Update the settings
    const updatedSettings = await updateReminderSettings(dbUser.id, {
      daysBefore,
      emailEnabled,
    });

    if (!updatedSettings) {
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error("Error updating reminder settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
