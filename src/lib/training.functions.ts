import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CATEGORIES,
  computeTrainedOverall,
  positionGroup,
  type Attrs,
  type CatKey,
} from "@/lib/player";

// ----------------------------------------------------------------------------
// Regras de treino (server-authoritative)
// ----------------------------------------------------------------------------

export const ATTR_TRAIN_MAX = 99;

export type TierKey = "basico" | "avancado" | "profissional";
export type SkillKey = "weakFoot" | "skillMoves";

export const TIERS: Record<TierKey, { label: string; add: number; cooldownMs: number }> = {
  basico: { label: "básico", add: 0.5, cooldownMs: 60 * 60 * 1000 },
  avancado: { label: "avançado", add: 1.5, cooldownMs: 24 * 60 * 60 * 1000 },
  profissional: { label: "profissional", add: 5, cooldownMs: 7 * 24 * 60 * 60 * 1000 },
};

const GLOBAL_LOCK_MS = 5 * 60 * 1000;
const SKILL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const SKILL_MAX = 5;

const TRAINABLE_CATS = new Set<CatKey>([
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physical",
  "goalkeeping",
]);

export interface TrainingState {
  basico: { key: string | null; until: string | null };
  avancado: { key: string | null; until: string | null };
  profissional: { key: string | null; until: string | null };
  globalLockUntil: string | null;
  skill: { key: string | null; until: string | null };
  boostUntil: string | null;
}

export interface TrainingSnapshot {
  ok: boolean;
  error?: string;
  attributes: Attrs;
  overall: number;
  weakFoot: number;
  skillMoves: number;
  position: string;
  potential: number;
  isGoalkeeper: boolean;
  training: TrainingState;
  // Resultado do último treino (para feedback imediato no cliente)
  result?: {
    tier?: TierKey;
    catKey?: CatKey;
    changes: { key: string; before: number; after: number }[];
    beforeCatOverall?: number;
    afterCatOverall?: number;
    skillUpgraded?: SkillKey;
    newStars?: number;
  };
}

interface TrainingRow {
  player_id: string;
  basico_key: string | null;
  basico_until: string | null;
  avancado_key: string | null;
  avancado_until: string | null;
  profissional_key: string | null;
  profissional_until: string | null;
  global_lock_until: string | null;
  skill_key: string | null;
  skill_until: string | null;
}

function toState(row: TrainingRow): TrainingState {
  return {
    basico: { key: row.basico_key, until: row.basico_until },
    avancado: { key: row.avancado_key, until: row.avancado_until },
    profissional: { key: row.profissional_key, until: row.profissional_until },
    globalLockUntil: row.global_lock_until,
    skill: { key: row.skill_key, until: row.skill_until },
  };
}

function isActive(until: string | null): boolean {
  return !!until && new Date(until).getTime() > Date.now();
}

function catValue(attrs: Attrs, cat: CatKey): number {
  const def = CATEGORIES.find((c) => c.key === cat);
  if (!def) return 0;
  const vals = def.attrs.map((a) => attrs[a.key] ?? 35);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadOwned(supabaseAdmin: any, playerId: string, userId: string) {
  const { data: player, error } = await supabaseAdmin
    .from("players")
    .select("id, user_id, position, overall, potential, attributes, weak_foot, skill_moves")
    .eq("id", playerId)
    .maybeSingle();
  if (error || !player || player.user_id !== userId) return null;

  let { data: training } = await supabaseAdmin
    .from("player_training")
    .select("*")
    .eq("player_id", playerId)
    .maybeSingle();

  if (!training) {
    const { data: created } = await supabaseAdmin
      .from("player_training")
      .insert({ player_id: playerId })
      .select("*")
      .single();
    training = created;
  }

  return { player, training: training as TrainingRow };
}

// Aplica a conclusão pendente do treino de habilidade (pé ruim / fintas)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveSkill(supabaseAdmin: any, player: any, training: TrainingRow) {
  let skillUpgraded: SkillKey | undefined;
  let newStars: number | undefined;
  if (training.skill_key && training.skill_until && !isActive(training.skill_until)) {
    const key = training.skill_key as SkillKey;
    const col = key === "weakFoot" ? "weak_foot" : "skill_moves";
    const current = key === "weakFoot" ? player.weak_foot : player.skill_moves;
    const next = Math.min(SKILL_MAX, current + 1);
    if (next !== current) {
      await supabaseAdmin.from("players").update({ [col]: next }).eq("id", player.id);
      if (key === "weakFoot") player.weak_foot = next;
      else player.skill_moves = next;
      skillUpgraded = key;
      newStars = next;
    }
    await supabaseAdmin
      .from("player_training")
      .update({ skill_key: null, skill_until: null })
      .eq("player_id", player.id);
    training.skill_key = null;
    training.skill_until = null;
  }
  return { skillUpgraded, newStars };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function snapshot(player: any, training: TrainingRow): TrainingSnapshot {
  return {
    ok: true,
    attributes: player.attributes as Attrs,
    overall: player.overall,
    weakFoot: player.weak_foot,
    skillMoves: player.skill_moves,
    position: player.position,
    potential: player.potential,
    isGoalkeeper: positionGroup(player.position) === "GK",
    training: toState(training),
  };
}

export const getTraining = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string }) => input)
  .handler(async ({ data, context }): Promise<TrainingSnapshot | { ok: false; error: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const owned = await loadOwned(supabaseAdmin, data.playerId, context.userId);
    if (!owned) return { ok: false as const, error: "Jogador não encontrado." };
    const { player, training } = owned;
    const sk = await resolveSkill(supabaseAdmin, player, training);
    const snap = snapshot(player, training);
    if (sk.skillUpgraded) {
      snap.result = { changes: [], skillUpgraded: sk.skillUpgraded, newStars: sk.newStars };
    }
    return snap;
  });

export const startTraining = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string; catKey: CatKey; tier: TierKey }) => input)
  .handler(async ({ data, context }): Promise<TrainingSnapshot | { ok: false; error: string }> => {
    const { catKey, tier } = data;
    if (!TIERS[tier]) return { ok: false as const, error: "Tipo de treino inválido." };
    if (!TRAINABLE_CATS.has(catKey)) return { ok: false as const, error: "Categoria inválida." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const owned = await loadOwned(supabaseAdmin, data.playerId, context.userId);
    if (!owned) return { ok: false as const, error: "Jogador não encontrado." };
    const { player, training } = owned;
    await resolveSkill(supabaseAdmin, player, training);

    if (catKey === "goalkeeping" && positionGroup(player.position) !== "GK") {
      return { ok: false as const, error: "Treino de goleiro disponível apenas para goleiros." };
    }

    const tierUntilCol = `${tier}_until` as const;
    const tierKeyCol = `${tier}_key` as const;
    const tierUntil = training[tierUntilCol];
    if (isActive(tierUntil)) {
      return { ok: false as const, error: `Treino ${TIERS[tier].label} já em andamento.` };
    }
    if (isActive(training.global_lock_until)) {
      return { ok: false as const, error: "Aguarde para treinar outra categoria." };
    }

    const def = CATEGORIES.find((c) => c.key === catKey);
    if (!def) return { ok: false as const, error: "Categoria inválida." };

    const attrs = { ...(player.attributes as Attrs) };
    const before = catValue(attrs, catKey);
    const changes: { key: string; before: number; after: number }[] = [];
    for (const a of def.attrs) {
      const cur = attrs[a.key] ?? 35;
      const next = Math.min(ATTR_TRAIN_MAX, Math.round((cur + TIERS[tier].add) * 10) / 10);
      if (next !== cur) {
        attrs[a.key] = next;
        changes.push({ key: a.key, before: cur, after: next });
      }
    }
    const overall = computeTrainedOverall(attrs, player.position);
    const after = catValue(attrs, catKey);

    await supabaseAdmin
      .from("players")
      .update({ attributes: attrs, overall })
      .eq("id", player.id);

    const now = Date.now();
    const update: Record<string, string | null> = {
      global_lock_until: new Date(now + GLOBAL_LOCK_MS).toISOString(),
    };
    update[tierKeyCol] = catKey;
    update[tierUntilCol] = new Date(now + TIERS[tier].cooldownMs).toISOString();
    await supabaseAdmin.from("player_training").update(update as never).eq("player_id", player.id);

    player.attributes = attrs;
    player.overall = overall;
    Object.assign(training, update);

    const snap = snapshot(player, training);
    snap.result = { tier, catKey, changes, beforeCatOverall: before, afterCatOverall: after };
    return snap;
  });

export const startSkillTraining = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string; skill: SkillKey }) => input)
  .handler(async ({ data, context }): Promise<TrainingSnapshot | { ok: false; error: string }> => {
    const { skill } = data;
    if (skill !== "weakFoot" && skill !== "skillMoves") {
      return { ok: false as const, error: "Habilidade inválida." };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const owned = await loadOwned(supabaseAdmin, data.playerId, context.userId);
    if (!owned) return { ok: false as const, error: "Jogador não encontrado." };
    const { player, training } = owned;
    await resolveSkill(supabaseAdmin, player, training);

    if (isActive(training.skill_until)) {
      return { ok: false as const, error: "Já existe um treino de habilidade em andamento." };
    }
    const current = skill === "weakFoot" ? player.weak_foot : player.skill_moves;
    if (current >= SKILL_MAX) {
      return { ok: false as const, error: "Habilidade já está no nível máximo (5)." };
    }

    const until = new Date(Date.now() + SKILL_COOLDOWN_MS).toISOString();
    await supabaseAdmin
      .from("player_training")
      .update({ skill_key: skill, skill_until: until })
      .eq("player_id", player.id);
    training.skill_key = skill;
    training.skill_until = until;

    return snapshot(player, training);
  });
