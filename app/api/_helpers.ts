import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "資料格式不正確", 422);
  }

  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return jsonError("尚未設定 DATABASE_URL，請先連接 Neon Postgres。", 500);
  }

  console.error(error);
  return jsonError("伺服器暫時無法處理請求，請稍後再試。", 500);
}
