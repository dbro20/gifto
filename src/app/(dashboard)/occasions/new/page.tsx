"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OccasionForm } from "@/components/occasions/occasion-form";
import type { OccasionFormInput } from "@/lib/validations/occasion";

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
};

export default function NewOccasionPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const response = await fetch("/api/recipients");
        if (response.ok) {
          const data = await response.json();
          setRecipients(data);
        }
      } catch (err) {
        console.error("Failed to fetch recipients:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  const handleSubmit = async (data: OccasionFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/occasions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create occasion");
      }

      router.push("/occasions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/occasions">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Occasions
        </Link>
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Add New Occasion</CardTitle>
          <CardDescription>
            Create a new occasion to track important dates for your recipients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {recipients.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                You need to add a recipient before creating an occasion.
              </p>
              <Button asChild>
                <Link href="/recipients/new">Add Recipient</Link>
              </Button>
            </div>
          ) : (
            <OccasionForm
              recipients={recipients}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
              submitLabel="Create Occasion"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
