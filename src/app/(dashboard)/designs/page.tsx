import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/db/queries/users";
import { getOccasionsByUserId } from "@/lib/db/queries/occasions";
import { DesignPreview } from "./design-preview";

export default async function DesignsPage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateUser(
    user.id,
    user.emailAddresses[0]?.emailAddress ?? "",
    user.fullName ?? user.firstName
  );

  const occasions = await getOccasionsByUserId(dbUser.id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Design Preview
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose your favorite organic calendar design
        </p>
      </div>

      <DesignPreview occasions={occasions} />
    </div>
  );
}
