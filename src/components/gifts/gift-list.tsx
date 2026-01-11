"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    <div
      className="rounded-lg border-2 border-dashed overflow-hidden"
      style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-3 py-2 animate-pulse"
          style={{ borderBottom: i < 5 ? "1px dashed #e8d5c4" : "none" }}
        >
          <div className="h-4 w-48 rounded" style={{ background: "#f5ebe0" }} />
          <div className="h-3 w-3 rounded" style={{ background: "#f5ebe0" }} />
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
    <div
      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
      style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "#f5ebe0" }}
      >
        <span className="text-2xl">🎁</span>
      </div>
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ color: "#8b7355" }}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm max-w-sm" style={{ color: "#b5a088" }}>
        {description}
      </p>
    </div>
  );
}

function GiftRow({
  giftIdea,
  showRecipient
}: {
  giftIdea: GiftIdeaWithRecipient;
  showRecipient: boolean;
}) {
  const router = useRouter();
  const [isPurchasing, setIsPurchasing] = useState(false);

  async function togglePurchased(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
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
    <Link
      href={`/gifts/${giftIdea.id}`}
      className={`flex items-center justify-between px-3 py-2 transition-all duration-200 hover:scale-[1.01] ${
        giftIdea.isPurchased ? "opacity-50" : ""
      }`}
      style={{ color: "#6b5a45" }}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div onClick={togglePurchased}>
          <Checkbox
            checked={giftIdea.isPurchased}
            disabled={isPurchasing}
            className="h-4 w-4 border-2"
            style={{ borderColor: "#e8d5c4" }}
          />
        </div>
        <span
          className={`text-sm font-medium truncate ${giftIdea.isPurchased ? "line-through" : ""}`}
         
        >
          {giftIdea.title}
        </span>
        {showRecipient && giftIdea.recipient && (
          <span className="text-xs shrink-0" style={{ color: "#b5a088" }}>
            {giftIdea.recipient.name}
          </span>
        )}
        {giftIdea.url && (
          <a
            href={giftIdea.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="shrink-0 hover:scale-110 transition-transform"
            style={{ color: "#b5a088" }}
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
      <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "#b5a088" }} />
    </Link>
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
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus("all")}
            className="transition-all duration-200"
            style={{
              background: filterStatus === "all" ? "#f5ebe0" : "transparent",
              color: filterStatus === "all" ? "#8b7355" : "#b5a088",
              border: filterStatus === "all" ? "2px solid #e8d5c4" : "2px solid transparent",
              
            }}
          >
            All ({giftIdeas.length})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus("available")}
            className="transition-all duration-200"
            style={{
              background: filterStatus === "available" ? "#f5ebe0" : "transparent",
              color: filterStatus === "available" ? "#8b7355" : "#b5a088",
              border: filterStatus === "available" ? "2px solid #e8d5c4" : "2px solid transparent",
              
            }}
          >
            Available ({availableCount})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterStatus("purchased")}
            className="transition-all duration-200"
            style={{
              background: filterStatus === "purchased" ? "#f5ebe0" : "transparent",
              color: filterStatus === "purchased" ? "#8b7355" : "#b5a088",
              border: filterStatus === "purchased" ? "2px solid #e8d5c4" : "2px solid transparent",
              
            }}
          >
            Purchased ({purchasedCount})
          </Button>
        </div>
      )}

      {/* Gift list */}
      {filteredGiftIdeas.length === 0 ? (
        <EmptyState status={giftIdeas.length === 0 ? "all" : filterStatus} />
      ) : (
        <div
          className="rounded-lg border-2 overflow-hidden"
          style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
        >
          {filteredGiftIdeas.map((giftIdea, index) => (
            <div
              key={giftIdea.id}
              style={{ borderBottom: index < filteredGiftIdeas.length - 1 ? "1px dashed #e8d5c4" : "none" }}
            >
              <GiftRow
                giftIdea={giftIdea}
                showRecipient={showRecipient}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
