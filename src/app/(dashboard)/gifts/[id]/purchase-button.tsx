"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Occasion {
  id: string;
  occasionType: string;
  date: string;
  recipient?: {
    id: string;
    name: string;
    relationship: string | null;
  } | null;
}

interface PurchaseButtonProps {
  giftId: string;
  isPurchased: boolean;
  occasions: Occasion[];
}

export function PurchaseButton({
  giftId,
  isPurchased,
  occasions,
}: PurchaseButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOccasionId, setSelectedOccasionId] = useState<string | null>(null);

  async function handleMarkAsPurchased() {
    setIsUpdating(true);

    try {
      const body = selectedOccasionId ? { occasionId: selectedOccasionId } : {};
      const response = await fetch(`/api/gift-ideas/${giftId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as purchased");
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error marking as purchased:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleMarkAsUnpurchased() {
    setIsUpdating(true);

    try {
      const response = await fetch(`/api/gift-ideas/${giftId}/purchase`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to mark as unpurchased");
      }

      router.refresh();
    } catch (error) {
      console.error("Error marking as unpurchased:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isPurchased) {
    return (
      <Button
        variant="outline"
        onClick={handleMarkAsUnpurchased}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? "Updating..." : "Mark as Unpurchased"}
      </Button>
    );
  }

  // If there are no occasions, just mark as purchased directly
  if (occasions.length === 0) {
    return (
      <Button
        onClick={handleMarkAsPurchased}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? "Updating..." : "Mark as Purchased"}
      </Button>
    );
  }

  // Show dialog to optionally select an occasion
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Mark as Purchased</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Purchased</DialogTitle>
          <DialogDescription>
            Optionally select which occasion this gift was purchased for.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="occasion">Occasion (optional)</Label>
            <Select
              value={selectedOccasionId ?? "none"}
              onValueChange={(value) =>
                setSelectedOccasionId(value === "none" ? null : value)
              }
            >
              <SelectTrigger id="occasion">
                <SelectValue placeholder="Select an occasion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific occasion</SelectItem>
                {occasions.map((occasion) => (
                  <SelectItem key={occasion.id} value={occasion.id}>
                    {occasion.occasionType} ({occasion.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button onClick={handleMarkAsPurchased} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Mark as Purchased"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
