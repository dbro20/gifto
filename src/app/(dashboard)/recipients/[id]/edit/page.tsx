import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipientForm } from "@/components/recipients/recipient-form";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientById } from "@/lib/db/queries/recipients";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipientPage({ params }: PageProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Edit Recipient
        </h1>
        <p className="text-muted-foreground mt-1">
          Update information for {recipient.name}.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
          <CardDescription>
            Make changes to this recipient&apos;s information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientForm mode="edit" recipient={recipient} />
        </CardContent>
      </Card>
    </div>
  );
}
