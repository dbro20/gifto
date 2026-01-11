"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarPlusIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OccasionCard } from "./occasion-card";

type UpcomingOccasion = {
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
  daysUntil: number | null;
};

type UpcomingOccasionsProps = {
  days?: number;
  limit?: number;
  showTitle?: boolean;
  showAddButton?: boolean;
};

export function UpcomingOccasions({
  days = 30,
  limit,
  showTitle = true,
  showAddButton = true,
}: UpcomingOccasionsProps) {
  const [occasions, setOccasions] = useState<UpcomingOccasion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/occasions/upcoming?days=${days}`);

        if (!response.ok) {
          throw new Error("Failed to fetch upcoming occasions");
        }

        const data = await response.json();
        setOccasions(limit ? data.slice(0, limit) : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOccasions();
  }, [days, limit]);

  if (isLoading) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Upcoming Occasions</CardTitle>
            <CardDescription>
              Loading occasions for the next {days} days...
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className="flex items-center justify-center py-8">
          <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle>Upcoming Occasions</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-sm text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Occasions</CardTitle>
            <CardDescription>
              {occasions.length > 0
                ? `${occasions.length} occasion${
                    occasions.length === 1 ? "" : "s"
                  } in the next ${days} days`
                : `No occasions in the next ${days} days`}
            </CardDescription>
          </div>
          {showAddButton && (
            <Button asChild size="sm">
              <Link href="/occasions/new">
                <CalendarPlusIcon className="h-4 w-4 mr-2" />
                Add
              </Link>
            </Button>
          )}
        </CardHeader>
      )}
      <CardContent className={showTitle ? "" : "pt-6"}>
        {occasions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              No upcoming occasions found. Add one to get started!
            </p>
            {showAddButton && (
              <Button asChild variant="outline">
                <Link href="/occasions/new">
                  <CalendarPlusIcon className="h-4 w-4 mr-2" />
                  Add Occasion
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
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
                daysUntil={occasion.daysUntil}
              />
            ))}
            {limit && occasions.length >= limit && (
              <div className="text-center pt-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/occasions">View all occasions</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
