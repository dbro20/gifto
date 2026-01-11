import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecipientList } from "@/components/recipients/recipient-list";
import { getOrCreateUser } from "@/lib/db/queries/users";
import { getRecipientsWithBirthday } from "@/lib/db/queries/recipients";

export default async function RecipientsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.fullName ?? user.firstName
  );

  const recipients = await getRecipientsWithBirthday(dbUser.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-dashed border-[#e8d5c4]">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight md:text-3xl"
            style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
          >
            Friends & Fam
          </h1>
          <p className="mt-1" style={{ color: "#b5a088" }}>
            The people you love to give gifts to.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="border-2 transition-all duration-200 hover:scale-105"
            style={{
              borderColor: "#e8d5c4",
              background: "#f5ebe0",
              color: "#8b7355",
              fontFamily: "'Kalam', cursive",
            }}
          >
            <Link href="/recipients/import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Link>
          </Button>
          <Button
            asChild
            className="transition-all duration-200 hover:scale-105"
            style={{
              background: "#8b7355",
              color: "#fffcf7",
              fontFamily: "'Kalam', cursive",
            }}
          >
            <Link href="/recipients/new">Add Person</Link>
          </Button>
        </div>
      </div>

      <RecipientList recipients={recipients} />
    </div>
  );
}
