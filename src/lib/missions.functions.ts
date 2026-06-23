import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MISSIONS, type MissionProgress, type MissionMetric } from "@/lib/missions";
import { levelFromXp } from "@/lib/progression";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function computeMetrics(supabaseAdmin: any, userId: string): Promise<Record<MissionMetric, number>> {
  const { data: matches } = await supabaseAdmin
    .from("gol_matches")
    .select("p1_user_id, p2_user_id, winner_user_id, status")
    .eq("status", "finished")
    .or(`p1_user_id.eq.${userId},p2_user_id.eq.${userId}`)
    .limit(5000);

  let golPlayed = 0;
  let golWins = 0;
  for (const m of matches ?? []) {
    golPlayed += 1;
    if (m.winner_user_id === userId) golWins += 1;
  }

  const { data: inv } = await supabaseAdmin
    .from("inventory")
    .select("quantity")
    .eq("user_id", userId);
  const itemsOwned = ((inv ?? []) as { quantity: number }[]).reduce(
    (acc, r) => acc + (r.quantity ?? 0),
    0,
  );

  const { count: playersCount } = await supabaseAdmin
    .from("players")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: wallet } = await supabaseAdmin
    .from("wallets")
    .select("xp")
    .eq("user_id", userId)
    .maybeSingle();
  const level = levelFromXp((wallet?.xp as number | undefined) ?? 0);

  return {
    golPlayed,
    golWins,
    itemsOwned,
    players: playersCount ?? 0,
    level,
  };
}

export interface MissionsState {
  missions: MissionProgress[];
  coins: number;
  xp: number;
  level: number;
}

export const getMissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MissionsState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const metrics = await computeMetrics(supabaseAdmin, userId);

    const { data: claimedRows } = await supabaseAdmin
      .from("user_missions")
      .select("mission_id")
      .eq("user_id", userId);
    const claimed = new Set(
      ((claimedRows ?? []) as { mission_id: string }[]).map((r) => r.mission_id),
    );

    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("coins, xp, level")
      .eq("user_id", userId)
      .maybeSingle();

    const missions: MissionProgress[] = MISSIONS.map((m) => {
      const current = metrics[m.metric] ?? 0;
      const isClaimed = claimed.has(m.id);
      return {
        id: m.id,
        title: m.title,
        desc: m.desc,
        target: m.target,
        current: Math.min(current, m.target),
        coins: m.coins,
        xp: m.xp,
        claimed: isClaimed,
        claimable: !isClaimed && current >= m.target,
      };
    });

    return {
      missions,
      coins: (wallet?.coins as number | undefined) ?? 0,
      xp: (wallet?.xp as number | undefined) ?? 0,
      level: (wallet?.level as number | undefined) ?? 1,
    };
  });

export const claimMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { missionId: string }) => {
    if (!input?.missionId) throw new Error("Missão obrigatória");
    return input;
  })
  .handler(async ({ data, context }) => {
    const def = MISSIONS.find((m) => m.id === data.missionId);
    if (!def) return { ok: false as const, reason: "invalid" as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Já resgatada?
    const { data: existing } = await supabaseAdmin
      .from("user_missions")
      .select("id")
      .eq("user_id", userId)
      .eq("mission_id", def.id)
      .maybeSingle();
    if (existing) return { ok: false as const, reason: "claimed" as const };

    // Confirma que o requisito foi cumprido (anti-cheat).
    const metrics = await computeMetrics(supabaseAdmin, userId);
    if ((metrics[def.metric] ?? 0) < def.target) {
      return { ok: false as const, reason: "incomplete" as const };
    }

    // Registra o resgate (UNIQUE evita duplicidade em corrida).
    const { error: insErr } = await supabaseAdmin
      .from("user_missions")
      .insert({ user_id: userId, mission_id: def.id });
    if (insErr) return { ok: false as const, reason: "claimed" as const };

    // Credita a recompensa na carteira.
    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("coins, xp")
      .eq("user_id", userId)
      .maybeSingle();
    const curCoins = (wallet?.coins as number | undefined) ?? 0;
    const curXp = (wallet?.xp as number | undefined) ?? 0;
    const newXp = curXp + def.xp;
    const newLevel = levelFromXp(newXp);
    if (wallet) {
      await supabaseAdmin
        .from("wallets")
        .update({ coins: curCoins + def.coins, xp: newXp, level: newLevel })
        .eq("user_id", userId);
    } else {
      await supabaseAdmin
        .from("wallets")
        .insert({ user_id: userId, coins: 1000 + def.coins, xp: newXp, level: newLevel });
    }

    return {
      ok: true as const,
      coins: curCoins + def.coins,
      xp: newXp,
      level: newLevel,
      rewardCoins: def.coins,
      rewardXp: def.xp,
    };
  });
