import { handleApiError } from "../_helpers";
import { listFinalItinerary } from "@/db/queries";

export async function GET() {
  try {
    const rows = await listFinalItinerary();
    return Response.json(rows);
  } catch (error) {
    return handleApiError(error);
  }
}
