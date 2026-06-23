// Catálogo da loja (moeda do jogo = R$ fictícios). Client-safe: usado na UI e
// validado no servidor antes de descontar o saldo.
import type { PosGroup } from "@/lib/player";

import iphone17 from "@/assets/shop/iphone-17.jpg";
import iphone17air from "@/assets/shop/iphone-17-air.jpg";
import iphone17pro from "@/assets/shop/iphone-17-pro.jpg";
import iphone16 from "@/assets/shop/iphone-16.jpg";
import iphone16pro from "@/assets/shop/iphone-16-pro.jpg";
import cleatNike from "@/assets/shop/cleat-nike.jpg";
import cleatAdidas from "@/assets/shop/cleat-adidas.jpg";
import cleatPuma from "@/assets/shop/cleat-puma.jpg";
import cleatMizuno from "@/assets/shop/cleat-mizuno.jpg";
import cleatNewBalance from "@/assets/shop/cleat-newbalance.jpg";
import energyDrink from "@/assets/shop/energy-drink.jpg";

export type ShopCategory = "apple" | "chuteiras" | "consumiveis";
export type ItemKind = "permanent" | "consumable";

export interface CleatSpec {
  // Grupos de posição para os quais a chuteira foi feita.
  groups: PosGroup[];
  // Bônus de overall quando o jogador é do tipo certo / de outro tipo.
  matchBonus: number;
  baseBonus: number;
  // Atributos exclusivos exibidos na loja.
  perks: { label: string; value: string }[];
}

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  category: ShopCategory;
  kind: ItemKind;
  image: string;
  // Apenas para chuteiras.
  cleat?: CleatSpec;
}

const APPLE: ShopItem[] = [
  {
    id: "iphone-17-pro-max",
    name: "iPhone 17 Pro Max",
    desc: "O topo de linha em titânio. Tela ProMotion gigante e câmera tripla profissional.",
    price: 12000,
    category: "apple",
    kind: "permanent",
    image: iphone17pro,
  },
  {
    id: "iphone-17-pro",
    name: "iPhone 17 Pro",
    desc: "Titânio, desempenho extremo e sistema de câmeras Pro em corpo compacto.",
    price: 10000,
    category: "apple",
    kind: "permanent",
    image: iphone17pro,
  },
  {
    id: "iphone-17-air",
    name: "iPhone 17 Air",
    desc: "O iPhone mais fino de todos. Leveza absurda sem abrir mão do poder.",
    price: 9000,
    category: "apple",
    kind: "permanent",
    image: iphone17air,
  },
  {
    id: "iphone-17",
    name: "iPhone 17",
    desc: "Cores vibrantes, tela maior e o chip mais rápido da geração padrão.",
    price: 8000,
    category: "apple",
    kind: "permanent",
    image: iphone17,
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    desc: "A geração Pro Max anterior em titânio natural. Ainda imbatível.",
    price: 9000,
    category: "apple",
    kind: "permanent",
    image: iphone16pro,
  },
  {
    id: "iphone-16-pro",
    name: "iPhone 16 Pro",
    desc: "Acabamento em titânio, câmera Pro e botão de ação personalizável.",
    price: 7500,
    category: "apple",
    kind: "permanent",
    image: iphone16pro,
  },
  {
    id: "iphone-16-plus",
    name: "iPhone 16 Plus",
    desc: "Tela ampla e bateria de longa duração para o dia inteiro.",
    price: 6500,
    category: "apple",
    kind: "permanent",
    image: iphone16,
  },
  {
    id: "iphone-16",
    name: "iPhone 16",
    desc: "Equilíbrio perfeito entre preço, câmera e desempenho.",
    price: 6000,
    category: "apple",
    kind: "permanent",
    image: iphone16,
  },
  {
    id: "iphone-16e",
    name: "iPhone 16e",
    desc: "A porta de entrada da linha 16, com o essencial que você precisa.",
    price: 4500,
    category: "apple",
    kind: "permanent",
    image: iphone16,
  },
];

const CLEAT_PRICE = 1500;

const CLEATS: ShopItem[] = [
  {
    id: "cleat-nike-mercurial",
    name: "Nike Mercurial — Atacante",
    desc: "Feita para atacantes: explosão de velocidade e faro de gol.",
    price: CLEAT_PRICE,
    category: "chuteiras",
    kind: "permanent",
    image: cleatNike,
    cleat: {
      groups: ["WG", "SS", "ST"],
      matchBonus: 5,
      baseBonus: 1,
      perks: [
        { label: "Ritmo", value: "+9" },
        { label: "Finalização", value: "+7" },
        { label: "Drible", value: "+4" },
      ],
    },
  },
  {
    id: "cleat-adidas-predator",
    name: "adidas Predator — Meio-campo",
    desc: "Controle total para meias: passe milimétrico e domínio de bola.",
    price: CLEAT_PRICE,
    category: "chuteiras",
    kind: "permanent",
    image: cleatAdidas,
    cleat: {
      groups: ["DM", "CM", "AM"],
      matchBonus: 5,
      baseBonus: 1,
      perks: [
        { label: "Passe", value: "+9" },
        { label: "Drible", value: "+6" },
        { label: "Físico", value: "+4" },
      ],
    },
  },
  {
    id: "cleat-puma-future",
    name: "Puma Future — Zagueiro",
    desc: "Robusta e firme: feita para defensores que não passam na bola.",
    price: CLEAT_PRICE,
    category: "chuteiras",
    kind: "permanent",
    image: cleatPuma,
    cleat: {
      groups: ["CB", "FB"],
      matchBonus: 5,
      baseBonus: 1,
      perks: [
        { label: "Defesa", value: "+9" },
        { label: "Físico", value: "+7" },
        { label: "Ritmo", value: "+4" },
      ],
    },
  },
  {
    id: "cleat-newbalance-furon",
    name: "New Balance Furon — Goleiro",
    desc: "Aderência e estabilidade para goleiros dominarem a área.",
    price: CLEAT_PRICE,
    category: "chuteiras",
    kind: "permanent",
    image: cleatNewBalance,
    cleat: {
      groups: ["GK"],
      matchBonus: 5,
      baseBonus: 1,
      perks: [
        { label: "Goleiro", value: "+9" },
        { label: "Reflexos", value: "+7" },
        { label: "Defesa", value: "+4" },
      ],
    },
  },
  {
    id: "cleat-mizuno-morelia",
    name: "Mizuno Morelia — Equilíbrio",
    desc: "Couro clássico para qualquer posição: bônus equilibrado em campo.",
    price: CLEAT_PRICE,
    category: "chuteiras",
    kind: "permanent",
    image: cleatMizuno,
    cleat: {
      groups: ["GK", "CB", "FB", "DM", "CM", "AM", "WG", "SS", "ST"],
      matchBonus: 3,
      baseBonus: 3,
      perks: [
        { label: "Todos os atributos", value: "+3" },
        { label: "Conforto", value: "Máx" },
      ],
    },
  },
];

const CONSUMABLES: ShopItem[] = [
  {
    id: "consumable-energy",
    name: "Energético Turbo Treino",
    desc: "Ao consumir, remove todas as esperas (cooldowns) do treino por 1 minuto. Treine à vontade!",
    price: 100,
    category: "consumiveis",
    kind: "consumable",
    image: energyDrink,
  },
];

export const SHOP_ITEMS: ShopItem[] = [...APPLE, ...CLEATS, ...CONSUMABLES];

export const SHOP_CATEGORIES: { key: ShopCategory; label: string }[] = [
  { key: "apple", label: "Apple" },
  { key: "chuteiras", label: "Chuteiras" },
  { key: "consumiveis", label: "Consumíveis" },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}

// Bônus de overall que uma chuteira concede a um jogador, conforme a posição.
export function cleatOverallBonus(itemId: string | null | undefined, group: PosGroup): number {
  if (!itemId) return 0;
  const item = getShopItem(itemId);
  if (!item?.cleat) return 0;
  return item.cleat.groups.includes(group) ? item.cleat.matchBonus : item.cleat.baseBonus;
}
