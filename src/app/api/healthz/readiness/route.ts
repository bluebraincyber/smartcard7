import { getHealthResponse } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getHealthResponse(true);
  const isReady = health.checks.db === "ok";

  return new Response(JSON.stringify(health, null, 2), {
    status: isReady ? 200 : 503,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
