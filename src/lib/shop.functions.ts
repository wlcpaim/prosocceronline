import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getShopItem } from "@/lib/shop-items";

export interface ShopState {
  coins: number;
  owned: string[];
}

// Garante que a carteira exista e devolve o saldo atual (servidor-autoritativo).
async function ensureWallet(userId: string): Promise<number> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("wallets")
    .select("coins")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) return data.coins as number;
  const { data: created } = await supabaseAdmin
    .from("wallets")
    .insert({ user_id: userId, coins: 1000 })
    .select("coins")
    .maybeSingle();
  return (created?.coins as number | undefined) ?? 1000;
}

export const getShop = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const coins = await ensureWallet(context.userId);
    const { data: owned } = await supabaseAdmin
      .from("purchases")
      .select("item_id")
      .eq("user_id", context.userId);
    return {
      coins,
      owned: (owned ?? []).map((p) => p.item_id as string),
    } as ShopState;
  });

export const buyItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { itemId: string }) => {
    if (!input || typeof input.itemId !== "string") throw new Error("Item inválido");
    return input;
  })
  .handler(async ({ data, context }) => {
    const item = getShopItem(data.itemId);
    if (!item) throw new Error("Item inexistente");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const coins = await ensureWallet(context.userId);

    // Já comprado? Loja de teste — impede compra duplicada.
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", context.userId)
      .eq("item_id", item.id)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, reason: "owned" as const, coins };
    }

    if (coins < item.price) {
      return { ok: false as const, reason: "insufficient" as const, coins };
    }

    const newBalance = coins - item.price;
    await supabaseAdmin.from("wallets").update({ coins: newBalance }).eq("user_id", context.userId);
    await supabaseAdmin.from("purchases").insert({
      user_id: context.userId,
      item_id: item.id,
      item_name: item.name,
      price: item.price,
    });

    return { ok: true as const, coins: newBalance };
  });
