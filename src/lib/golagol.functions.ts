import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { cleatOverallBonus } from "@/lib/shop-items";
import { positionGroup } from "@/lib/player";
import { levelFromXp } from "@/lib/progression";

export interface GolRound {
  p1: boolean;
  p2: boolean;
}

export interface GolMatch {
  id: string;
  status: "waiting" | "active" | "finished";
  p1Name: string;
  p1Overall: number;
  p1Score: number;
  p2Name: string | null;
  p2Overall: number | null;
  p2Score: number;
  rounds: GolRound[] | null;
  // Resultado do ponto de vista de quem pediu.
  youAreP1: boolean;
  outcome: "win" | "loss" | "draw" | null;
  coinsAwarded: number | null;
  xpAwarded: number | null;
}

export interface GolRankingRow {
  rank: number;
  name: string;
  wins: number;
  played: number;
  isMe: boolean;
}

const COINS_WIN = 5;
const COINS_LOSS = 1;
const XP_WIN = 10;
const XP_LOSS = 2;

// Probabilidade de gol por chute, derivada do overall (entre 25% e 90%).
function shotChance(overall: number): number {
  return Math.min(0.9, Math.max(0.25, 0.35 + (overall - 70) / 110));
}

// Simulação 100% no servidor (anti-cheat). Disputa de 5 rodadas + morte súbita.
function simulate(p1Overall: number, p2Overall: number) {
  const rounds: GolRound[] = [];
  let s1 = 0;
  let s2 = 0;
  const c1 = shotChance(p1Overall);
  const c2 = shotChance(p2Overall);

  for (let i = 0; i < 5; i++) {
    const p1 = Math.random() < c1;
    const p2 = Math.random() < c2;
    if (p1) s1++;
    if (p2) s2++;
    rounds.push({ p1, p2 });
  }

  // Morte súbita até desempatar (limite de segurança).
  let guard = 0;
  while (s1 === s2 && guard < 20) {
    const p1 = Math.random() < c1;
    const p2 = Math.random() < c2;
    if (p1) s1++;
    if (p2) s2++;
    rounds.push({ p1, p2 });
    guard++;
  }

  // Empate impossível na prática; fallback decide pelo melhor overall.
  let winner: 1 | 2 | 0 = s1 > s2 ? 1 : s2 > s1 ? 2 : p1Overall >= p2Overall ? 1 : 2;
  return { rounds, s1, s2, winner };
}

function toSnapshot(row: any, userId: string): GolMatch {
  const youAreP1 = row.p1_user_id === userId;
  let outcome: GolMatch["outcome"] = null;
  let coinsAwarded: number | null = null;
  if (row.status === "finished") {
    if (row.winner_user_id === userId) {
      outcome = "win";
      coinsAwarded = COINS_WIN;
    } else if (row.winner_user_id) {
      outcome = "loss";
      coinsAwarded = COINS_LOSS;
    } else {
      outcome = "draw";
      coinsAwarded = COINS_LOSS;
    }
  }
  return {
    id: row.id,
    status: row.status,
    p1Name: row.p1_name,
    p1Overall: row.p1_overall,
    p1Score: row.p1_score,
    p2Name: row.p2_name ?? null,
    p2Overall: row.p2_overall ?? null,
    p2Score: row.p2_score,
    rounds: (row.rounds as GolRound[] | null) ?? null,
    youAreP1,
    outcome,
    coinsAwarded,
  };
}

async function award(userId: string, amount: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("wallets")
    .select("coins")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) {
    await supabaseAdmin
      .from("wallets")
      .update({ coins: (data.coins as number) + amount })
      .eq("user_id", userId);
  } else {
    await supabaseAdmin.from("wallets").insert({ user_id: userId, coins: 1000 + amount });
  }
}

// Entra na fila de Gol a Gol. Pareia com um oponente real esperando, ou cria
// uma nova partida em espera. Quando dois jogadores se encontram, o servidor
// resolve o duelo e premia ambos.
export const joinGolQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string }) => {
    if (!input?.playerId) throw new Error("Jogador obrigatório");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Carrega o jogador e confirma que pertence ao usuário.
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, user_id, name, overall")
      .eq("id", data.playerId)
      .maybeSingle();
    if (!player || player.user_id !== userId) throw new Error("Jogador inválido");

    // Já está numa partida em aberto?
    const { data: existing } = await supabaseAdmin
      .from("gol_matches")
      .select("*")
      .or(`p1_user_id.eq.${userId},p2_user_id.eq.${userId}`)
      .in("status", ["waiting", "active"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing) return toSnapshot(existing, userId);

    // Procura um oponente real esperando.
    const { data: candidates } = await supabaseAdmin
      .from("gol_matches")
      .select("*")
      .eq("status", "waiting")
      .neq("p1_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1);

    const candidate = candidates?.[0];
    if (candidate) {
      // Reivindica a partida de forma atômica (vence a corrida).
      const { data: claimed } = await supabaseAdmin
        .from("gol_matches")
        .update({
          status: "active",
          p2_user_id: userId,
          p2_player_id: player.id,
          p2_name: player.name,
          p2_overall: player.overall,
        })
        .eq("id", candidate.id)
        .eq("status", "waiting")
        .select()
        .maybeSingle();

      if (claimed) {
        const sim = simulate(claimed.p1_overall as number, player.overall as number);
        const winnerUserId =
          sim.winner === 1 ? (claimed.p1_user_id as string) : userId;
        const { data: finished } = await supabaseAdmin
          .from("gol_matches")
          .update({
            status: "finished",
            p1_score: sim.s1,
            p2_score: sim.s2,
            rounds: JSON.parse(JSON.stringify(sim.rounds)),
            winner_user_id: winnerUserId,
          })
          .eq("id", claimed.id)
          .select()
          .maybeSingle();

        // Premia ambos os jogadores.
        const loserUserId = sim.winner === 1 ? userId : (claimed.p1_user_id as string);
        await award(winnerUserId, COINS_WIN);
        await award(loserUserId, COINS_LOSS);

        return toSnapshot(finished ?? claimed, userId);
      }
    }

    // Ninguém esperando: cria partida em espera.
    const { data: created } = await supabaseAdmin
      .from("gol_matches")
      .insert({
        status: "waiting",
        p1_user_id: userId,
        p1_player_id: player.id,
        p1_name: player.name,
        p1_overall: player.overall,
      })
      .select()
      .maybeSingle();

    return toSnapshot(created, userId);
  });

// Consulta o estado atual da partida (polling do cliente).
export const getGolMatch = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => {
    if (!input?.matchId) throw new Error("Partida obrigatória");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("gol_matches")
      .select("*")
      .eq("id", data.matchId)
      .maybeSingle();
    if (!row) return null;
    if (row.p1_user_id !== context.userId && row.p2_user_id !== context.userId) {
      throw new Error("Sem acesso a esta partida");
    }
    return toSnapshot(row, context.userId);
  });

// Cancela a busca enquanto ainda está esperando oponente.
export const cancelGolQueue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { matchId: string }) => {
    if (!input?.matchId) throw new Error("Partida obrigatória");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("gol_matches")
      .delete()
      .eq("id", data.matchId)
      .eq("p1_user_id", context.userId)
      .eq("status", "waiting");
    return { ok: true as const };
  });

// Ranking de Gol a Gol (vitórias). Calculado no servidor; o cliente recebe
// apenas nomes e contagens.
export const getGolRanking = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("gol_matches")
      .select("p1_user_id, p1_name, p2_user_id, p2_name, winner_user_id, status")
      .eq("status", "finished")
      .limit(2000);

    const tally = new Map<string, { name: string; wins: number; played: number }>();
    const touch = (uid: string | null, name: string | null) => {
      if (!uid) return;
      const cur = tally.get(uid) ?? { name: name ?? "Jogador", wins: 0, played: 0 };
      if (name) cur.name = name;
      cur.played += 1;
      tally.set(uid, cur);
    };

    for (const r of rows ?? []) {
      touch(r.p1_user_id as string, r.p1_name as string);
      touch(r.p2_user_id as string | null, r.p2_name as string | null);
      if (r.winner_user_id) {
        const w = tally.get(r.winner_user_id as string);
        if (w) w.wins += 1;
      }
    }

    const ranked = Array.from(tally.entries())
      .map(([uid, v]) => ({ uid, ...v }))
      .sort((a, b) => b.wins - a.wins || b.played - a.played)
      .map((v, i) => ({
        rank: i + 1,
        name: v.name,
        wins: v.wins,
        played: v.played,
        isMe: v.uid === context.userId,
      }));

    const top = ranked.slice(0, 10) as GolRankingRow[];
    const meRow = ranked.find((r) => r.isMe);
    if (meRow && meRow.rank > 10) top.push(meRow);

    return { top } as { top: GolRankingRow[] };
  });
