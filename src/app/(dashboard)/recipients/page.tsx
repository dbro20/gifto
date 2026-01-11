import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { RecipientList } from "@/components/recipients/recipient-list";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";

export default async function RecipientsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    // User not synced yet - this shouldn't happen in normal flow
    redirect("/");
  }

  const recipients = await getRecipientsByUserId(dbUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Recipients
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage the people you buy gifts for.
          </p>
        </div>
        <Button asChild>
          <Link href="/recipients/new">Add Recipient</Link>
        </Button>
      </div>

      <RecipientList recipients={recipients} />
    </div>
  );
}
