import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getGiftIdeaById } from "@/lib/db/queries/gift-ideas";
import { getOccasionsByUserId } from "@/lib/db/queries/occasions";
import { DeleteGiftButton } from "./delete-button";
import { PurchaseButton } from "./purchase-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GiftDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  const { id } = await params;
  const giftIdea = await getGiftIdeaById(id, dbUser.id);

  if (!giftIdea) {
    notFound();
  }

  // Get occasions for the recipient (for purchase modal)
  const occasions = giftIdea.recipientId
    ? await getOccasionsByUserId(dbUser.id, giftIdea.recipientId)
    : [];

  const hasAsin = Boolean(giftIdea.asin);
  const hasUrl = Boolean(giftIdea.url);
  const price = giftIdea.price ? `$${giftIdea.price}` : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className={`text-2xl font-bold tracking-tight md:text-3xl ${giftIdea.isPurchased ? "line-through opacity-60" : ""}`}>
              {giftIdea.title}
            </h1>
            {giftIdea.isPurchased && (
              <Badge variant="secondary">Purchased</Badge>
            )}
            {hasAsin && (
              <Badge variant="outline">Amazon</Badge>
            )}
          </div>
          {giftIdea.recipient && (
            <p className="text-muted-foreground">
              For{" "}
              <Link
                href={`/recipients/${giftIdea.recipient.id}`}
                className="hover:underline"
              >
                {giftIdea.recipient.name}
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/gifts/${giftIdea.id}/edit`}>Edit</Link>
          </Button>
          <DeleteGiftButton giftId={giftIdea.id} />
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {giftIdea.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {giftIdea.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Link */}
          {hasUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Product Link</CardTitle>
                {hasAsin && (
                  <CardDescription>
                    This is an Amazon affiliate link
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button asChild className="w-full sm:w-auto">
                    <a
                      href={giftIdea.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {hasAsin ? "Buy on Amazon" : "View Product"}
                    </a>
                  </Button>
                  {giftIdea.originalUrl && giftIdea.originalUrl !== giftIdea.url && (
                    <p className="text-xs text-muted-foreground break-all">
                      Original URL: {giftIdea.originalUrl}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Price card */}
          <Card>
            <CardHeader>
              <CardTitle>Price</CardTitle>
            </CardHeader>
            <CardContent>
              {price ? (
                <p className="text-2xl font-bold">{price}</p>
              ) : (
                <p className="text-muted-foreground">No price set</p>
              )}
              {giftIdea.originalPrice && giftIdea.originalPrice !== giftIdea.price && (
                <p className="text-sm text-muted-foreground mt-1">
                  Original: ${giftIdea.originalPrice}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Purchase status */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {giftIdea.isPurchased ? (
                <div>
                  <Badge variant="secondary" className="mb-2">Purchased</Badge>
                  {giftIdea.purchasedForOccasion && (
                    <p className="text-sm text-muted-foreground">
                      For: {giftIdea.purchasedForOccasion.occasionType}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">Not yet purchased</p>
              )}
              <Separator />
              <PurchaseButton
                giftId={giftIdea.id}
                isPurchased={giftIdea.isPurchased}
                occasions={occasions}
              />
            </CardContent>
          </Card>

          {/* ASIN info (if Amazon) */}
          {hasAsin && (
            <Card>
              <CardHeader>
                <CardTitle>Amazon Info</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">ASIN</dt>
                    <dd className="font-mono">{giftIdea.asin}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
