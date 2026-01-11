"use client";

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Occasion = {
  id: string;
  occasionType: string;
  date: string;
  recipient: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
};

const OCCASION_ICONS: Record<string, string> = {
  birthday: "🎂",
  anniversary: "💍",
  christmas: "🎄",
  valentines: "💝",
  "mother's day": "💐",
  "father's day": "👔",
  graduation: "🎓",
  wedding: "💒",
  baby_shower: "👶",
  housewarming: "🏠",
  holiday: "🎉",
  other: "🎁",
};

function getOccasionIcon(occasionType: string): string {
  const type = occasionType.toLowerCase();
  return OCCASION_ICONS[type] || OCCASION_ICONS.other;
}

interface OccasionsCalendarProps {
  occasions: Occasion[];
}

export function OccasionsCalendar({ occasions }: OccasionsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getOccasionsForDay = (day: Date) => {
    return occasions.filter((occasion) => {
      const occasionDate = new Date(occasion.date);
      // For annual occasions, check month and day only
      return (
        occasionDate.getMonth() === day.getMonth() &&
        occasionDate.getDate() === day.getDate()
      );
    });
  };

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {format(currentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayOccasions = getOccasionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative min-h-[80px] rounded-lg border p-1 transition-colors
                  ${isCurrentMonth ? "bg-background" : "bg-muted/30 text-muted-foreground"}
                  ${isCurrentDay ? "border-primary border-2" : "border-border"}
                  ${dayOccasions.length > 0 ? "hover:bg-accent cursor-pointer" : ""}
                `}
              >
                <span
                  className={`
                    text-sm font-medium
                    ${isCurrentDay ? "text-primary" : ""}
                  `}
                >
                  {format(day, "d")}
                </span>

                {/* Occasions */}
                <div className="mt-1 space-y-1">
                  {dayOccasions.slice(0, 2).map((occasion) => (
                    <Link
                      key={occasion.id}
                      href={`/recipients/${occasion.recipient?.id}`}
                      className="block"
                    >
                      <div
                        className="flex items-center gap-1 rounded bg-primary/10 px-1 py-0.5 text-xs hover:bg-primary/20 transition-colors"
                        title={`${occasion.recipient?.name}'s ${occasion.occasionType}`}
                      >
                        <span>{getOccasionIcon(occasion.occasionType)}</span>
                        <span className="truncate">
                          {occasion.recipient?.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {dayOccasions.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dayOccasions.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}
