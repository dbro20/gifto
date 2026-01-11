import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";
import { getUpcomingOccasions } from "@/lib/db/queries/occasions";
import { getGiftIdeasByUserId } from "@/lib/db/queries/gift-ideas";
import { UpcomingOccasions } from "@/components/occasions/upcoming-occasions";
import { Users, Gift, Calendar, Plus } from "lucide-react";

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);
  if (!dbUser) {
    // User not yet synced, show welcome message
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome to Gifto
          </h2>
          <p className="text-muted-foreground mt-2">
            Setting up your account... Please refresh in a moment.
          </p>
        </div>
      </div>
    );
  }

  // Fetch all data in parallel
  const [recipients, upcomingOccasions, giftIdeas] = await Promise.all([
    getRecipientsByUserId(dbUser.id),
    getUpcomingOccasions(dbUser.id, 30),
    getGiftIdeasByUserId(dbUser.id),
  ]);

  const unpurchasedGifts = giftIdeas.filter(g => !g.isPurchased);

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s coming up for your loved ones.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/recipients/new">
              <Plus className="mr-1 h-4 w-4" />
              Add Recipient
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/gifts/new">
              <Gift className="mr-1 h-4 w-4" />
              Add Gift Idea
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients.length}</div>
            <p className="text-muted-foreground text-xs">
              {recipients.length === 1 ? "person" : "people"} you&apos;re tracking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingOccasions.length}</div>
            <p className="text-muted-foreground text-xs">
              {upcomingOccasions.length === 1 ? "occasion" : "occasions"} in next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gift Ideas</CardTitle>
            <Gift className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpurchasedGifts.length}</div>
            <p className="text-muted-foreground text-xs">
              {unpurchasedGifts.length === 1 ? "idea" : "ideas"} saved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming occasions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Occasions</CardTitle>
              <CardDescription>
                Don&apos;t forget these important dates
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/occasions">View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingOccasions.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No upcoming occasions in the next 30 days.
              </p>
              {recipients.length === 0 ? (
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/recipients/new">Add your first recipient</Link>
                </Button>
              ) : (
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/occasions/new">Add an occasion</Link>
                </Button>
              )}
            </div>
          ) : (
            <UpcomingOccasions
              days={30}
              limit={5}
              showTitle={false}
              showAddButton={false}
            />
          )}
        </CardContent>
      </Card>

      {/* Quick links when empty */}
      {recipients.length === 0 && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Set up Gifto in three easy steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  1
                </span>
                <div>
                  <p className="font-medium">Add recipients</p>
                  <p className="text-muted-foreground">
                    Add the people you want to track gifts for
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  2
                </span>
                <div>
                  <p className="font-medium">Add their occasions</p>
                  <p className="text-muted-foreground">
                    Birthdays, anniversaries, holidays, and more
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  3
                </span>
                <div>
                  <p className="font-medium">Save gift ideas</p>
                  <p className="text-muted-foreground">
                    Paste Amazon links to auto-convert to affiliate links
                  </p>
                </div>
              </li>
            </ol>
            <Button asChild className="mt-6 w-full">
              <Link href="/recipients/new">
                <Plus className="mr-2 h-4 w-4" />
                Add your first recipient
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
