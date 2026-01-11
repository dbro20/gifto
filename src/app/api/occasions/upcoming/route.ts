import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getUpcomingOccasions } from "@/lib/db/queries/occasions";

/**
 * GET /api/occasions/upcoming
 * Get upcoming occasions within the next N days
 * Optional query param: ?days= (default 30)
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
    const daysParam = searchParams.get("days");
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (isNaN(days) || days < 0 || days > 365) {
      return NextResponse.json(
        { error: "Invalid days parameter. Must be between 0 and 365." },
        { status: 400 }
      );
    }

    const occasions = await getUpcomingOccasions(dbUser.id, days);

    return NextResponse.json(occasions);
  } catch (error) {
    console.error("Error fetching upcoming occasions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
