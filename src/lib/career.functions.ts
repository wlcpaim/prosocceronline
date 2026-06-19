import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface RankingRow {
  rank: number;
  name: string;
  position: string;
  age: number;
  overall: number;
  trainings: number;
  titles: number;
  isMe: boolean;
}

export interface CareerRanking {
  top: RankingRow[];
  me: {
    rank: number;
    overall: number;
    position: string;
    positionRank: number;
    total: number;
  } | null;
}

// Ranking global da escolinha. O cálculo roda 100% no servidor com a service
// role — o cliente nunca recebe IDs de usuário, apenas dados públicos do
// ranking (nome do craque, posição, idade e overall).
export const getCareerRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId?: string } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows, error } = await supabaseAdmin
      .from("players")
      .select("id, user_id, name, position, age, overall")
      .order("overall", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1000);

    if (error || !rows) {
      return { top: [], me: null } as CareerRanking;
    }

    const myIds = new Set(rows.filter((r) => r.user_id === context.userId).map((r) => r.id));

    const ranked = rows.map((r, i) => ({
      id: r.id,
      rank: i + 1,
      name: r.name as string,
      position: r.position as string,
      age: r.age as number,
      overall: r.overall as number,
      // Sem sistema de treinos/títulos ainda — derivamos um valor estável a
      // partir do overall só para a coluna não ficar vazia.
      trainings: Math.max(0, Math.round((r.overall as number) / 2) - 8),
      titles: 0,
      isMe: myIds.has(r.id),
    }));

    // Jogador de referência: o slug/id pedido, senão o melhor do próprio usuário.
    const mine = ranked.filter((r) => r.isMe);
    let meRow = mine[0];
    if (data.playerId) {
      const wanted = mine.find((r) => r.id === data.playerId);
      if (wanted) meRow = wanted;
    }

    let me: CareerRanking["me"] = null;
    if (meRow) {
      const samePos = ranked.filter((r) => r.position === meRow.position);
      const positionRank = samePos.findIndex((r) => r.id === meRow.id) + 1;
      me = {
        rank: meRow.rank,
        overall: meRow.overall,
        position: meRow.position,
        positionRank,
        total: ranked.length,
      };
    }

    const top: RankingRow[] = ranked.slice(0, 10).map((r) => ({
      rank: r.rank,
      name: r.name,
      position: r.position,
      age: r.age,
      overall: r.overall,
      trainings: r.trainings,
      titles: r.titles,
      isMe: r.isMe,
    }));

    // Garante que o jogador apareça no fim da lista se estiver fora do top 10.
    if (meRow && meRow.rank > 10) {
      top.push({
        rank: meRow.rank,
        name: meRow.name,
        position: meRow.position,
        age: meRow.age,
        overall: meRow.overall,
        trainings: meRow.trainings,
        titles: meRow.titles,
        isMe: true,
      });
    }

    return { top, me } as CareerRanking;
  });
