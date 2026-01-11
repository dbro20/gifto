import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Recipient } from "@/types";

type RecipientWithBirthday = Recipient & { birthday: string | null };

interface RecipientListProps {
  recipients: RecipientWithBirthday[];
  isLoading?: boolean;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatBirthday(dateString: string): string {
  // Parse directly from string to avoid any timezone issues
  const [, month, day] = dateString.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  const dayNum = parseInt(day, 10);
  return `${MONTHS[monthIndex]} ${dayNum}`;
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

export function RecipientList({ recipients, isLoading }: RecipientListProps) {
  if (isLoading) {
    return <RecipientListSkeleton />;
  }

  if (recipients.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="rounded-lg border-2 overflow-hidden"
      style={{ borderColor: "#e8d5c4", background: "#fffcf7" }}
    >
      {recipients.map((recipient, index) => (
        <Link
          key={recipient.id}
          href={`/recipients/${recipient.id}`}
          className="flex items-center justify-between px-3 py-2 transition-all duration-200 hover:scale-[1.01]"
          style={{
            borderBottom: index < recipients.length - 1 ? "1px dashed #e8d5c4" : "none",
            color: "#6b5a45",
          }}
        >
          <span
            className="text-sm font-medium"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            {recipient.name}
          </span>
          <div className="flex items-center gap-3">
            {recipient.birthday && (
              <span
                className="text-xs"
                style={{ color: "#b5a088", fontFamily: "'Kalam', cursive" }}
              >
                {formatBirthday(recipient.birthday)}
              </span>
            )}
            <ChevronRight className="h-3 w-3" style={{ color: "#b5a088" }} />
          </div>
        </Link>
      ))}
    </div>
  );
}
