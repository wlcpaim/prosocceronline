// Catálogo da lojinha (moeda do jogo). Client-safe: usado tanto na UI quanto
// validado no servidor antes de descontar moedas.
export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  price: number;
  icon: "boots" | "ball" | "shirt" | "energy" | "badge" | "star";
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "boots-basic",
    name: "Chuteira de Treino",
    desc: "Equipamento básico para acelerar a evolução nos treinos.",
    price: 250,
    icon: "boots",
  },
  {
    id: "ball-gold",
    name: "Bola de Ouro",
    desc: "Item de coleção que aumenta seu prestígio na Escola.",
    price: 600,
    icon: "ball",
  },
  {
    id: "kit-pro",
    name: "Uniforme Pro",
    desc: "Visual profissional para entrar em campo com estilo.",
    price: 400,
    icon: "shirt",
  },
  {
    id: "energy-pack",
    name: "Pacote de Energia",
    desc: "Recupera o fôlego para disputar mais duelos Gol a Gol.",
    price: 150,
    icon: "energy",
  },
  {
    id: "badge-captain",
    name: "Braçadeira de Capitão",
    desc: "Símbolo de liderança no vestiário.",
    price: 800,
    icon: "badge",
  },
  {
    id: "star-pack",
    name: "Pacote Craque",
    desc: "Brilhe nas tabelas com o item mais cobiçado da temporada.",
    price: 1200,
    icon: "star",
  },
];

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find((i) => i.id === id);
}
