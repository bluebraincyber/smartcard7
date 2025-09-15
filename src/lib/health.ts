import { execSync } from 'child_process';

type Check = "ok" | "down" | "skipped";

export async function probeDb(): Promise<Check> {
  try {
    const mod = await import("@/lib/db").catch(() => null as any);
    const db = mod?.default ?? mod?.db ?? mod;

    if (!db) return "skipped";

    if (typeof db.execute === "function") {
      await db.execute("SELECT 1");
      return "ok";
    }
    if (typeof db.query === "function") {
      await db.query("SELECT 1");
      return "ok";
    }
    return "skipped";
  } catch {
    return "down";
  }
}

export function getVersion(): string | null {
  return (
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.COMMIT_SHA?.slice(0, 7) ??
    (() => {
      try {
        return execSync('git rev-parse --short HEAD').toString().trim();
      } catch {
        return null;
      }
    })()
  );
}

export interface HealthResponse {
  status: "ok" | "degraded";
  uptimeSec: number;
  timestamp: string;
  version: string | null;
  checks: {
    db: Check;
  };
}

export async function getHealthResponse(includeDb = true): Promise<HealthResponse> {
  const db = includeDb ? await probeDb() : "skipped";
  const allOk = db === "ok" || db === "skipped";

  return {
    status: allOk ? "ok" : "degraded",
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    version: getVersion(),
    checks: { db }
  };
}
