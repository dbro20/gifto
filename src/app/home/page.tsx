import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getOrCreateUser } from "@/lib/db/queries/users";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";
import { getOccasionsByUserId } from "@/lib/db/queries/occasions";
import { CalendarCottage } from "@/components/designs/calendar-cottage";
import { Users, Gift, Plus, UserPlus } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  // Get or create user in database
  const dbUser = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.fullName ?? user.firstName
  );

  // Fetch all data in parallel
  const [recipients, occasions] = await Promise.all([
    getRecipientsByUserId(dbUser.id),
    getOccasionsByUserId(dbUser.id),
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b-2 border-dashed border-[#e8d5c4]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl text-[#8b7355]">
            Welcome{user.firstName ? `, ${user.firstName}` : ""}!
          </h2>
          <p className="text-[#b5a088] mt-1">
            Here&apos;s your gift calendar for the year.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="border-2 border-[#e8d5c4] bg-[#f5ebe0] text-[#8b7355] hover:bg-[#e8d5c4] hover:scale-105 transition-transform">
            <Link href="/recipients/new">
              <UserPlus className="mr-1 h-4 w-4" />
              Add Person
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-[#8b7355] text-[#fffcf7] hover:bg-[#6b5a45] hover:scale-105 transition-transform">
            <Link href="/gifts/new">
              <Gift className="mr-1 h-4 w-4" />
              Add Gift Idea
            </Link>
          </Button>
        </div>
      </div>

      {/* Show calendar or getting started */}
      {recipients.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e8d5c4] bg-[#fffcf7]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-[#f5ebe0] p-4 mb-4">
              <Users className="h-8 w-8 text-[#8b7355]" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#8b7355]">Get Started with Gifty</h3>
            <p className="text-[#b5a088] text-center max-w-md mb-6">
              Add your first person to start tracking their special occasions and gift ideas!
            </p>
            <Button asChild size="lg" className="bg-[#8b7355] text-[#fffcf7] hover:bg-[#6b5a45] hover:scale-105 transition-transform">
              <Link href="/recipients/new">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Person
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <CalendarCottage occasions={occasions} />
      )}
    </div>
  );
}
