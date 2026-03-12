import { cache } from "react";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PartnerContext = {
  partnerId: string;
  userId: string;
  timezone: string;
};

export const getPartnerContext = cache(async (): Promise<PartnerContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("partners")
    .select("partner_id, user_id, timezone")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    partnerId: data.partner_id,
    userId: data.user_id,
    timezone: data.timezone,
  };
});
