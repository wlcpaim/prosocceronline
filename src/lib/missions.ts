// Definições de missões (client-safe). O progresso e o resgate são validados
// no servidor (server-authoritative).

export type MissionMetric = "golPlayed" | "golWins" | "itemsOwned" | "players" | "level";

export interface MissionDef {
  id: string;
  title: string;
  desc: string;
  metric: MissionMetric;
  target: number;
  coins: number;
  xp: number;
}

export const MISSIONS: MissionDef[] = [
  {
    id: "estreante-pvp",
    title: "Estreante no PvP",
    desc: "Dispute 1 partida de Gol a Gol.",
    metric: "golPlayed",
    target: 1,
    coins: 5,
    xp: 10,
  },
  {
    id: "primeira-vitoria",
    title: "Primeira vitória",
    desc: "Vença 1 duelo de Gol a Gol.",
    metric: "golWins",
    target: 1,
    coins: 10,
    xp: 25,
  },
  {
    id: "pe-quente",
    title: "Pé quente",
    desc: "Vença 5 duelos de Gol a Gol.",
    metric: "golWins",
    target: 5,
    coins: 25,
    xp: 60,
  },
  {
    id: "matador",
    title: "Matador",
    desc: "Vença 15 duelos de Gol a Gol.",
    metric: "golWins",
    target: 15,
    coins: 80,
    xp: 200,
  },
  {
    id: "veterano",
    title: "Veterano",
    desc: "Dispute 20 partidas de Gol a Gol.",
    metric: "golPlayed",
    target: 20,
    coins: 50,
    xp: 120,
  },
  {
    id: "consumista",
    title: "Primeira compra",
    desc: "Compre 1 item na loja.",
    metric: "itemsOwned",
    target: 1,
    coins: 10,
    xp: 20,
  },
  {
    id: "colecionador",
    title: "Colecionador",
    desc: "Tenha 5 itens no inventário.",
    metric: "itemsOwned",
    target: 5,
    coins: 60,
    xp: 150,
  },
  {
    id: "craque-nivel-5",
    title: "Craque em ascensão",
    desc: "Alcance o nível 5.",
    metric: "level",
    target: 5,
    coins: 75,
    xp: 0,
  },
  {
    id: "multiverso",
    title: "Multiverso",
    desc: "Crie 2 jogadores diferentes.",
    metric: "players",
    target: 2,
    coins: 15,
    xp: 30,
  },
];

export interface MissionProgress {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  coins: number;
  xp: number;
  claimed: boolean;
  claimable: boolean;
}
