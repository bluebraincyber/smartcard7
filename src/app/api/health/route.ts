import { getHealthResponse } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getHealthResponse(true);
  const isHealthy = health.status === "ok";
  
  return new Response(JSON.stringify(health, null, 2), {
    status: isHealthy ? 200 : 503,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
