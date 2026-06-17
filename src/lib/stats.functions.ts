import { createServerFn } from "@tanstack/react-start";

// Função pública (sem login) que devolve quantos jogadores existem cadastrados
// e uma estimativa de quantos estão online agora. O cálculo roda 100% no
// servidor, com a função do banco acessível apenas pela service role.
export const getPlayerStats = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin.rpc("get_player_stats");
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
