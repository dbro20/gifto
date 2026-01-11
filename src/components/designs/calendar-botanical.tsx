"use client";

/**
 * DESIGN A: Botanical Garden
 *
 * - Hand-drawn leaf illustrations as decorative elements
 * - Soft sage, blush, and cream palette
 * - Paper-like texture background
 * - Organic blob-shaped containers
 * - Handwritten-style typography mixed with refined body text
 */

import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
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
  christmas: "🌿",
  valentines: "💐",
  "mother's day": "🌸",
  "father's day": "🌱",
  graduation: "🎓",
  other: "🎁",
};

function getOccasionIcon(occasionType: string): string {
  const type = occasionType.toLowerCase();
  return OCCASION_ICONS[type] || OCCASION_ICONS.other;
}

// Hand-drawn leaf SVG decorations
function LeafDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 10 Q65 30 60 50 Q55 70 50 90 Q45 70 40 50 Q35 30 50 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M50 20 Q50 50 50 80"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M50 35 Q58 32 62 38"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M50 50 Q42 48 38 52"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function BranchDecoration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 25 Q50 20 100 25 Q150 30 190 25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="30" cy="22" r="4" fill="currentColor" fillOpacity="0.3" />
      <circle cx="70" cy="24" r="3" fill="currentColor" fillOpacity="0.4" />
      <circle cx="130" cy="26" r="5" fill="currentColor" fillOpacity="0.25" />
      <circle cx="170" cy="24" r="3" fill="currentColor" fillOpacity="0.35" />
    </svg>
  );
}

interface CalendarBotanicalProps {
  occasions: Occasion[];
}

export function CalendarBotanical({ occasions }: CalendarBotanicalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getOccasionsForDay = (day: Date) => {
    return occasions.filter((occasion) => {
      const occasionDate = new Date(occasion.date);
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
    <div className="relative">
      {/* Paper texture background */}
      <div
        className="absolute inset-0 rounded-3xl opacity-60"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(167, 139, 119, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 167, 119, 0.08) 0%, transparent 50%),
            linear-gradient(135deg, #faf8f5 0%, #f5f2ed 100%)
          `,
        }}
      />

      {/* Decorative leaves */}
      <LeafDecoration className="absolute -top-4 -left-4 w-16 h-16 text-[#8ba677] opacity-40 rotate-[-20deg]" />
      <LeafDecoration className="absolute -top-2 right-12 w-12 h-12 text-[#d4a5a5] opacity-30 rotate-[15deg]" />
      <LeafDecoration className="absolute -bottom-4 -right-4 w-14 h-14 text-[#8ba677] opacity-35 rotate-[160deg]" />

      <div
        className="relative rounded-3xl p-6 md:p-8"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(250,248,245,0.95) 100%)",
          boxShadow: "0 4px 30px rgba(139, 166, 119, 0.12), inset 0 1px 0 rgba(255,255,255,0.8)",
          border: "1px solid rgba(139, 166, 119, 0.15)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2
              className="text-3xl md:text-4xl text-[#5a6b4d]"
              style={{
                fontFamily: "'Caveat', cursive, system-ui",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <BranchDecoration className="w-20 h-6 text-[#8ba677] opacity-50 hidden sm:block" />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm rounded-full bg-[#f0ebe4] text-[#6b7c5e] hover:bg-[#e8e2d9] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-[#f0ebe4] text-[#6b7c5e] hover:bg-[#e8e2d9] transition-colors flex items-center justify-center"
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-full bg-[#f0ebe4] text-[#6b7c5e] hover:bg-[#e8e2d9] transition-colors flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center py-2 text-sm text-[#8b9980]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => {
            const dayOccasions = getOccasionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative min-h-[85px] p-2 transition-all duration-300
                  ${isCurrentMonth ? "" : "opacity-40"}
                `}
                style={{
                  background: isCurrentDay
                    ? "linear-gradient(135deg, rgba(212, 165, 165, 0.15) 0%, rgba(139, 166, 119, 0.1) 100%)"
                    : isCurrentMonth
                      ? "rgba(255, 255, 255, 0.5)"
                      : "transparent",
                  borderRadius: "16px",
                  border: isCurrentDay
                    ? "2px solid rgba(139, 166, 119, 0.4)"
                    : "1px solid rgba(139, 166, 119, 0.08)",
                }}
              >
                <span
                  className={`
                    text-sm block mb-1
                    ${isCurrentDay ? "text-[#5a6b4d] font-semibold" : "text-[#7a8b6d]"}
                  `}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {format(day, "d")}
                </span>

                {/* Occasions with organic pill shapes */}
                <div className="space-y-1">
                  {dayOccasions.slice(0, 2).map((occasion) => (
                    <Link
                      key={occasion.id}
                      href={`/recipients/${occasion.recipient?.id}`}
                      className="block group"
                    >
                      <div
                        className="flex items-center gap-1 px-2 py-1 text-xs transition-all duration-200 group-hover:scale-[1.02]"
                        style={{
                          background: "linear-gradient(135deg, rgba(212, 165, 165, 0.25) 0%, rgba(212, 165, 165, 0.15) 100%)",
                          borderRadius: "20px",
                          color: "#6b5a5a",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                        title={`${occasion.recipient?.name}'s ${occasion.occasionType}`}
                      >
                        <span className="text-sm">{getOccasionIcon(occasion.occasionType)}</span>
                        <span className="truncate font-medium">
                          {occasion.recipient?.name?.split(" ")[0]}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {dayOccasions.length > 2 && (
                    <div
                      className="text-xs px-2 text-[#8b9980]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      +{dayOccasions.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom decorative element */}
        <div className="mt-6 flex justify-center">
          <BranchDecoration className="w-32 h-8 text-[#8ba677] opacity-30" />
        </div>
      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}
