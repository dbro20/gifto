import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientById } from "@/lib/db/queries/recipients";
import { RELATIONSHIP_OPTIONS } from "@/lib/validations/recipient";
import { DeleteRecipientButton } from "./delete-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getRelationshipLabel(relationship: string | null): string | null {
  if (!relationship) return null;
  const option = RELATIONSHIP_OPTIONS.find((opt) => opt.value === relationship);
  return option ? option.label : relationship;
}

export default async function RecipientDetailPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  const { id } = await params;
  const recipient = await getRecipientById(id, dbUser.id);

  if (!recipient) {
    notFound();
  }

  const initials = getInitials(recipient.name);
  const relationshipLabel = getRelationshipLabel(recipient.relationship);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {recipient.name}
            </h1>
            {relationshipLabel && (
              <Badge variant="secondary" className="mt-1">
                {relationshipLabel}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/recipients/${recipient.id}/edit`}>Edit</Link>
          </Button>
          <DeleteRecipientButton recipientId={recipient.id} />
        </div>
      </div>

      {/* Notes Section */}
      {recipient.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {recipient.notes}
            </p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Placeholder for Occasions */}
      <Card>
        <CardHeader>
          <CardTitle>Occasions</CardTitle>
          <CardDescription>
            Birthdays, holidays, and other special dates for {recipient.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No occasions added yet. This feature is coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for Gift Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Gift Ideas</CardTitle>
          <CardDescription>
            Gift ideas you have saved for {recipient.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No gift ideas added yet. This feature is coming soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
