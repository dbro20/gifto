"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  EditIcon,
  Loader2Icon,
  RepeatIcon,
  TrashIcon,
  UserIcon,
  GiftIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { OccasionForm } from "@/components/occasions/occasion-form";
import type { OccasionFormInput } from "@/lib/validations/occasion";

type Recipient = {
  id: string;
  name: string;
  relationship: string | null;
};

type Occasion = {
  id: string;
  recipientId: string;
  userId: string;
  occasionType: string;
  date: string;
  isAnnual: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  recipient: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
};

export default function OccasionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch occasion and recipients in parallel
        const [occasionResponse, recipientsResponse] = await Promise.all([
          fetch(`/api/occasions/${id}`),
          fetch("/api/recipients"),
        ]);

        if (!occasionResponse.ok) {
          if (occasionResponse.status === 404) {
            throw new Error("Occasion not found");
          }
          throw new Error("Failed to fetch occasion");
        }

        const occasionData = await occasionResponse.json();
        setOccasion(occasionData);

        if (recipientsResponse.ok) {
          const recipientsData = await recipientsResponse.json();
          setRecipients(recipientsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (data: OccasionFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/occasions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update occasion");
      }

      const updatedOccasion = await response.json();

      // Refetch to get updated recipient info
      const refreshResponse = await fetch(`/api/occasions/${id}`);
      if (refreshResponse.ok) {
        setOccasion(await refreshResponse.json());
      } else {
        setOccasion(updatedOccasion);
      }

      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/occasions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete occasion");
      }

      router.push("/occasions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !occasion) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link href="/occasions">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Occasions
          </Link>
        </Button>

        <Card className="max-w-2xl">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button asChild variant="outline">
                <Link href="/occasions">Go to Occasions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!occasion) return null;

  const formattedDate = format(parseISO(occasion.date), "MMMM d, yyyy");

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/occasions">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Occasions
        </Link>
      </Button>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {occasion.occasionType}
                </CardTitle>
                {occasion.recipient && (
                  <CardDescription className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <Link
                      href={`/recipients/${occasion.recipient.id}`}
                      className="hover:underline"
                    >
                      {occasion.recipient.name}
                      {occasion.recipient.relationship &&
                        ` (${occasion.recipient.relationship})`}
                    </Link>
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
                <Dialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Occasion</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this occasion? This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <OccasionForm
                  recipients={recipients}
                  defaultValues={{
                    recipientId: occasion.recipientId,
                    occasionType: occasion.occasionType,
                    date: occasion.date,
                    isAnnual: occasion.isAnnual,
                    notes: occasion.notes,
                  }}
                  onSubmit={handleUpdate}
                  onCancel={() => setIsEditing(false)}
                  isSubmitting={isSubmitting}
                  submitLabel="Update Occasion"
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{formattedDate}</span>
                    </div>
                    {occasion.isAnnual && (
                      <Badge variant="outline" className="gap-1">
                        <RepeatIcon className="h-3 w-3" />
                        Annual
                      </Badge>
                    )}
                  </div>

                  {occasion.notes && (
                    <div>
                      <h3 className="text-sm font-medium mb-1">Notes</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {occasion.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gift Ideas Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GiftIcon className="h-5 w-5" />
                Gift Ideas
              </CardTitle>
              <CardDescription>
                Gift ideas linked to this occasion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No gift ideas linked to this occasion yet.
              </p>
              <Button variant="outline" size="sm" className="mt-3" disabled>
                Link Gift Idea
              </Button>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {format(parseISO(occasion.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated</span>
                <span>
                  {format(parseISO(occasion.updatedAt), "MMM d, yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
