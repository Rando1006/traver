import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const families = pgTable("families", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const itineraryItems = pgTable("itinerary_items", {
  id: serial("id").primaryKey(),
  familyId: integer("family_id")
    .notNull()
    .references(() => families.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  startTime: time("start_time", { withTimezone: false }),
  endTime: time("end_time", { withTimezone: false }),
  title: varchar("title", { length: 160 }).notNull(),
  location: varchar("location", { length: 180 }).notNull(),
  mapUrl: text("map_url"),
  description: text("description").notNull().default(""),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }),
  notes: text("notes").notNull().default(""),
  isFinal: boolean("is_final").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const familiesRelations = relations(families, ({ many }) => ({
  itineraryItems: many(itineraryItems),
}));

export const itineraryItemsRelations = relations(itineraryItems, ({ one }) => ({
  family: one(families, {
    fields: [itineraryItems.familyId],
    references: [families.id],
  }),
}));

export type Family = typeof families.$inferSelect;
export type ItineraryItem = typeof itineraryItems.$inferSelect;
export type NewItineraryItem = typeof itineraryItems.$inferInsert;
