import { familyExists, listFamilyItinerary, createItineraryItem } from "@/db/queries";
import { itineraryCreateSchema } from "@/lib/validation";

import { handleApiError, jsonError } from "../_helpers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const familyId = Number(searchParams.get("familyId"));

    if (!Number.isInteger(familyId) || familyId <= 0) {
      return jsonError("請提供有效的 familyId。", 400);
    }

    const rows = await listFamilyItinerary(familyId);
    return Response.json(rows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = itineraryCreateSchema.parse(await request.json());
    const exists = await familyExists(payload.familyId);

    if (!exists) {
      return jsonError("找不到指定家庭。", 404);
    }

    const item = await createItineraryItem(payload);
    return Response.json(item, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
