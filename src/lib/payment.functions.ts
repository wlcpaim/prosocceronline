import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Preço de acesso (em reais). Ajuste via env SYNCPAY_ACCESS_PRICE se quiser.
function getAccessPrice() {
  const fromEnv = Number(process.env.SYNCPAY_ACCESS_PRICE);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 19.9;
}

function webhookUrl() {
  // URL pública e estável que recebe a confirmação de pagamento da SyncPay.
  return (
    process.env.SYNCPAY_WEBHOOK_URL ||
    "https://prosocceronline.lovable.app/api/public/webhooks/syncpay"
  );
}

const chargeSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome completo.").max(120),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^\d{11}$/.test(v), "CPF inválido."),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => /^\d{10,11}$/.test(v), "Telefone inválido."),
});

export const createPixCharge = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => chargeSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId, claims } = context;

    // Já tem acesso? Não precisa cobrar de novo.
    const { data: hasAccess } = await context.supabase.rpc("has_access", {
      _user_id: userId,
    });
    if (hasAccess) {
      return { alreadyActive: true as const, pixCode: null, amount: 0 };
    }

    const email = (claims.email as string) || `${userId}@no-email.local`;
    const amount = getAccessPrice();

    const { createSyncPayCashIn } = await import("@/lib/syncpay.server");
    const result = await createSyncPayCashIn({
      amount,
      description: "Acesso Pro Soccer Online",
      client: { name: data.name, cpf: data.cpf, email, phone: data.phone },
      webhookUrl: webhookUrl(),
    });

    // Guarda os dados da cobrança (via service role, pois o usuário não pode
    // atualizar a própria assinatura diretamente).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("subscriptions")
      .update({
        provider: "syncpay",
        amount_cents: Math.round(amount * 100),
        external_id: result.identifier,
        payer_email: email,
        pix_code: result.pix_code,
        status: "pending",
      })
      .eq("user_id", userId);

    return {
      alreadyActive: false as const,
      pixCode: result.pix_code,
      identifier: result.identifier,
      amount,
    };
  });

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const [{ data: hasAccess }, { data: isAdmin }, { data: sub }] = await Promise.all([
      context.supabase.rpc("has_access", { _user_id: userId }),
      context.supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
      context.supabase
        .from("subscriptions")
        .select("status, pix_code, amount_cents")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    return {
      hasAccess: !!hasAccess,
      isAdmin: !!isAdmin,
      status: (sub?.status as string) ?? "pending",
      pixCode: (sub?.pix_code as string) ?? null,
    };
  });
