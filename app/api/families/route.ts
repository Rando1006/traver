import { handleApiError } from "../_helpers";
import { listFamilies } from "@/db/queries";

export async function GET() {
  try {
    const rows = await listFamilies();
    return Response.json(rows);
  } catch (error) {
    return handleApiError(error);
  }
}
