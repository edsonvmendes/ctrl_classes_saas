import { describe, expect, it, vi } from "vitest";

import { checkDatabaseReadiness } from "@/lib/readiness/runtime";

describe("runtime readiness", () => {
  it("marks the database as ok when the probe succeeds", async () => {
    const readiness = await checkDatabaseReadiness(
      vi.fn().mockResolvedValue(undefined),
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      },
    );

    expect(readiness.status).toBe("ok");
    expect(readiness.reachable).toBe(true);
  });

  it("marks the database as degraded when the probe fails", async () => {
    const readiness = await checkDatabaseReadiness(
      vi.fn().mockRejectedValue(new Error("connection failed")),
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://project.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "service-role",
      },
    );

    expect(readiness.status).toBe("degraded");
    expect(readiness.error).toBe("connection failed");
  });

  it("marks the database as not configured when env is incomplete", async () => {
    const readiness = await checkDatabaseReadiness(vi.fn(), {});

    expect(readiness.status).toBe("not_configured");
    expect(readiness.configured).toBe(false);
  });
});
