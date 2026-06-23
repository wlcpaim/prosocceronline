import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getShopItem } from "@/lib/shop-items";
import { levelFromXp } from "@/lib/progression";
import { positionGroup } from "@/lib/player";

export interface OwnedItem {
  itemId: string;
  quantity: number;
}

export interface ShopState {
  coins: number;
  xp: number;
  level: number;
  owned: OwnedItem[];
}

// Garante que a carteira exista e devolve coins/xp/level (servidor-autoritativo).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureWallet(supabaseAdmin: any, userId: string) {
  const { data } = await supabaseAdmin
    .from("wallets")
    .select("coins, xp, level")
    .eq("user_id", userId)
    .maybeSingle();
  if (data) {
    return {
      coins: data.coins as number,
      xp: (data.xp as number) ?? 0,
      level: (data.level as number) ?? 1,
    };
  }
  const { data: created } = await supabaseAdmin
    .from("wallets")
    .insert({ user_id: userId, coins: 1000, xp: 0, level: 1 })
    .select("coins, xp, level")
    .maybeSingle();
  return {
    coins: (created?.coins as number | undefined) ?? 1000,
    xp: 0,
    level: 1,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ownedItems(supabaseAdmin: any, userId: string): Promise<OwnedItem[]> {
  const { data } = await supabaseAdmin
    .from("inventory")
    .select("item_id, quantity")
    .eq("user_id", userId)
    .gt("quantity", 0);
  return ((data ?? []) as { item_id: string; quantity: number }[]).map((r) => ({
    itemId: r.item_id,
    quantity: r.quantity,
  }));
}

export const getShop = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ShopState> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const wallet = await ensureWallet(supabaseAdmin, context.userId);
    const owned = await ownedItems(supabaseAdmin, context.userId);
    return { ...wallet, owned };
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
    const wallet = await ensureWallet(supabaseAdmin, context.userId);

    const { data: existing } = await supabaseAdmin
      .from("inventory")
      .select("id, quantity")
      .eq("user_id", context.userId)
      .eq("item_id", item.id)
      .maybeSingle();

    // Itens permanentes não podem ser comprados duas vezes.
    if (item.kind === "permanent" && existing) {
      return { ok: false as const, reason: "owned" as const, coins: wallet.coins };
    }

    if (wallet.coins < item.price) {
      return { ok: false as const, reason: "insufficient" as const, coins: wallet.coins };
    }

    const newBalance = wallet.coins - item.price;
    await supabaseAdmin.from("wallets").update({ coins: newBalance }).eq("user_id", context.userId);

    if (existing) {
      await supabaseAdmin
        .from("inventory")
        .update({ quantity: (existing.quantity as number) + 1 })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("inventory").insert({
        user_id: context.userId,
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: 1,
      });
    }

    return { ok: true as const, coins: newBalance };
  });

// Consome um item (energético): remove os cooldowns do treino por 1 minuto.
export const useConsumable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { itemId: string; playerId: string }) => {
    if (!input?.itemId || !input?.playerId) throw new Error("Dados inválidos");
    return input;
  })
  .handler(async ({ data, context }) => {
    const item = getShopItem(data.itemId);
    if (!item || item.kind !== "consumable") {
      return { ok: false as const, reason: "invalid" as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirma que o jogador pertence ao usuário.
    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, user_id")
      .eq("id", data.playerId)
      .maybeSingle();
    if (!player || player.user_id !== context.userId) {
      return { ok: false as const, reason: "invalid" as const };
    }

    const { data: row } = await supabaseAdmin
      .from("inventory")
      .select("id, quantity")
      .eq("user_id", context.userId)
      .eq("item_id", item.id)
      .maybeSingle();
    if (!row || (row.quantity as number) <= 0) {
      return { ok: false as const, reason: "empty" as const };
    }

    // Garante a linha de treino e aplica o impulso de 1 minuto.
    const { data: training } = await supabaseAdmin
      .from("player_training")
      .select("player_id")
      .eq("player_id", data.playerId)
      .maybeSingle();
    if (!training) {
      await supabaseAdmin.from("player_training").insert({ player_id: data.playerId });
    }
    const boostUntil = new Date(Date.now() + 60 * 1000).toISOString();
    await supabaseAdmin
      .from("player_training")
      .update({ boost_until: boostUntil })
      .eq("player_id", data.playerId);

    await supabaseAdmin
      .from("inventory")
      .update({ quantity: (row.quantity as number) - 1 })
      .eq("id", row.id);

    return { ok: true as const, boostUntil };
  });

// Equipa (ou desequipa, com itemId = null) uma chuteira em um jogador.
export const equipCleat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { playerId: string; itemId: string | null }) => {
    if (!input?.playerId) throw new Error("Jogador obrigatório");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: player } = await supabaseAdmin
      .from("players")
      .select("id, user_id, position, overall")
      .eq("id", data.playerId)
      .maybeSingle();
    if (!player || player.user_id !== context.userId) {
      return { ok: false as const, reason: "invalid" as const };
    }

    if (data.itemId) {
      const item = getShopItem(data.itemId);
      if (!item?.cleat) return { ok: false as const, reason: "invalid" as const };
      const { data: owns } = await supabaseAdmin
        .from("inventory")
        .select("id")
        .eq("user_id", context.userId)
        .eq("item_id", data.itemId)
        .maybeSingle();
      if (!owns) return { ok: false as const, reason: "notowned" as const };
    }

    await supabaseAdmin
      .from("players")
      .update({ equipped_cleat: data.itemId })
      .eq("id", data.playerId);

    // Mantém position para uso futuro; cálculo de bônus acontece no Gol a Gol.
    void positionGroup;
    void levelFromXp;
    return { ok: true as const, equippedCleat: data.itemId };
  });
