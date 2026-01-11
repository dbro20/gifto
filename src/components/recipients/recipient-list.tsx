"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ArrowUpDown } from "lucide-react";
import type { Recipient } from "@/types";

type RecipientWithBirthday = Recipient & { birthday: string | null };

interface RecipientListProps {
  recipients: RecipientWithBirthday[];
  isLoading?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatBirthday(dateString: string): string {
  const [, month, day] = dateString.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  return `${MONTHS[monthIndex]} ${dayNum}`;
}

function getBirthdaySortValue(dateString: string | null): number {
  if (!dateString) return 9999;
  const [, month, day] = dateString.split("-");
  return parseInt(month, 10) * 100 + parseInt(day, 10);
}

function RecipientListSkeleton() {
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
          <div className="h-4 w-40 rounded" style={{ background: "#f5ebe0" }} />
          <div className="h-3 w-3 rounded" style={{ background: "#f5ebe0" }} />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
      style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "#f5ebe0" }}
      >
        <span className="text-2xl">👥</span>
      </div>
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
      >
        No recipients yet
      </h3>
      <p className="mt-2 text-sm max-w-sm" style={{ color: "#b5a088" }}>
        Get started by adding the people you want to track gifts for. You can
        add their birthdays, holidays, and gift ideas.
      </p>
    </div>
  );
}

type SortField = "name" | "birthday";
type SortDirection = "asc" | "desc";

export function RecipientList({ recipients, isLoading }: RecipientListProps) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedRecipients = useMemo(() => {
    return [...recipients].sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "birthday") {
        comparison = getBirthdaySortValue(a.birthday) - getBirthdaySortValue(b.birthday);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [recipients, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return <RecipientListSkeleton />;
  }

  if (recipients.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex justify-center">
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #fffcf7 0%, #faf6f1 100%)",
          border: "2px solid #e8d5c4",
          boxShadow: "3px 3px 0 #e8d5c4, 6px 6px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center px-4 py-2"
          style={{ background: "#f5ebe0", borderBottom: "2px solid #e8d5c4" }}
        >
          <button
            onClick={() => handleSort("name")}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[#6b5a45] w-40"
            style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
          >
            Name
            <ArrowUpDown className={`h-3 w-3 ${sortField === "name" ? "opacity-100" : "opacity-40"}`} />
          </button>
          <button
            onClick={() => handleSort("birthday")}
            className="flex items-center gap-1 text-xs font-medium transition-colors hover:text-[#6b5a45] w-24"
            style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
          >
            Birthday
            <ArrowUpDown className={`h-3 w-3 ${sortField === "birthday" ? "opacity-100" : "opacity-40"}`} />
          </button>
          <div className="w-4" />
        </div>

        {/* Rows */}
        {sortedRecipients.map((recipient, index) => (
          <Link
            key={recipient.id}
            href={`/recipients/${recipient.id}`}
            className="flex items-center px-4 py-2 transition-all duration-200 hover:bg-[#fef8f0] group"
            style={{
              borderBottom: index < sortedRecipients.length - 1 ? "1px dashed #e8d5c4" : "none",
            }}
          >
            <span
              className="text-sm font-medium w-40 truncate"
              style={{ color: "#6b5a45", fontFamily: "'Kalam', cursive" }}
            >
              {recipient.name}
            </span>
            <span
              className="text-sm w-24"
              style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
            >
              {recipient.birthday ? formatBirthday(recipient.birthday) : "—"}
            </span>
            <ChevronRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              style={{ color: "#b5a088" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
