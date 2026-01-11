import { notFound, redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GiftForm } from "@/components/gifts/gift-form";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { getGiftIdeaById } from "@/lib/db/queries/gift-ideas";
import { getRecipientsByUserId } from "@/lib/db/queries/recipients";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditGiftPage({ params }: PageProps) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await getUserByClerkId(user.id);

  if (!dbUser) {
    redirect("/");
  }

  const { id } = await params;
  const [giftIdea, recipients] = await Promise.all([
    getGiftIdeaById(id, dbUser.id),
    getRecipientsByUserId(dbUser.id),
  ]);

  if (!giftIdea) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Gift Idea</CardTitle>
          <CardDescription>
            Update the details for this gift idea.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GiftForm
            giftIdea={giftIdea}
            recipients={recipients}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
