// Motor de criação de jogador do Pro Soccer Online.
// 35 atributos individuais agrupados em 7 categorias. Posição, estilo de jogo,
// altura e peso afetam os atributos de forma realista. Tudo é calculado ao vivo.

// ----------------------------------------------------------------------------
// Categorias e atributos (35 no total)
// ----------------------------------------------------------------------------

export type CatKey =
  | "pace"
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending"
  | "physical"
  | "goalkeeping";

export interface AttrDef {
  key: string;
  label: string;
}

export interface AttrCategory {
  key: CatKey;
  short: string;
  label: string;
  goalkeeping?: boolean;
  attrs: AttrDef[];
}

export const CATEGORIES: AttrCategory[] = [
  {
    key: "pace",
    short: "RIT",
    label: "Ritmo",
    attrs: [
      { key: "acceleration", label: "Aceleração" },
      { key: "sprintSpeed", label: "Velocidade" },
    ],
  },
  {
    key: "shooting",
    short: "FIN",
    label: "Finalização",
    attrs: [
      { key: "positioning", label: "Posicionamento" },
      { key: "finishing", label: "Finalização" },
      { key: "shotPower", label: "Força do chute" },
      { key: "longShots", label: "Chutes de longe" },
      { key: "volleys", label: "Voleio" },
      { key: "penalties", label: "Pênaltis" },
    ],
  },
  {
    key: "passing",
    short: "PAS",
    label: "Passe",
    attrs: [
      { key: "vision", label: "Visão de jogo" },
      { key: "crossing", label: "Cruzamento" },
      { key: "fkAccuracy", label: "Precisão nas faltas" },
      { key: "shortPassing", label: "Passes curtos" },
      { key: "longPassing", label: "Lançamento" },
      { key: "curve", label: "Curva" },
    ],
  },
  {
    key: "dribbling",
    short: "DRI",
    label: "Drible",
    attrs: [
      { key: "agility", label: "Agilidade" },
      { key: "balance", label: "Equilíbrio" },
      { key: "reactions", label: "Reação" },
      { key: "ballControl", label: "Controle de bola" },
      { key: "dribbling", label: "Condução" },
      { key: "composure", label: "Compostura" },
    ],
  },
  {
    key: "defending",
    short: "DEF",
    label: "Defesa",
    attrs: [
      { key: "interceptions", label: "Interceptações" },
      { key: "headingAccuracy", label: "Cabeceio" },
      { key: "defAwareness", label: "Noção defensiva" },
      { key: "standingTackle", label: "Divididas" },
      { key: "slidingTackle", label: "Carrinho" },
    ],
  },
  {
    key: "physical",
    short: "FÍS",
    label: "Físico",
    attrs: [
      { key: "jumping", label: "Impulsão" },
      { key: "stamina", label: "Fôlego" },
      { key: "strength", label: "Força" },
      { key: "aggression", label: "Combatividade" },
    ],
  },
  {
    key: "goalkeeping",
    short: "GOL",
    label: "Goleiro",
    goalkeeping: true,
    attrs: [
      { key: "gkDiving", label: "Elasticidade" },
      { key: "gkHandling", label: "Manejo" },
      { key: "gkKicking", label: "Chute (GOL)" },
      { key: "gkReflexes", label: "Reflexos" },
      { key: "gkSpeed", label: "Velocidade (GOL)" },
      { key: "gkPositioning", label: "Posicionamento (GOL)" },
    ],
  },
];

export type Attrs = Record<string, number>;

export const ALL_ATTR_KEYS: string[] = CATEGORIES.flatMap((c) => c.attrs.map((a) => a.key));

const CAT_OF_ATTR: Record<string, CatKey> = (() => {
  const m: Record<string, CatKey> = {};
  CATEGORIES.forEach((c) => c.attrs.forEach((a) => (m[a.key] = c.key)));
  return m;
})();

// ----------------------------------------------------------------------------
// Constantes do motor
// ----------------------------------------------------------------------------

export const ATTR_BASE = 35; // valor inicial fixo de cada atributo (não diminui)
export const ATTR_CAP = 78; // teto de um atributo na criação
export const FREE_POINTS = 10; // pontos livres para distribuir
export const OVERALL_CAP = 65; // overall máximo possível na criação
export const STAR_POOL = 2; // estrelas para distribuir entre fintas e pé ruim
export const STAR_BASE = 1; // todos começam com 1 estrela em fintas e pé ruim

// ----------------------------------------------------------------------------
// Posições
// ----------------------------------------------------------------------------

export type PosGroup = "GK" | "CB" | "FB" | "DM" | "CM" | "AM" | "WG" | "SS" | "ST";

export interface Position {
  code: string;
  label: string;
  group: PosGroup;
}

export const POSITIONS: Position[] = [
  { code: "GOL", label: "Goleiro", group: "GK" },
  { code: "ZAG", label: "Zagueiro", group: "CB" },
  { code: "LD", label: "Lateral Direito", group: "FB" },
  { code: "LE", label: "Lateral Esquerdo", group: "FB" },
  { code: "VOL", label: "Volante", group: "DM" },
  { code: "MC", label: "Meio-Campo", group: "CM" },
  { code: "MEI", label: "Meia Armador", group: "AM" },
  { code: "PD", label: "Ponta Direita", group: "WG" },
  { code: "PE", label: "Ponta Esquerda", group: "WG" },
  { code: "SA", label: "Segundo Atacante", group: "SS" },
  { code: "ATA", label: "Centroavante", group: "ST" },
];

type CatMap = Partial<Record<CatKey, number>>;

// Pesos por grupo para calcular o Overall
const WEIGHTS: Record<PosGroup, CatMap> = {
  GK: { goalkeeping: 5, physical: 1.2, defending: 0.6, passing: 0.6, pace: 0.4, dribbling: 0.3, shooting: 0.2 },
  CB: { defending: 2.6, physical: 1.9, pace: 1.2, passing: 0.9, dribbling: 0.7, shooting: 0.3 },
  FB: { pace: 1.9, defending: 1.7, physical: 1.3, passing: 1.4, dribbling: 1.3, shooting: 0.5 },
  DM: { defending: 1.9, physical: 1.6, passing: 1.7, dribbling: 1.2, pace: 1, shooting: 0.7 },
  CM: { passing: 2, dribbling: 1.7, physical: 1.2, shooting: 1.1, pace: 1, defending: 1 },
  AM: { passing: 2, dribbling: 1.9, shooting: 1.4, pace: 1.1, physical: 0.9, defending: 0.5 },
  WG: { pace: 1.9, dribbling: 1.9, shooting: 1.4, passing: 1.3, physical: 0.9, defending: 0.4 },
  SS: { shooting: 2, dribbling: 1.8, pace: 1.5, passing: 1.3, physical: 1, defending: 0.3 },
  ST: { shooting: 2.4, pace: 1.6, dribbling: 1.5, physical: 1.3, passing: 0.9, defending: 0.3 },
};

// Bônus de categoria por grupo (aplicado sobre o valor base de cada atributo)
const POS_BONUS: Record<PosGroup, CatMap> = {
  GK: { goalkeeping: 24, physical: 10, passing: 6, defending: 4, pace: 4, dribbling: 4 },
  CB: { defending: 24, physical: 16, pace: 8, passing: 6, dribbling: 5, shooting: 2 },
  FB: { pace: 18, defending: 16, passing: 12, physical: 10, dribbling: 10, shooting: 4 },
  DM: { defending: 18, physical: 14, passing: 14, dribbling: 9, pace: 8, shooting: 5 },
  CM: { passing: 18, dribbling: 15, physical: 9, shooting: 9, defending: 9, pace: 8 },
  AM: { passing: 18, dribbling: 18, shooting: 13, pace: 10, physical: 6, defending: 3 },
  WG: { pace: 20, dribbling: 18, shooting: 13, passing: 11, physical: 6, defending: 2 },
  SS: { shooting: 18, dribbling: 16, pace: 14, passing: 11, physical: 8, defending: 2 },
  ST: { shooting: 24, pace: 18, dribbling: 15, physical: 12, passing: 7, defending: 2 },
};

export function positionGroup(code: string): PosGroup {
  return POSITIONS.find((p) => p.code === code)?.group ?? "CM";
}

// ----------------------------------------------------------------------------
// Estilos de jogo
// ----------------------------------------------------------------------------

export interface PlayStyle {
  name: string;
  desc: string;
  bonus: CatMap;
  // estilo "puxa" naturalmente estrelas para fintas (S) ou pé ruim (W)
  starHint?: "skill" | "weak" | "balanced";
}

export const PLAY_STYLES: PlayStyle[] = [
  { name: "Velocista", desc: "Explosão e drible nas pontas", bonus: { pace: 8, dribbling: 5 }, starHint: "skill" },
  { name: "Artilheiro", desc: "Faro de gol dentro da área", bonus: { shooting: 9, physical: 3 }, starHint: "weak" },
  { name: "Maestro", desc: "Visão de jogo e passe decisivo", bonus: { passing: 9, dribbling: 4 }, starHint: "skill" },
  { name: "Muralha", desc: "Força e desarme na defesa", bonus: { defending: 9, physical: 5 }, starHint: "balanced" },
  { name: "Goleiro", desc: "Reflexo e segurança no gol", bonus: { goalkeeping: 9, defending: 3 }, starHint: "balanced" },
  { name: "Box-to-box", desc: "Energia do ataque à defesa", bonus: { physical: 6, passing: 4, defending: 4, pace: 2 }, starHint: "balanced" },
];

// ----------------------------------------------------------------------------
// Nacionalidades — seleções da Copa do Mundo 2026
// ----------------------------------------------------------------------------

export const NATIONALITIES: string[] = [
  // Anfitriões
  "🇺🇸 Estados Unidos", "🇨🇦 Canadá", "🇲🇽 México",
  // América do Sul
  "🇧🇷 Brasil", "🇦🇷 Argentina", "🇺🇾 Uruguai", "🇨🇴 Colômbia", "🇪🇨 Equador",
  "🇵🇾 Paraguai", "🇵🇪 Peru", "🇻🇪 Venezuela", "🇨🇱 Chile", "🇧🇴 Bolívia",
  // Europa
  "🇫🇷 França", "🇬🇧 Inglaterra", "🇪🇸 Espanha", "🇵🇹 Portugal", "🇩🇪 Alemanha",
  "🇮🇹 Itália", "🇳🇱 Holanda", "🇧🇪 Bélgica", "🇭🇷 Croácia", "🇨🇭 Suíça",
  "🇩🇰 Dinamarca", "🇦🇹 Áustria", "🇵🇱 Polônia", "🇷🇸 Sérvia", "🇹🇷 Turquia",
  "🇳🇴 Noruega", "🏴 Escócia", "🇺🇦 Ucrânia", "🇨🇿 Tchéquia", "🇸🇪 Suécia",
  // África
  "🇲🇦 Marrocos", "🇸🇳 Senegal", "🇳🇬 Nigéria", "🇪🇬 Egito", "🇩🇿 Argélia",
  "🇹🇳 Tunísia", "🇬🇭 Gana", "🇨🇮 Costa do Marfim", "🇨🇲 Camarões", "🇿🇦 África do Sul",
  "🇲🇱 Mali", "🇨🇩 Rep. Dem. Congo",
  // Ásia
  "🇯🇵 Japão", "🇰🇷 Coreia do Sul", "🇮🇷 Irã", "🇦🇺 Austrália", "🇸🇦 Arábia Saudita",
  "🇶🇦 Catar", "🇮🇶 Iraque", "🇦🇪 Emirados Árabes", "🇺🇿 Uzbequistão", "🇯🇴 Jordânia",
  // Concacaf / Oceania
  "🇨🇷 Costa Rica", "🇵🇦 Panamá", "🇯🇲 Jamaica", "🇭🇳 Honduras", "🇳🇿 Nova Zelândia",
];

// ----------------------------------------------------------------------------
// Físico (altura / peso) afeta atributos de forma realista
// ----------------------------------------------------------------------------

const REF_HEIGHT = 178;
const REF_WEIGHT = 74;

const PHYSIQUE: Record<string, { h?: number; w?: number }> = {
  acceleration: { h: -0.16, w: -0.13 },
  sprintSpeed: { h: -0.1, w: -0.11 },
  agility: { h: -0.17, w: -0.14 },
  balance: { h: -0.15, w: -0.12 },
  ballControl: { h: -0.06 },
  dribbling: { h: -0.08, w: -0.05 },
  stamina: { h: -0.05, w: -0.1 },
  strength: { h: 0.22, w: 0.3 },
  jumping: { h: 0.22, w: -0.06 },
  headingAccuracy: { h: 0.18, w: 0.04 },
  shotPower: { h: 0.1, w: 0.1 },
  aggression: { w: 0.05 },
  standingTackle: { h: 0.06 },
  slidingTackle: { h: 0.05 },
  gkDiving: { h: 0.16 },
  gkReflexes: { h: 0.1 },
  gkPositioning: { h: 0.08 },
};

export function physiqueDelta(attrKey: string, heightCm: number, weightKg: number): number {
  const p = PHYSIQUE[attrKey];
  if (!p) return 0;
  const hf = heightCm - REF_HEIGHT;
  const wf = weightKg - REF_WEIGHT;
  return Math.round((p.h ?? 0) * hf + (p.w ?? 0) * wf);
}

// ----------------------------------------------------------------------------
// Cálculo dos atributos
// ----------------------------------------------------------------------------

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export interface PlayerDraft {
  name: string;
  nationality: string;
  position: string;
  altPositions: string[];
  preferredFoot: "Direito" | "Esquerdo";
  weakFoot: number; // estrelas (começa em 1)
  skillMoves: number; // estrelas (começa em 1)
  heightCm: number;
  weightKg: number;
  age: number;
  playStyle: string;
  freePoints: Record<string, number>; // pontos livres por atributo
}

export function emptyFreePoints(): Record<string, number> {
  const o: Record<string, number> = {};
  ALL_ATTR_KEYS.forEach((k) => (o[k] = 0));
  return o;
}

export function defaultDraft(): PlayerDraft {
  return {
    name: "",
    nationality: NATIONALITIES[3], // Brasil
    position: "MEI",
    altPositions: [],
    preferredFoot: "Direito",
    weakFoot: STAR_BASE,
    skillMoves: STAR_BASE,
    heightCm: 177,
    weightKg: 71,
    age: 14,
    playStyle: "Maestro",
    freePoints: emptyFreePoints(),
  };
}

// Atributos base (posição + estilo + físico), antes dos pontos livres
export function baseAttrs(draft: PlayerDraft): Attrs {
  const group = positionGroup(draft.position);
  const posBonus = POS_BONUS[group];
  const style = PLAY_STYLES.find((s) => s.name === draft.playStyle);
  const styleBonus = style?.bonus ?? {};
  const out: Attrs = {};
  ALL_ATTR_KEYS.forEach((key) => {
    const cat = CAT_OF_ATTR[key];
    let v = ATTR_BASE + (posBonus[cat] ?? 0) + (styleBonus[cat] ?? 0);
    v += physiqueDelta(key, draft.heightCm, draft.weightKg);
    out[key] = clamp(v, 1, ATTR_CAP);
  });
  return out;
}

// Atributos finais (base + pontos livres)
export function finalAttrs(draft: PlayerDraft): Attrs {
  const base = baseAttrs(draft);
  const out: Attrs = {};
  ALL_ATTR_KEYS.forEach((key) => {
    out[key] = clamp(base[key] + (draft.freePoints[key] ?? 0), 1, ATTR_CAP);
  });
  return out;
}

export function spentPoints(freePoints: Record<string, number>): number {
  return ALL_ATTR_KEYS.reduce((acc, k) => acc + (freePoints[k] ?? 0), 0);
}

export function categoryValue(attrs: Attrs, cat: CatKey): number {
  const def = CATEGORIES.find((c) => c.key === cat);
  if (!def) return ATTR_BASE;
  const vals = def.attrs.map((a) => attrs[a.key] ?? ATTR_BASE);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function categoryValues(attrs: Attrs): Record<CatKey, number> {
  const o = {} as Record<CatKey, number>;
  CATEGORIES.forEach((c) => (o[c.key] = categoryValue(attrs, c.key)));
  return o;
}

export function computeOverall(attrs: Attrs, position: string): number {
  const cats = categoryValues(attrs);
  const w = WEIGHTS[positionGroup(position)];
  let sum = 0;
  let wsum = 0;
  (Object.keys(w) as CatKey[]).forEach((k) => {
    const weight = w[k] ?? 0;
    sum += cats[k] * weight;
    wsum += weight;
  });
  const raw = wsum > 0 ? sum / wsum : ATTR_BASE;
  return clamp(Math.round(raw), 1, OVERALL_CAP);
}

export function computePotential(overall: number, age: number): number {
  const room = clamp(36 - age, 4, 22);
  return clamp(overall + room, overall + 4, 94);
}

// As 6 categorias mostradas no card (goleiro vê seus próprios atributos)
export function cardCategories(position: string): CatKey[] {
  if (positionGroup(position) === "GK") {
    return ["goalkeeping", "physical", "pace", "defending", "passing", "dribbling"];
  }
  return ["pace", "shooting", "passing", "dribbling", "defending", "physical"];
}

// ----------------------------------------------------------------------------
// Rascunho salvo no navegador (entre criar personagem -> cadastro)
// ----------------------------------------------------------------------------

const DRAFT_KEY = "pso.playerDraft";

export function saveDraft(d: PlayerDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
  } catch {
    /* ignore */
  }
}

export function loadDraft(): PlayerDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PlayerDraft) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
