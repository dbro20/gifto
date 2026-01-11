"use client";

/**
 * DESIGN B: Morning Dew
 *
 * - Soft gradient mesh backgrounds
 * - Lavender, seafoam, and soft pink palette
 * - Gentle wave patterns
 * - Floating/breathing animations
 * - Rounded, pill-shaped elements with glass morphism
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
  birthday: "✦",
  anniversary: "❋",
  christmas: "❄",
  valentines: "♡",
  "mother's day": "✿",
  "father's day": "☘",
  graduation: "✧",
  other: "○",
};

function getOccasionIcon(occasionType: string): string {
  const type = occasionType.toLowerCase();
  return OCCASION_ICONS[type] || OCCASION_ICONS.other;
}

interface CalendarMorningDewProps {
  occasions: Occasion[];
}

export function CalendarMorningDew({ occasions }: CalendarMorningDewProps) {
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
      {/* Animated gradient mesh background */}
      <div
        className="absolute inset-0 rounded-[32px] overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(196, 181, 219, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 80% 20%, rgba(181, 219, 208, 0.4) 0%, transparent 50%),
            radial-gradient(ellipse 70% 50% at 50% 90%, rgba(219, 195, 181, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, #faf9fc 0%, #f5f8f7 100%)
          `,
        }}
      >
        {/* Animated wave SVG */}
        <svg
          className="absolute bottom-0 left-0 w-full h-24 opacity-20"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="url(#waveGradient)"
          >
            <animate
              attributeName="d"
              dur="8s"
              repeatCount="indefinite"
              values="
                M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z;
                M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z;
                M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z
              "
            />
          </path>
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#c4b5db" />
              <stop offset="50%" stopColor="#b5dbd0" />
              <stop offset="100%" stopColor="#dbc3b5" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating orbs */}
      <div
        className="absolute top-8 right-12 w-20 h-20 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(196, 181, 219, 0.6) 0%, transparent 70%)",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-16 left-8 w-16 h-16 rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(181, 219, 208, 0.6) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      <div
        className="relative rounded-[32px] p-6 md:p-8"
        style={{
          background: "rgba(255, 255, 255, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 8px 40px rgba(148, 130, 168, 0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className="text-3xl md:text-4xl bg-gradient-to-r from-[#8b7ba3] via-[#7a9b91] to-[#a38b7b] bg-clip-text text-transparent"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 300,
                letterSpacing: "-0.03em",
              }}
            >
              {format(currentMonth, "MMMM")}
            </h2>
            <p
              className="text-[#9ca3af] text-sm mt-1"
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}
            >
              {format(currentMonth, "yyyy")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm rounded-full transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(196, 181, 219, 0.2)",
                color: "#8b7ba3",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
              }}
            >
              Today
            </button>
            <button
              onClick={prevMonth}
              className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center text-[#8b7ba3]"
              style={{ background: "rgba(196, 181, 219, 0.15)" }}
            >
              ‹
            </button>
            <button
              onClick={nextMonth}
              className="w-10 h-10 rounded-full transition-all duration-300 hover:scale-110 flex items-center justify-center text-[#8b7ba3]"
              style={{ background: "rgba(196, 181, 219, 0.15)" }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-4">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center py-2 text-xs tracking-widest"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
                color: "#b0aab8",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayOccasions = getOccasionsForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  relative min-h-[80px] p-2 rounded-2xl transition-all duration-500
                  ${isCurrentMonth ? "" : "opacity-30"}
                  ${dayOccasions.length > 0 ? "hover:scale-[1.02]" : ""}
                `}
                style={{
                  background: isCurrentDay
                    ? "linear-gradient(135deg, rgba(196, 181, 219, 0.25) 0%, rgba(181, 219, 208, 0.2) 100%)"
                    : isCurrentMonth && dayOccasions.length > 0
                      ? "rgba(255, 255, 255, 0.5)"
                      : "transparent",
                  boxShadow: isCurrentDay
                    ? "0 4px 20px rgba(148, 130, 168, 0.15), inset 0 0 0 1px rgba(196, 181, 219, 0.3)"
                    : "none",
                }}
              >
                <span
                  className={`
                    text-sm block mb-1 transition-all duration-300
                    ${isCurrentDay ? "text-[#7a6b8a] font-medium" : "text-[#9ca3af]"}
                  `}
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: isCurrentDay ? 500 : 300,
                  }}
                >
                  {format(day, "d")}
                </span>

                {/* Occasions with glass pills */}
                <div className="space-y-1">
                  {dayOccasions.slice(0, 2).map((occasion) => (
                    <Link
                      key={occasion.id}
                      href={`/recipients/${occasion.recipient?.id}`}
                      className="block group"
                    >
                      <div
                        className="flex items-center gap-1.5 px-2 py-1 text-xs transition-all duration-300 group-hover:translate-x-0.5"
                        style={{
                          background: "linear-gradient(135deg, rgba(196, 181, 219, 0.3) 0%, rgba(181, 219, 208, 0.25) 100%)",
                          backdropFilter: "blur(8px)",
                          borderRadius: "12px",
                          color: "#6b5f7a",
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: 400,
                        }}
                        title={`${occasion.recipient?.name}'s ${occasion.occasionType}`}
                      >
                        <span className="opacity-60">{getOccasionIcon(occasion.occasionType)}</span>
                        <span className="truncate">
                          {occasion.recipient?.name?.split(" ")[0]}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {dayOccasions.length > 2 && (
                    <div
                      className="text-xs px-2 text-[#b0aab8]"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      +{dayOccasions.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keyframes and fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
