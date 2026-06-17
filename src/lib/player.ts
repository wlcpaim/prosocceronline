// Dados e tipos do jogador no estilo FIFA / EA SPORTS FC

export type AttrKey = "pace" | "shooting" | "passing" | "dribbling" | "defending" | "physical";

export interface SubAttr {
  key: string;
  label: string;
  offset: number; // variação em relação ao valor da categoria
}

export interface AttrCategory {
  key: AttrKey;
  short: string; // RIT, FIN, PAS, DRI, DEF, FÍS
  label: string;
  subs: SubAttr[];
}

export const ATTRIBUTES: AttrCategory[] = [
  {
    key: "pace",
    short: "RIT",
    label: "Ritmo",
    subs: [
      { key: "acceleration", label: "Aceleração", offset: 2 },
      { key: "sprint", label: "Pique", offset: -1 },
    ],
  },
  {
    key: "shooting",
    short: "FIN",
    label: "Finalização",
    subs: [
      { key: "positioning", label: "Posicionamento", offset: 3 },
      { key: "finishing", label: "Finalização", offset: 2 },
      { key: "shotPower", label: "Força do chute", offset: -4 },
      { key: "longShots", label: "Chutes de longe", offset: 2 },
      { key: "volleys", label: "Voleio", offset: -1 },
      { key: "penalties", label: "Pênaltis", offset: -6 },
    ],
  },
  {
    key: "passing",
    short: "PAS",
    label: "Passe",
    subs: [
      { key: "vision", label: "Visão de jogo", offset: 3 },
      { key: "crossing", label: "Cruzamento", offset: -1 },
      { key: "fkAccuracy", label: "Precisão nas faltas", offset: -8 },
      { key: "shortPass", label: "Passes curtos", offset: 3 },
      { key: "longPass", label: "Lançamento", offset: -1 },
      { key: "curve", label: "Curva", offset: -3 },
    ],
  },
  {
    key: "dribbling",
    short: "DRI",
    label: "Drible",
    subs: [
      { key: "agility", label: "Agilidade", offset: 0 },
      { key: "balance", label: "Equilíbrio", offset: -1 },
      { key: "reactions", label: "Reação", offset: 0 },
      { key: "ballControl", label: "Controle de bola", offset: 4 },
      { key: "dribbling", label: "Condução", offset: 2 },
      { key: "composure", label: "Compostura", offset: -2 },
    ],
  },
  {
    key: "defending",
    short: "DEF",
    label: "Defesa",
    subs: [
      { key: "interceptions", label: "Interceptações", offset: 2 },
      { key: "heading", label: "Precisão no cabeceio", offset: -8 },
      { key: "defAwareness", label: "Noção defensiva", offset: 6 },
      { key: "standTackle", label: "Dividida em pé", offset: -2 },
      { key: "slideTackle", label: "Carrinho", offset: -6 },
    ],
  },
  {
    key: "physical",
    short: "FÍS",
    label: "Físico",
    subs: [
      { key: "jumping", label: "Impulsão", offset: -1 },
      { key: "stamina", label: "Fôlego", offset: 12 },
      { key: "strength", label: "Força", offset: -6 },
      { key: "aggression", label: "Combatividade", offset: -2 },
    ],
  },
];

export interface Position {
  code: string;
  label: string;
  group: "GK" | "DEF" | "MID" | "ATT";
}

export const POSITIONS: Position[] = [
  { code: "GOL", label: "Goleiro", group: "GK" },
  { code: "ZAG", label: "Zagueiro", group: "DEF" },
  { code: "LD", label: "Lateral Direito", group: "DEF" },
  { code: "LE", label: "Lateral Esquerdo", group: "DEF" },
  { code: "VOL", label: "Volante", group: "MID" },
  { code: "MC", label: "Meio-Campo", group: "MID" },
  { code: "MEI", label: "Meia Armador", group: "MID" },
  { code: "PD", label: "Ponta Direita", group: "ATT" },
  { code: "PE", label: "Ponta Esquerda", group: "ATT" },
  { code: "SA", label: "Segundo Atacante", group: "ATT" },
  { code: "ATA", label: "Centroavante", group: "ATT" },
];

// Pesos por grupo de posição para calcular o Overall (PAC,SHO,PAS,DRI,DEF,PHY)
const WEIGHTS: Record<Position["group"], Record<AttrKey, number>> = {
  GK: { pace: 0.5, shooting: 0.2, passing: 1, dribbling: 1, defending: 2.5, physical: 1.5 },
  DEF: { pace: 1.2, shooting: 0.4, passing: 1, dribbling: 1, defending: 2.6, physical: 1.8 },
  MID: { pace: 1, shooting: 1.2, passing: 2, dribbling: 1.8, defending: 1, physical: 1 },
  ATT: { pace: 1.8, shooting: 2.4, passing: 1, dribbling: 1.8, defending: 0.3, physical: 1.1 },
};

export interface PlayStyle {
  name: string;
  desc: string;
  // bônus aplicado por categoria
  bonus: Partial<Record<AttrKey, number>>;
}

export const PLAY_STYLES: PlayStyle[] = [
  { name: "Velocista", desc: "Explosão e drible nas pontas", bonus: { pace: 6, dribbling: 4 } },
  { name: "Artilheiro", desc: "Faro de gol dentro da área", bonus: { shooting: 7, physical: 2 } },
  { name: "Maestro", desc: "Visão de jogo e passe decisivo", bonus: { passing: 7, dribbling: 3 } },
  { name: "Muralha", desc: "Força e desarme na defesa", bonus: { defending: 7, physical: 4 } },
  { name: "Goleiro", desc: "Reflexo e segurança no gol", bonus: { defending: 6, physical: 3 } },
  { name: "Box-to-box", desc: "Energia do ataque à defesa", bonus: { physical: 5, passing: 3, defending: 2 } },
];

export const NATIONALITIES = [
  "🇧🇷 Brasil", "🇦🇷 Argentina", "🇵🇹 Portugal", "🇪🇸 Espanha", "🇫🇷 França",
  "🇩🇪 Alemanha", "🇮🇹 Itália", "🇬🇧 Inglaterra", "🇳🇱 Holanda", "🇺🇾 Uruguai",
  "🇨🇴 Colômbia", "🇧🇪 Bélgica", "🇭🇷 Croácia", "🇲🇽 México", "🇯🇵 Japão",
];

export type Attrs = Record<AttrKey, number>;

export interface PlayerDraft {
  name: string;
  nationality: string;
  position: string;
  altPositions: string[];
  preferredFoot: "Direito" | "Esquerdo";
  weakFoot: number; // 1-5
  skillMoves: number; // 1-5
  heightCm: number;
  weightKg: number;
  age: number;
  playStyle: string;
  attributes: Attrs;
}

export const ATTR_BASE = 45;
export const ATTR_MIN = 40;
export const ATTR_MAX = 85;
export const ATTR_POOL = 78; // pontos para distribuir além da base

export function emptyAttrs(): Attrs {
  return { pace: ATTR_BASE, shooting: ATTR_BASE, passing: ATTR_BASE, dribbling: ATTR_BASE, defending: ATTR_BASE, physical: ATTR_BASE };
}

export function defaultDraft(): PlayerDraft {
  return {
    name: "",
    nationality: NATIONALITIES[0],
    position: "MEI",
    altPositions: [],
    preferredFoot: "Direito",
    weakFoot: 3,
    skillMoves: 3,
    heightCm: 177,
    weightKg: 71,
    age: 14,
    playStyle: "Maestro",
    attributes: emptyAttrs(),
  };
}

export function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// Aplica o bônus do estilo sobre os atributos (sem ultrapassar 99)
export function withStyleBonus(attrs: Attrs, styleName: string): Attrs {
  const style = PLAY_STYLES.find((s) => s.name === styleName);
  if (!style) return attrs;
  const out = { ...attrs };
  (Object.keys(out) as AttrKey[]).forEach((k) => {
    out[k] = clamp(out[k] + (style.bonus[k] ?? 0), 1, 99);
  });
  return out;
}

export function positionGroup(code: string): Position["group"] {
  return POSITIONS.find((p) => p.code === code)?.group ?? "MID";
}

export function computeOverall(attrs: Attrs, position: string): number {
  const w = WEIGHTS[positionGroup(position)];
  let sum = 0;
  let wsum = 0;
  (Object.keys(attrs) as AttrKey[]).forEach((k) => {
    sum += attrs[k] * w[k];
    wsum += w[k];
  });
  return Math.round(sum / wsum);
}

export function computePotential(overall: number, age: number): number {
  // mais jovem = mais espaço para crescer
  const room = clamp(36 - age, 4, 22);
  return clamp(overall + room, overall + 4, 94);
}

export function subValue(category: number, offset: number): number {
  return clamp(category + offset, 1, 99);
}

const DRAFT_KEY = "fmo.playerDraft";

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
