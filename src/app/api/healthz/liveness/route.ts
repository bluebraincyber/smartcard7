import { getHealthResponse } from "@/lib/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getHealthResponse(false);
  
  return new Response(JSON.stringify({
    status: "ok",
    uptimeSec: health.uptimeSec,
    timestamp: health.timestamp,
    version: health.version,
  }, null, 2), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
