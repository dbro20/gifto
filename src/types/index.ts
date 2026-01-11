import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import {
  users,
  reminderSettings,
  recipients,
  occasions,
  giftIdeas,
  priceHistory,
  sentReminders,
} from "@/lib/db/schema";

// ============================================================================
// User types
// ============================================================================
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// ============================================================================
// Reminder Settings types
// ============================================================================
export type ReminderSettings = InferSelectModel<typeof reminderSettings>;
export type NewReminderSettings = InferInsertModel<typeof reminderSettings>;

// ============================================================================
// Recipient types
// ============================================================================
export type Recipient = InferSelectModel<typeof recipients>;
export type NewRecipient = InferInsertModel<typeof recipients>;

// ============================================================================
// Occasion types
// ============================================================================
export type Occasion = InferSelectModel<typeof occasions>;
export type NewOccasion = InferInsertModel<typeof occasions>;

// ============================================================================
// Gift Idea types
// ============================================================================
export type GiftIdea = InferSelectModel<typeof giftIdeas>;
export type NewGiftIdea = InferInsertModel<typeof giftIdeas>;

// ============================================================================
// Price History types
// ============================================================================
export type PriceHistory = InferSelectModel<typeof priceHistory>;
export type NewPriceHistory = InferInsertModel<typeof priceHistory>;

// ============================================================================
// Sent Reminder types
// ============================================================================
export type SentReminder = InferSelectModel<typeof sentReminders>;
export type NewSentReminder = InferInsertModel<typeof sentReminders>;

// ============================================================================
// Extended types with relations (for use with Drizzle queries)
// ============================================================================
export type UserWithRelations = User & {
  reminderSettings?: ReminderSettings | null;
  recipients?: Recipient[];
  occasions?: Occasion[];
  giftIdeas?: GiftIdea[];
  sentReminders?: SentReminder[];
};

export type RecipientWithRelations = Recipient & {
  user?: User;
  occasions?: Occasion[];
  giftIdeas?: GiftIdea[];
};

export type OccasionWithRelations = Occasion & {
  recipient?: Recipient;
  user?: User;
  giftIdeas?: GiftIdea[];
  sentReminders?: SentReminder[];
};

export type GiftIdeaWithRelations = GiftIdea & {
  recipient?: Recipient;
  user?: User;
  purchasedForOccasion?: Occasion | null;
  priceHistory?: PriceHistory[];
};

export type PriceHistoryWithRelations = PriceHistory & {
  giftIdea?: GiftIdea;
};

export type SentReminderWithRelations = SentReminder & {
  user?: User;
  occasion?: Occasion;
};
