"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { GiftIdea } from "@/types";

interface GiftCardProps {
  giftIdea: GiftIdea & {
    recipient?: {
      id: string;
      name: string;
      relationship: string | null;
    } | null;
  };
  showRecipient?: boolean;
}

export function GiftCard({ giftIdea, showRecipient = true }: GiftCardProps) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const hasAsin = Boolean(giftIdea.asin);
  const hasUrl = Boolean(giftIdea.url);
  const price = giftIdea.price ? `$${giftIdea.price}` : null;

  async function togglePurchased() {
    setIsPurchasing(true);

    try {
      const method = giftIdea.isPurchased ? "DELETE" : "POST";
      const response = await fetch(`/api/gift-ideas/${giftIdea.id}/purchase`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update purchase status");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating purchase status:", error);
    } finally {
      setIsPurchasing(false);
    }
  }

  return (
    <Card className={`h-full transition-colors ${giftIdea.isPurchased ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link
              href={`/gifts/${giftIdea.id}`}
              className="hover:underline"
            >
              <h3 className={`font-semibold truncate ${giftIdea.isPurchased ? "line-through" : ""}`}>
                {giftIdea.title}
              </h3>
            </Link>
            {showRecipient && giftIdea.recipient && (
              <p className="text-sm text-muted-foreground mt-0.5">
                For {giftIdea.recipient.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAsin && (
              <Badge variant="outline" className="shrink-0">
                Amazon
              </Badge>
            )}
            {giftIdea.isPurchased && (
              <Badge variant="secondary" className="shrink-0">
                Purchased
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {giftIdea.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {giftIdea.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {price && (
              <span className="text-sm font-medium">{price}</span>
            )}
            {hasUrl && (
              <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                <a
                  href={giftIdea.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {hasAsin ? "Buy on Amazon" : "View Link"}
                </a>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor={`purchased-${giftIdea.id}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Purchased
            </label>
            <Checkbox
              id={`purchased-${giftIdea.id}`}
              checked={giftIdea.isPurchased}
              onCheckedChange={togglePurchased}
              disabled={isPurchasing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
