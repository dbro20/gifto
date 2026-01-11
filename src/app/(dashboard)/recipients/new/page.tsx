import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecipientForm } from "@/components/recipients/recipient-form";
import { getUserByClerkId } from "@/lib/db/queries/users";

export default async function NewRecipientPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Add Recipient
        </h1>
        <p className="text-muted-foreground mt-1">
          Add someone you want to track gifts for.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Recipient Details</CardTitle>
          <CardDescription>
            Enter information about this person. You can add occasions and gift
            ideas later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
