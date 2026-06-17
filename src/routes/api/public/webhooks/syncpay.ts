import { createFileRoute } from "@tanstack/react-router";

const PAID_STATUSES = new Set([
  "completed",
  "complete",
  "paid",
  "approved",
  "success",
  "succeeded",
  "confirmed",
]);

function pick<T = unknown>(obj: unknown, ...keys: string[]): T | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const rec = obj as Record<string, unknown>;
  for (const k of keys) {
    if (rec[k] !== undefined && rec[k] !== null) return rec[k] as T;
  }
  return undefined;
}

export const Route = createFileRoute("/api/public/webhooks/syncpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Verificação opcional de token compartilhado.
        const expectedToken = process.env.SYNCPAY_WEBHOOK_TOKEN;
        if (expectedToken) {
          const auth = request.headers.get("authorization") || "";
          const provided = auth.replace(/^Bearer\s+/i, "").trim();
          if (provided !== expectedToken) {
            return new Response("Unauthorized", { status: 401 });
          }
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const data = pick(body, "data") ?? body;
        const status = String(pick<string>(data, "status") ?? pick<string>(body, "status") ?? "").toLowerCase();
        const identifier =
          pick<string>(data, "id", "identifier") ?? pick<string>(body, "identifier", "id");
        const client = pick(data, "client") ?? pick(body, "client");
        const email = pick<string>(client, "email");

        if (!PAID_STATUSES.has(status)) {
          // Evento que não é de pagamento confirmado — apenas confirmamos recebimento.
          return Response.json({ ok: true, ignored: status || "unknown" });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Tenta casar pela referência da transação; senão, pelo e-mail do pagador.
        let matched = false;
        if (identifier) {
          const { data: rows, error } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active", activated_at: new Date().toISOString() })
            .eq("external_id", identifier)
            .neq("status", "active")
            .select("user_id");
          if (!error && rows && rows.length > 0) matched = true;
        }

        if (!matched && email) {
          const { data: rows, error } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "active", activated_at: new Date().toISOString() })
            .eq("payer_email", email)
            .neq("status", "active")
            .select("user_id");
          if (!error && rows && rows.length > 0) matched = true;
        }

        if (!matched) {
          console.warn("[syncpay webhook] pagamento sem assinatura correspondente", {
            identifier,
            email,
          });
        }

        return Response.json({ ok: true, matched });
      },
    },
  },
});
