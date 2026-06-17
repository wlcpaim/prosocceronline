import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Função pública (sem login) que devolve quantos jogadores existem cadastrados
// e uma estimativa de quantos estão online agora.
export const getPlayerStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const supabasePublic = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );

    const { data, error } = await supabasePublic.rpc("get_player_stats");
    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    return {
      registered: Number(row?.registered ?? 0),
      online: Number(row?.online ?? 0),
    };
  } catch {
    return { registered: 0, online: 0 };
  }
});
