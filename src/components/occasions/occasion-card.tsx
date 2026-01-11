"use client";

import Link from "next/link";
import { format, differenceInDays, parseISO } from "date-fns";
import { CalendarIcon, RepeatIcon, UserIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type OccasionCardProps = {
  id: string;
  occasionType: string;
  date: string;
  isAnnual: boolean;
  notes?: string | null;
  recipientName?: string;
  recipientRelationship?: string | null;
  daysUntil?: number | null;
  showRecipient?: boolean;
};

function calculateDaysUntil(dateStr: string, isAnnual: boolean): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const occasionDate = parseISO(dateStr);

  if (isAnnual) {
    // For annual occasions, calculate days until next occurrence
    const thisYearOccasion = new Date(
      today.getFullYear(),
      occasionDate.getMonth(),
      occasionDate.getDate()
    );

    if (thisYearOccasion < today) {
      // This year's has passed, calculate for next year
      const nextYearOccasion = new Date(
        today.getFullYear() + 1,
        occasionDate.getMonth(),
        occasionDate.getDate()
      );
      return differenceInDays(nextYearOccasion, today);
    }

    return differenceInDays(thisYearOccasion, today);
  }

  return differenceInDays(occasionDate, today);
}

function getDaysUntilLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days <= 7) return `${days} days`;
  if (days <= 30) return `${Math.ceil(days / 7)} weeks`;
  return `${Math.ceil(days / 30)} months`;
}

function getUrgencyColor(days: number): string {
  if (days <= 0) return "bg-destructive text-white";
  if (days <= 3) return "bg-red-500 text-white";
  if (days <= 7) return "bg-orange-500 text-white";
  if (days <= 14) return "bg-yellow-500 text-black";
  return "bg-muted text-muted-foreground";
}

export function OccasionCard({
  id,
  occasionType,
  date,
  isAnnual,
  notes,
  recipientName,
  recipientRelationship,
  daysUntil: providedDaysUntil,
  showRecipient = true,
}: OccasionCardProps) {
  const daysUntil =
    providedDaysUntil !== undefined && providedDaysUntil !== null
      ? providedDaysUntil
      : calculateDaysUntil(date, isAnnual);
  const daysLabel = getDaysUntilLabel(daysUntil);
  const urgencyColor = getUrgencyColor(daysUntil);

  const formattedDate = format(parseISO(date), "MMMM d, yyyy");
  const displayDate = isAnnual
    ? format(parseISO(date), "MMMM d")
    : formattedDate;

  return (
    <Link href={`/occasions/${id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{occasionType}</CardTitle>
              {showRecipient && recipientName && (
                <CardDescription className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3" />
                  {recipientName}
                  {recipientRelationship && ` (${recipientRelationship})`}
                </CardDescription>
              )}
            </div>
            <Badge className={cn("shrink-0", urgencyColor)}>{daysLabel}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              <span>{displayDate}</span>
            </div>
            {isAnnual && (
              <Badge variant="outline" className="gap-1">
                <RepeatIcon className="h-3 w-3" />
                Annual
              </Badge>
            )}
          </div>
          {notes && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {notes}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
