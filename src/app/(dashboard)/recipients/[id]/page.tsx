import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Plus, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientById } from "@/lib/db/queries/recipients";
import { getGiftIdeasByRecipientId } from "@/lib/db/queries/gift-ideas";
import { getOccasionsByUserId } from "@/lib/db/queries/occasions";
import { DeleteRecipientButton } from "./delete-button";
import { GiftList } from "@/components/gifts/gift-list";

type PageProps = {
  params: Promise<{ id: string }>;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatDateWithoutYear(dateString: string): string {
  // Parse directly from string to avoid any timezone issues
  const [, month, day] = dateString.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  return `${MONTHS[monthIndex]} ${dayNum}`;
}

export default async function RecipientDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  const { id } = await params;
  const [recipient, giftIdeas, occasions] = await Promise.all([
    getRecipientById(id, dbUser.id),
    getGiftIdeasByRecipientId(id, dbUser.id),
    getOccasionsByUserId(dbUser.id, id),
  ]);

  if (!recipient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b-2 border-dashed border-[#e8d5c4]">
        <h1
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: "#8b7355" }}
        >
          {recipient.name}
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "#e8d5c4",
              background: "#f5ebe0",
              color: "#8b7355",
              
            }}
          >
            <Link href={`/recipients/${recipient.id}/edit`}>Edit</Link>
          </Button>
          <DeleteRecipientButton recipientId={recipient.id} />
        </div>
      </div>

      {/* Special Dates */}
      {occasions.length > 0 && (
        <div className="space-y-2">
          <h2
            className="text-sm font-medium"
            style={{ color: "#b5a088" }}
          >
            Special Dates
          </h2>
          <div className="flex flex-wrap gap-4">
            {occasions.map((occasion) => (
              <div
                key={occasion.id}
                className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg"
                style={{ background: "#f5ebe0", border: "1px dashed #e8d5c4" }}
              >
                <Calendar className="h-4 w-4" style={{ color: "#b5a088" }} />
                <span className="font-medium" style={{ color: "#8b7355" }}>
                  {occasion.occasionType}
                </span>
                <span style={{ color: "#b5a088" }}>
                  {formatDateWithoutYear(occasion.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {recipient.notes && (
        <>
          <div className="border-t-2 border-dashed border-[#e8d5c4]" />
          <div className="space-y-2">
            <h2
              className="text-sm font-medium"
              style={{ color: "#b5a088" }}
            >
              Notes
            </h2>
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: "#6b5a45" }}
            >
              {recipient.notes}
            </p>
          </div>
        </>
      )}

      <div className="border-t-2 border-dashed border-[#e8d5c4]" />

      {/* Gift Ideas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ color: "#8b7355" }}
          >
            Gift Ideas
          </h2>
          <Button
            size="sm"
            asChild
            className="transition-all duration-200 hover:scale-105"
            style={{
              background: "#8b7355",
              color: "#fffcf7",
              
            }}
          >
            <Link href={`/gifts/new?recipientId=${recipient.id}`}>
              <Plus className="mr-1 h-4 w-4" />
              Add Gift
            </Link>
          </Button>
        </div>
        <GiftList giftIdeas={giftIdeas} showRecipient={false} />
      </div>
    </div>
  );
}
