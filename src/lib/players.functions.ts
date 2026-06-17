import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ALL_ATTR_KEYS,
  FREE_POINTS,
  STAR_BASE,
  STAR_POOL,
  POSITIONS,
  PLAY_STYLES,
  NATIONALITIES,
  finalAttrs,
  computeOverall,
  computePotential,
  spentPoints,
  type PlayerDraft,
} from "@/lib/player";

const POSITION_CODES = new Set(POSITIONS.map((p) => p.code));
const PLAY_STYLE_NAMES = new Set(PLAY_STYLES.map((s) => s.name));
const NATIONALITY_SET = new Set(NATIONALITIES);

type RawDraft = Partial<PlayerDraft> & { freePoints?: Record<string, number> };

class ValidationError extends Error {}

// Valida e normaliza, no servidor, as escolhas enviadas pelo cliente.
// Nada do que o cliente diz sobre atributos/overall é aceito — só as escolhas.
function sanitizeDraft(input: RawDraft): PlayerDraft {
  const name = typeof input.name === "string" ? input.name.trim().replace(/\s{2,}/g, " ") : "";
  if (name.length < 3 || name.length > 24) {
    throw new ValidationError("Nome inválido (use de 3 a 24 caracteres).");
  }

  const nationality = String(input.nationality ?? "");
  if (!NATIONALITY_SET.has(nationality)) {
    throw new ValidationError("Nacionalidade inválida.");
  }

  const position = String(input.position ?? "");
  if (!POSITION_CODES.has(position)) {
    throw new ValidationError("Posição inválida.");
  }

  const altPositionsRaw = Array.isArray(input.altPositions) ? input.altPositions : [];
  const altPositions = [...new Set(altPositionsRaw.map(String))]
    .filter((c) => POSITION_CODES.has(c) && c !== position)
    .slice(0, 2);

  const preferredFoot = input.preferredFoot === "Esquerdo" ? "Esquerdo" : "Direito";

  const weakFoot = Math.trunc(Number(input.weakFoot));
  const skillMoves = Math.trunc(Number(input.skillMoves));
  const minStar = STAR_BASE;
  const maxStar = STAR_BASE + STAR_POOL;
  if (
    !Number.isFinite(weakFoot) ||
    !Number.isFinite(skillMoves) ||
    weakFoot < minStar ||
    skillMoves < minStar ||
    weakFoot > maxStar ||
    skillMoves > maxStar ||
    weakFoot - STAR_BASE + (skillMoves - STAR_BASE) > STAR_POOL
  ) {
    throw new ValidationError("Distribuição de estrelas inválida.");
  }

  const heightCm = Math.trunc(Number(input.heightCm));
  if (!Number.isFinite(heightCm) || heightCm < 155 || heightCm > 205) {
    throw new ValidationError("Altura inválida.");
  }

  const weightKg = Math.trunc(Number(input.weightKg));
  if (!Number.isFinite(weightKg) || weightKg < 55 || weightKg > 100) {
    throw new ValidationError("Peso inválido.");
  }

  const age = Math.trunc(Number(input.age));
  if (!Number.isFinite(age) || age < 14 || age > 40) {
    throw new ValidationError("Idade inválida.");
  }

  const playStyle = String(input.playStyle ?? "");
  if (!PLAY_STYLE_NAMES.has(playStyle)) {
    throw new ValidationError("Estilo de jogo inválido.");
  }

  const freePoints: Record<string, number> = {};
  ALL_ATTR_KEYS.forEach((k) => (freePoints[k] = 0));
  const incoming = input.freePoints ?? {};
  for (const key of Object.keys(incoming)) {
    if (!ALL_ATTR_KEYS.includes(key)) continue;
    const v = Math.trunc(Number(incoming[key]));
    if (!Number.isFinite(v) || v < 0) {
      throw new ValidationError("Distribuição de pontos inválida.");
    }
    freePoints[key] = v;
  }
  if (spentPoints(freePoints) > FREE_POINTS) {
    throw new ValidationError("Você distribuiu mais pontos do que o permitido.");
  }

  return {
    name,
    nationality,
    position,
    altPositions,
    preferredFoot,
    weakFoot,
    skillMoves,
    heightCm,
    weightKg,
    age,
    playStyle,
    freePoints,
  };
}

// Verifica, no servidor, se um nome de jogador está livre. A função do banco
// (is_player_name_available) só pode ser executada pela service role, então o
// cliente nunca a chama diretamente.
export const checkPlayerName = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string }) => input)
  .handler(async ({ data }) => {
    const name = typeof data?.name === "string" ? data.name.trim().replace(/\s{2,}/g, " ") : "";
    if (name.length < 3 || name.length > 24) {
      return { ok: false as const, available: false };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: available, error } = await supabaseAdmin.rpc("is_player_name_available", {
      _name: name,
    });

    if (error) {
      console.error("checkPlayerName error", error);
      return { ok: false as const, available: false };
    }

    return { ok: true as const, available: !!available };
  });

export const createPlayer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: RawDraft) => input)
  .handler(async ({ data, context }) => {
    let draft: PlayerDraft;
    try {
      draft = sanitizeDraft(data);
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof ValidationError ? err.message : "Dados inválidos.",
      };
    }

    // Cálculo 100% na nuvem — o cliente não envia atributos/overall.
    const attributes = finalAttrs(draft);
    const overall = computeOverall(attributes, draft.position);
    const potential = computePotential(overall, draft.age);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: inserted, error } = await supabaseAdmin
      .from("players")
      .insert({
        user_id: context.userId,
        name: draft.name,
        nationality: draft.nationality,
        position: draft.position,
        alt_positions: draft.altPositions,
        preferred_foot: draft.preferredFoot,
        weak_foot: draft.weakFoot,
        skill_moves: draft.skillMoves,
        height_cm: draft.heightCm,
        weight_kg: draft.weightKg,
        age: draft.age,
        play_style: draft.playStyle,
        overall,
        potential,
        attributes,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { ok: false as const, error: "name_taken" };
      }
      console.error("createPlayer insert error", error);
      return { ok: false as const, error: "Não foi possível salvar seu jogador. Tente novamente." };
    }

    return { ok: true as const, id: inserted.id };
  });
