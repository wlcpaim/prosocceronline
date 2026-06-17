// Configuração de preços e pré-venda — compartilhado entre cliente e servidor.

// Preço cheio do acesso (em reais).
export const FULL_PRICE = 49.99;

// Durante a pré-venda o acesso sai com 50% de desconto.
export const PRESALE_DISCOUNT = 0.5;
export const PRESALE_PRICE = Math.round(FULL_PRICE * (1 - PRESALE_DISCOUNT) * 100) / 100; // 24.99(5) -> 25.00

// Data/hora em que a pré-venda termina (30 dias). Após isso, sem desconto.
export const PRESALE_END = new Date("2026-07-17T03:00:00Z");

export function isPresaleActive(now: Date = new Date()): boolean {
  return now.getTime() < PRESALE_END.getTime();
}

// Preço atual em reais conforme o estado da pré-venda.
export function currentPrice(now: Date = new Date()): number {
  return isPresaleActive(now) ? PRESALE_PRICE : FULL_PRICE;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
