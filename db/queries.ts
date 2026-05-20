import { and, asc, eq } from "drizzle-orm";

import { getDb } from "./index";
import { families, itineraryItems, type NewItineraryItem } from "./schema";

export function listFamilies() {
  const db = getDb();
  return db.select().from(families).orderBy(asc(families.displayOrder), asc(families.id));
}

export function listFamilyItinerary(familyId: number) {
  const db = getDb();
  return db
    .select()
    .from(itineraryItems)
    .where(eq(itineraryItems.familyId, familyId))
    .orderBy(asc(itineraryItems.date), asc(itineraryItems.startTime), asc(itineraryItems.sortOrder), asc(itineraryItems.id));
}

export function listFinalItinerary() {
  const db = getDb();
  return db
    .select({
      id: itineraryItems.id,
      familyId: itineraryItems.familyId,
      familyName: families.name,
      date: itineraryItems.date,
      startTime: itineraryItems.startTime,
      endTime: itineraryItems.endTime,
      title: itineraryItems.title,
      location: itineraryItems.location,
      description: itineraryItems.description,
      estimatedCost: itineraryItems.estimatedCost,
      notes: itineraryItems.notes,
      isFinal: itineraryItems.isFinal,
      sortOrder: itineraryItems.sortOrder,
      createdAt: itineraryItems.createdAt,
      updatedAt: itineraryItems.updatedAt,
    })
    .from(itineraryItems)
    .innerJoin(families, eq(families.id, itineraryItems.familyId))
    .where(eq(itineraryItems.isFinal, true))
    .orderBy(asc(itineraryItems.date), asc(itineraryItems.startTime), asc(itineraryItems.sortOrder), asc(itineraryItems.id));
}

export async function createItineraryItem(values: NewItineraryItem) {
  const db = getDb();
  const [item] = await db.insert(itineraryItems).values(values).returning();
  return item;
}

export async function updateItineraryItem(id: number, values: Partial<NewItineraryItem>) {
  const db = getDb();
  const [item] = await db
    .update(itineraryItems)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(itineraryItems.id, id))
    .returning();

  return item;
}

export async function deleteItineraryItem(id: number) {
  const db = getDb();
  const [item] = await db.delete(itineraryItems).where(eq(itineraryItems.id, id)).returning();
  return item;
}

export async function familyExists(familyId: number) {
  const db = getDb();
  const rows = await db
    .select({ id: families.id })
    .from(families)
    .where(and(eq(families.id, familyId)))
    .limit(1);

  return rows.length > 0;
}
