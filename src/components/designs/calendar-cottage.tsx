"use client";

/**
 * DESIGN C: Cottage Core
 *
 * - Warm cream and honey tones
 * - Sketch-like decorative elements
 * - Washi tape / scrapbook aesthetic
 * - Subtle paper grain texture
 * - Playful, imperfect hand-drawn borders
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
  anniversary: "💛",
  christmas: "🎄",
  valentines: "💕",
  "mother's day": "🌼",
  "father's day": "🌻",
  graduation: "📜",
  other: "🎁",
};

function getOccasionIcon(occasionType: string): string {
  const type = occasionType.toLowerCase();
  return OCCASION_ICONS[type] || OCCASION_ICONS.other;
}

// Washi tape decoration
function WashiTape({ color, rotation, className }: { color: string; rotation: number; className?: string }) {
  return (
    <div
      className={`absolute ${className}`}
      style={{
        width: "60px",
        height: "20px",
        background: color,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.7,
        borderRadius: "2px",
        boxShadow: "1px 1px 3px rgba(0,0,0,0.1)",
      }}
    />
  );
}

// Hand-drawn corner decoration
function CornerDoodle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 55 Q5 30 15 20 Q25 10 55 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 4"
        fill="none"
      />
      <circle cx="10" cy="50" r="3" fill="currentColor" fillOpacity="0.5" />
      <circle cx="50" cy="10" r="3" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

interface CalendarCottageProps {
  occasions: Occasion[];
}

export function CalendarCottage({ occasions }: CalendarCottageProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getOccasionsForDay = (day: Date) => {
    return occasions.filter((occasion) => {
      // Parse date string directly to avoid timezone issues
      const [, month, dayOfMonth] = occasion.date.split("-").map(Number);
      return (
        month - 1 === day.getMonth() &&
        dayOfMonth === day.getDate()
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
        className="absolute inset-0 rounded-lg"
        style={{
          background: "#faf6f1",
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")
          `,
          backgroundBlendMode: "soft-light",
          opacity: 0.5,
        }}
      />

      {/* Washi tape decorations */}
      <WashiTape color="rgba(232, 196, 164, 0.8)" rotation={-5} className="-top-2 left-8" />
      <WashiTape color="rgba(196, 213, 191, 0.8)" rotation={8} className="-top-2 right-12" />
      <WashiTape color="rgba(213, 191, 196, 0.8)" rotation={-3} className="-bottom-2 left-1/3" />

      {/* Corner doodles */}
      <CornerDoodle className="absolute top-2 left-2 w-10 h-10 text-[#c4a67a] opacity-40" />
      <CornerDoodle className="absolute bottom-2 right-2 w-10 h-10 text-[#c4a67a] opacity-40 rotate-180" />

      <div
        className="relative rounded-lg p-5 md:p-7"
        style={{
          background: "linear-gradient(145deg, #fffcf7 0%, #faf6f1 100%)",
          border: "3px solid #e8d5c4",
          boxShadow: "4px 4px 0 #e8d5c4, 8px 8px 20px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header with hand-written style */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-[#e8d5c4]">
          <div>
            <h2
              className="text-3xl md:text-4xl text-[#8b7355]"
              style={{
                fontFamily: "'Kalam', cursive",
                fontWeight: 700,
              }}
            >
              {format(currentMonth, "MMMM")}
            </h2>
            <p
              className="text-[#b5a088] text-lg"
              style={{ fontFamily: "'Kalam', cursive" }}
            >
              {format(currentMonth, "yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm rounded transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "#f5ebe0",
                color: "#8b7355",
                fontFamily: "'Kalam', cursive",
                fontWeight: 400,
                border: "2px solid #e8d5c4",
              }}
            >
              today!
            </button>
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded flex items-center justify-center text-[#8b7355] transition-transform hover:scale-110 active:scale-95"
              style={{
                background: "#f5ebe0",
                border: "2px solid #e8d5c4",
                fontFamily: "'Kalam', cursive",
                fontSize: "20px",
              }}
            >
              ←
            </button>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded flex items-center justify-center text-[#8b7355] transition-transform hover:scale-110 active:scale-95"
              style={{
                background: "#f5ebe0",
                border: "2px solid #e8d5c4",
                fontFamily: "'Kalam', cursive",
                fontSize: "20px",
              }}
            >
              →
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-3">
          {["sun", "mon", "tue", "wed", "thu", "fri", "sat"].map((day) => (
            <div
              key={day}
              className="text-center py-2 text-sm text-[#b5a088]"
              style={{ fontFamily: "'Kalam', cursive" }}
            >
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
                  relative min-h-[80px] p-1.5 transition-all duration-200
                  ${isCurrentMonth ? "" : "opacity-35"}
                  ${dayOccasions.length > 0 ? "hover:bg-[#faf3e8]" : ""}
                `}
                style={{
                  background: isCurrentDay
                    ? "#fef3e2"
                    : "transparent",
                  border: isCurrentDay
                    ? "2px dashed #d4a574"
                    : "1px solid transparent",
                  borderRadius: "4px",
                }}
              >
                <span
                  className={`
                    text-sm block
                    ${isCurrentDay ? "text-[#8b6914] font-bold" : "text-[#a08b70]"}
                  `}
                  style={{ fontFamily: "'Kalam', cursive" }}
                >
                  {format(day, "d")}
                </span>

                {/* Occasions with sticky note style */}
                <div className="mt-1 space-y-1">
                  {dayOccasions.slice(0, 2).map((occasion, idx) => {
                    const colors = [
                      { bg: "#fff5e6", border: "#f5d5a8" },
                      { bg: "#f0f5e8", border: "#c5d5a8" },
                      { bg: "#f5e8f0", border: "#d5a8c5" },
                    ];
                    const color = colors[idx % colors.length];

                    return (
                      <Link
                        key={occasion.id}
                        href={`/recipients/${occasion.recipient?.id}`}
                        className="block group"
                      >
                        <div
                          className="flex items-center gap-1 px-1.5 py-0.5 text-xs transition-all duration-200 group-hover:rotate-1 group-hover:scale-105"
                          style={{
                            background: color.bg,
                            border: `1px solid ${color.border}`,
                            borderRadius: "2px",
                            color: "#6b5a45",
                            fontFamily: "'Kalam', cursive",
                            boxShadow: "1px 1px 2px rgba(0,0,0,0.05)",
                            transform: `rotate(${idx % 2 === 0 ? -1 : 1}deg)`,
                          }}
                          title={`${occasion.recipient?.name}'s ${occasion.occasionType}`}
                        >
                          <span>{getOccasionIcon(occasion.occasionType)}</span>
                          <span className="truncate">
                            {occasion.recipient?.name}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                  {dayOccasions.length > 2 && (
                    <div
                      className="text-xs text-[#b5a088] px-1"
                      style={{ fontFamily: "'Kalam', cursive" }}
                    >
                      +{dayOccasions.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');
      `}</style>
    </div>
  );
}
