import { deleteItineraryItem, updateItineraryItem } from "@/db/queries";
import { itineraryPatchSchema } from "@/lib/validation";

import { handleApiError, jsonError } from "../../_helpers";

type RouteParams = {
  params: Promise<{ id: string }>;
};

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const itemId = parseId(id);

    if (!itemId) {
      return jsonError("請提供有效的行程 ID。", 400);
    }

    const payload = itineraryPatchSchema.parse(await request.json());
    const item = await updateItineraryItem(itemId, payload);

    if (!item) {
      return jsonError("找不到指定行程。", 404);
    }

    return Response.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const itemId = parseId(id);

    if (!itemId) {
      return jsonError("請提供有效的行程 ID。", 400);
    }

    const item = await deleteItineraryItem(itemId);

    if (!item) {
      return jsonError("找不到指定行程。", 404);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
