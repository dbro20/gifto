import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GiftForm } from "@/components/gifts/gift-form";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";

type PageProps = {
  searchParams: Promise<{ recipientId?: string }>;
};

export default async function NewGiftPage({ searchParams }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  const recipients = await getRecipientsByUserId(dbUser.id);

  if (recipients.length === 0) {
    redirect("/recipients/new?message=add-recipient-first");
  }

  const params = await searchParams;
  const defaultRecipientId = params.recipientId;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Gift Idea</CardTitle>
          <CardDescription>
            Save a gift idea for one or more people.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GiftForm
            recipients={recipients}
            defaultRecipientId={defaultRecipientId}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  );
}
