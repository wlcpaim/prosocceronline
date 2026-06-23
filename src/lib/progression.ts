// Sistema de progressão (XP / nível). Client-safe e puro — usado tanto na UI
// quanto no servidor (server-authoritative) para calcular nível a partir do XP.
//
// Regra: para subir do nível 1 para o 2 são necessários 100 de XP. A cada nível
// o custo dobra (200, 400, 800, ...).

// XP necessário para ir do nível atual para o próximo.
export function xpForNext(level: number): number {
  return 100 * Math.pow(2, level - 1);
}

// XP acumulado total para alcançar um determinado nível.
export function totalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return 100 * (Math.pow(2, level - 1) - 1);
}

// Nível correspondente a uma quantidade total de XP.
export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= totalXpForLevel(level + 1)) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  pct: number;
}

export function progress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const base = totalXpForLevel(level);
  const need = xpForNext(level);
  const into = Math.max(0, xp - base);
  return {
    level,
    xpIntoLevel: into,
    xpForLevel: need,
    pct: Math.min(100, Math.round((into / need) * 100)),
  };
}
