import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  decimal,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// ============================================================================
// USERS - synced from Clerk webhooks
// ============================================================================
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  reminderSettings: one(reminderSettings, {
    fields: [users.id],
    references: [reminderSettings.userId],
  }),
  recipients: many(recipients),
  occasions: many(occasions),
  giftIdeas: many(giftIdeas),
  sentReminders: many(sentReminders),
}));

// ============================================================================
// REMINDER_SETTINGS - one per user
// ============================================================================
export const reminderSettings = pgTable("reminder_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  daysBefore: integer("days_before").array().default([30, 14, 7, 0]).notNull(),
  emailEnabled: boolean("email_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reminderSettingsRelations = relations(
  reminderSettings,
  ({ one }) => ({
    user: one(users, {
      fields: [reminderSettings.userId],
      references: [users.id],
    }),
  })
);

// ============================================================================
// RECIPIENTS - people you buy gifts for
// ============================================================================
export const recipients = pgTable("recipients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  relationship: text("relationship"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const recipientsRelations = relations(recipients, ({ one, many }) => ({
  user: one(users, {
    fields: [recipients.userId],
    references: [users.id],
  }),
  occasions: many(occasions),
  giftIdeas: many(giftIdeas),
}));

// ============================================================================
// OCCASIONS - birthdays, holidays per recipient
// ============================================================================
export const occasions = pgTable("occasions", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => recipients.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  occasionType: text("occasion_type").notNull(),
  date: date("date").notNull(),
  isAnnual: boolean("is_annual").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const occasionsRelations = relations(occasions, ({ one, many }) => ({
  recipient: one(recipients, {
    fields: [occasions.recipientId],
    references: [recipients.id],
  }),
  user: one(users, {
    fields: [occasions.userId],
    references: [users.id],
  }),
  giftIdeas: many(giftIdeas),
  sentReminders: many(sentReminders),
}));

// ============================================================================
// GIFT_IDEAS - linked to recipients
// ============================================================================
export const giftIdeas = pgTable("gift_ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  recipientId: uuid("recipient_id")
    .references(() => recipients.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url"),
  originalUrl: text("original_url"),
  price: decimal("price", { precision: 10, scale: 2 }),
  asin: text("asin"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  isPurchased: boolean("is_purchased").default(false).notNull(),
  purchasedForOccasionId: uuid("purchased_for_occasion_id").references(
    () => occasions.id,
    { onDelete: "set null" }
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const giftIdeasRelations = relations(giftIdeas, ({ one, many }) => ({
  recipient: one(recipients, {
    fields: [giftIdeas.recipientId],
    references: [recipients.id],
  }),
  user: one(users, {
    fields: [giftIdeas.userId],
    references: [users.id],
  }),
  purchasedForOccasion: one(occasions, {
    fields: [giftIdeas.purchasedForOccasionId],
    references: [occasions.id],
  }),
  priceHistory: many(priceHistory),
}));

// ============================================================================
// PRICE_HISTORY - for future price tracking
// ============================================================================
export const priceHistory = pgTable("price_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  giftIdeaId: uuid("gift_idea_id")
    .references(() => giftIdeas.id, { onDelete: "cascade" })
    .notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  giftIdea: one(giftIdeas, {
    fields: [priceHistory.giftIdeaId],
    references: [giftIdeas.id],
  }),
}));

// ============================================================================
// SENT_REMINDERS - prevent duplicate emails
// ============================================================================
export const sentReminders = pgTable(
  "sent_reminders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    occasionId: uuid("occasion_id")
      .references(() => occasions.id, { onDelete: "cascade" })
      .notNull(),
    daysBefore: integer("days_before").notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => [unique("unique_occasion_days").on(table.occasionId, table.daysBefore)]
);

export const sentRemindersRelations = relations(sentReminders, ({ one }) => ({
  user: one(users, {
    fields: [sentReminders.userId],
    references: [users.id],
  }),
  occasion: one(occasions, {
    fields: [sentReminders.occasionId],
    references: [occasions.id],
  }),
}));
