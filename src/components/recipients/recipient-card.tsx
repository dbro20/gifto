import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { RELATIONSHIP_OPTIONS } from "@/lib/validations/recipient";
import type { Recipient } from "@/types";

interface RecipientCardProps {
  recipient: Recipient;
  occasionCount?: number;
  giftIdeaCount?: number;
}

/**
 * Get initials from a name (up to 2 characters)
 */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Get a human-readable label for a relationship value
 */
function getRelationshipLabel(relationship: string | null): string | null {
  if (!relationship) return null;

  const option = RELATIONSHIP_OPTIONS.find((opt) => opt.value === relationship);
  return option ? option.label : relationship;
}

export function RecipientCard({
  recipient,
  occasionCount,
  giftIdeaCount,
}: RecipientCardProps) {
  const initials = getInitials(recipient.name);
  const relationshipLabel = getRelationshipLabel(recipient.relationship);

  return (
    <Link href={`/recipients/${recipient.id}`}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{recipient.name}</h3>
              {relationshipLabel && (
                <Badge variant="secondary" className="mt-1">
                  {relationshipLabel}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {(occasionCount !== undefined || giftIdeaCount !== undefined) && (
          <CardContent className="pt-0">
            <div className="flex gap-4 text-sm text-muted-foreground">
              {occasionCount !== undefined && (
                <span>
                  {occasionCount} occasion{occasionCount !== 1 ? "s" : ""}
                </span>
              )}
              {giftIdeaCount !== undefined && (
                <span>
                  {giftIdeaCount} gift idea{giftIdeaCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
