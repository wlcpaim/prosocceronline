// Simulação determinística de "pessoas online agora".
// O número oscila entre 1.245 e 10.000, com curva diária (vale de madrugada,
// pico à noite), dias mais cheios que outros e pequenas variações por
// minuto/segundo — dando a sensação de gente entrando e saindo em tempo real.
// É 100% calculado a partir do relógio, então todos os visitantes veem
// aproximadamente o mesmo valor no mesmo instante.

const MIN = 1245;
const MAX = 10000;
const DAY = 86_400_000; // ms em 24h

function frac(n: number): number {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
}

export function onlinePlayers(date: Date = new Date()): number {
  const t = date.getTime();
  const dayIndex = Math.floor(t / DAY);
  const dayFrac = (t % DAY) / DAY; // 0..1 ao longo do dia (UTC)

  // Curva diária: mínimo por volta das 05h, pico por volta das 21h.
  const diurnal = 0.5 - 0.5 * Math.cos((dayFrac - 0.2083) * 2 * Math.PI); // 0..1

  // Intensidade do dia: alguns dias bem mais cheios, outros mais fracos.
  let intensity = 0.55 + frac(dayIndex * 1.37) * 0.45; // 0.55..1.0
  if (frac(dayIndex * 7.13) > 0.82) intensity = Math.max(intensity, 0.95); // "dia de pico"

  // Valor normalizado base (sempre mantém uma plateia mínima).
  let norm = 0.12 + diurnal * 0.88 * intensity;

  // Ondulações em escalas diferentes (horas, minutos, segundos).
  norm += Math.sin((t / (DAY / 24)) * 0.7) * 0.035;
  norm += Math.sin((t / 60_000) * 1.3) * 0.02;
  norm += Math.sin((t / 1000) * 2.1) * 0.008;

  norm = Math.min(1, Math.max(0, norm));

  return Math.round(MIN + norm * (MAX - MIN));
}
