"use client";

import { useState } from "react";

import { GiftCard } from "./gift-card";
import { Button } from "@/components/ui/button";
import type { GiftIdea } from "@/types";

type GiftIdeaWithRecipient = GiftIdea & {
  recipient?: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
};

interface GiftListProps {
  giftIdeas: GiftIdeaWithRecipient[];
  isLoading?: boolean;
  showRecipient?: boolean;
}

type FilterStatus = "all" | "available" | "purchased";

function GiftListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-36 rounded-xl border bg-card animate-pulse"
        >
          <div className="p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="h-4 w-full bg-muted rounded" />
            <div className="flex justify-between">
              <div className="h-4 w-12 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ status }: { status: FilterStatus }) {
  const messages = {
    all: {
      title: "No gift ideas yet",
      description:
        "Get started by adding gift ideas for the people you care about.",
    },
    available: {
      title: "No available gift ideas",
      description: "All gift ideas have been purchased, or you haven't added any yet.",
    },
    purchased: {
      title: "No purchased gifts",
      description: "Mark gift ideas as purchased when you buy them.",
    },
  };

  const { title, description } = messages[status];

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 text-muted-foreground"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
    </div>
  );
}

export function GiftList({
  giftIdeas,
  isLoading,
  showRecipient = true,
}: GiftListProps) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  if (isLoading) {
    return <GiftListSkeleton />;
  }

  // Filter gift ideas based on status
  const filteredGiftIdeas = giftIdeas.filter((gift) => {
    if (filterStatus === "all") return true;
    if (filterStatus === "available") return !gift.isPurchased;
    if (filterStatus === "purchased") return gift.isPurchased;
    return true;
  });

  // Count for filter buttons
  const availableCount = giftIdeas.filter((g) => !g.isPurchased).length;
  const purchasedCount = giftIdeas.filter((g) => g.isPurchased).length;

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      {giftIdeas.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All ({giftIdeas.length})
          </Button>
          <Button
            variant={filterStatus === "available" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("available")}
          >
            Available ({availableCount})
          </Button>
          <Button
            variant={filterStatus === "purchased" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilterStatus("purchased")}
          >
            Purchased ({purchasedCount})
          </Button>
        </div>
      )}

      {/* Gift cards grid */}
      {filteredGiftIdeas.length === 0 ? (
        <EmptyState status={giftIdeas.length === 0 ? "all" : filterStatus} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGiftIdeas.map((giftIdea) => (
            <GiftCard
              key={giftIdea.id}
              giftIdea={giftIdea}
              showRecipient={showRecipient}
            />
          ))}
        </div>
      )}
    </div>
  );
}
