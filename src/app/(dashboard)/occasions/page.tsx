"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlusIcon, FilterIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OccasionCard } from "@/components/occasions/occasion-card";

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
};

type Occasion = {
  id: string;
  recipientId: string;
  userId: string;
  occasionType: string;
  date: string;
  isAnnual: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  recipient: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
};

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipients for the filter dropdown
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch("/api/recipients");
        if (response.ok) {
          const data = await response.json();
          setRecipients(data);
        }
      } catch (err) {
        console.error("Failed to fetch recipients:", err);
      }
    };

    fetchRecipients();
  }, []);

  // Fetch occasions
  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        setIsLoading(true);
        const url =
          selectedRecipientId && selectedRecipientId !== "all"
            ? `/api/occasions?recipientId=${selectedRecipientId}`
            : "/api/occasions";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch occasions");
        }

        const data = await response.json();
        setOccasions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccasions();
  }, [selectedRecipientId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Occasions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all your important dates and occasions.
          </p>
        </div>
        <Button asChild>
          <Link href="/occasions/new">
            <CalendarPlusIcon className="h-4 w-4 mr-2" />
            Add Occasion
          </Link>
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <FilterIcon className="h-4 w-4 text-muted-foreground" />
        <Select
          value={selectedRecipientId}
          onValueChange={setSelectedRecipientId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by recipient" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipients</SelectItem>
            {recipients.map((recipient) => (
              <SelectItem key={recipient.id} value={recipient.id}>
                {recipient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      ) : occasions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {selectedRecipientId && selectedRecipientId !== "all"
              ? "No occasions found for this recipient."
              : "No occasions yet. Add your first occasion to get started!"}
          </p>
          <Button asChild variant="outline">
            <Link href="/occasions/new">
              <CalendarPlusIcon className="h-4 w-4 mr-2" />
              Add Occasion
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {occasions.map((occasion) => (
            <OccasionCard
              key={occasion.id}
              id={occasion.id}
              occasionType={occasion.occasionType}
              date={occasion.date}
              isAnnual={occasion.isAnnual}
              notes={occasion.notes}
              recipientName={occasion.recipient?.name}
              recipientRelationship={occasion.recipient?.relationship}
            />
          ))}
        </div>
      )}
    </div>
  );
}
