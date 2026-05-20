import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const blankToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

export const itineraryCreateSchema = z.object({
  familyId: z.coerce.number().int().positive(),
  date: z.string().regex(datePattern, "請選擇日期"),
  startTime: z.preprocess(blankToNull, z.string().regex(timePattern, "請填寫正確的開始時間").nullable().optional()),
  endTime: z.preprocess(blankToNull, z.string().regex(timePattern, "請填寫正確的結束時間").nullable().optional()),
  title: z.string().trim().min(1, "請填寫活動名稱").max(160, "活動名稱不可超過 160 字"),
  location: z.string().trim().min(1, "請填寫地點").max(180, "地點不可超過 180 字"),
  mapUrl: z.preprocess(blankToNull, z.string().url("請填寫有效的 Google Map 連結").nullable().optional()),
  description: z.string().trim().max(3000, "活動說明不可超過 3000 字").default(""),
  estimatedCost: z.preprocess(
    blankToNull,
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "預估費用最多只能有兩位小數")
      .nullable()
      .optional(),
  ),
  notes: z.string().trim().max(3000, "備註不可超過 3000 字").default(""),
  isFinal: z.boolean().optional().default(false),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const itineraryPatchSchema = itineraryCreateSchema.partial().extend({
  familyId: z.coerce.number().int().positive().optional(),
});

export type ItineraryCreateInput = z.infer<typeof itineraryCreateSchema>;
export type ItineraryPatchInput = z.infer<typeof itineraryPatchSchema>;
