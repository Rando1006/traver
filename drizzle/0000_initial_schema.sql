CREATE TABLE IF NOT EXISTS "families" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(80) NOT NULL,
  "display_order" integer DEFAULT 0 NOT NULL
);

CREATE TABLE IF NOT EXISTS "itinerary_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "family_id" integer NOT NULL,
  "date" date NOT NULL,
  "start_time" time,
  "end_time" time,
  "title" varchar(160) NOT NULL,
  "location" varchar(180) NOT NULL,
  "map_url" text,
  "description" text DEFAULT '' NOT NULL,
  "estimated_cost" numeric(10, 2),
  "notes" text DEFAULT '' NOT NULL,
  "is_final" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "itinerary_items" ADD CONSTRAINT "itinerary_items_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

INSERT INTO "families" ("id", "name", "display_order")
VALUES
  (1, '樂沐家', 1),
  (2, '小葵家', 2),
  (3, '瓜峰家', 3)
ON CONFLICT ("id") DO UPDATE
SET "name" = EXCLUDED."name",
    "display_order" = EXCLUDED."display_order";

SELECT setval(pg_get_serial_sequence('"families"', 'id'), COALESCE((SELECT MAX("id") FROM "families"), 1), true);
