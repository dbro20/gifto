import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { GiftList } from "@/components/gifts/gift-list";
import { RecipientFilter } from "@/components/gifts/recipient-filter";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getGiftIdeasByUserId } from "@/lib/db/queries/gift-ideas";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";

type PageProps = {
  searchParams: Promise<{ recipientId?: string }>;
};

export default async function GiftsPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    // User not synced yet - this shouldn't happen in normal flow
    redirect("/");
  }

  const params = await searchParams;
  const recipientId = params.recipientId;

  const [giftIdeas, recipients] = await Promise.all([
    getGiftIdeasByUserId(dbUser.id, recipientId),
    getRecipientsByUserId(dbUser.id),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#e8d5c4]">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
          >
            Gift Ideas
          </h1>
          <p className="mt-1" style={{ color: "#b5a088" }}>
            Manage your gift ideas for all recipients.
          </p>
        </div>
        <Button
          asChild
          className="transition-all duration-200 hover:scale-105"
          style={{
            background: "#8b7355",
            color: "#fffcf7",
            fontFamily: "'Kalam', cursive",
          }}
        >
          <Link href="/gifts/new">Add Gift Idea</Link>
        </Button>
      </div>

      {/* Recipient filter */}
      {recipients.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm" style={{ color: "#b5a088", fontFamily: "'Kalam', cursive" }}>Filter by:</span>
          <RecipientFilter
            recipients={recipients}
            selectedRecipientId={recipientId}
          />
        </div>
      )}

      <GiftList giftIdeas={giftIdeas} />
    </div>
  );
}
