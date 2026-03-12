import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type DatabaseReadiness = {
  configured: boolean;
  error: string | null;
  reachable: boolean;
  status: "degraded" | "not_configured" | "ok";
};

async function defaultDatabaseProbe() {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new Error(error.message);
  }
}

export async function checkDatabaseReadiness(
  probe: () => Promise<void> = defaultDatabaseProbe,
  env: NodeJS.ProcessEnv = process.env,
): Promise<DatabaseReadiness> {
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      configured: false,
      error: null,
      reachable: false,
      status: "not_configured",
    };
  }

  try {
    await probe();

    return {
      configured: true,
      error: null,
      reachable: true,
      status: "ok",
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : "Unknown database readiness error.",
      reachable: false,
      status: "degraded",
    };
  }
}
