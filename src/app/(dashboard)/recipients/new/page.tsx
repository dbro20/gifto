import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { RecipientForm } from "@/components/recipients/recipient-form";

export default async function NewRecipientPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b-2 border-dashed border-[#e8d5c4]">
        <h1
          className="text-2xl font-bold tracking-tight md:text-3xl"
          style={{ color: "#8b7355", fontFamily: "'Kalam', cursive" }}
        >
          Add Someone Special
        </h1>
        <p className="mt-1" style={{ color: "#b5a088" }}>
          Add a friend or family member to track their special dates.
        </p>
      </div>

      <div className="max-w-2xl">
        <RecipientForm mode="create" />
      </div>
    </div>
  );
}
