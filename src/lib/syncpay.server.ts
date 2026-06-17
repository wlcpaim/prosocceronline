// Server-only SyncPay (Pix) integration helpers.
// Never import this file from client/route components — only from *.functions.ts
// handlers or server route handlers.

const DEFAULT_API_URL = "https://api.syncpayments.com.br";

function getApiUrl() {
  return (process.env.SYNCPAY_API_URL || DEFAULT_API_URL).replace(/\/$/, "");
}

interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: string;
}

export async function getSyncPayToken(): Promise<string> {
  const clientId = process.env.SYNCPAY_CLIENT_ID;
  const clientSecret = process.env.SYNCPAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SyncPay não configurado: faltam SYNCPAY_CLIENT_ID/SYNCPAY_CLIENT_SECRET.");
  }

  const res = await fetch(`${getApiUrl()}/api/partner/v1/auth-token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[syncpay] auth-token falhou", res.status, text);
    throw new Error("Não foi possível autenticar com a SyncPay.");
  }

  const data = (await res.json()) as AuthTokenResponse;
  if (!data.access_token) throw new Error("SyncPay não retornou access_token.");
  return data.access_token;
}

interface CashInClient {
  name: string;
  cpf: string;
  email: string;
  phone: string;
}

interface CashInResponse {
  message: string;
  pix_code: string;
  identifier: string;
}

export async function createSyncPayCashIn(params: {
  amount: number;
  description: string;
  client: CashInClient;
  webhookUrl?: string;
}): Promise<CashInResponse> {
  const token = await getSyncPayToken();

  const body: Record<string, unknown> = {
    amount: params.amount,
    description: params.description,
    client: params.client,
  };
  if (params.webhookUrl) body.webhook_url = params.webhookUrl;

  const res = await fetch(`${getApiUrl()}/api/partner/v1/cash-in`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[syncpay] cash-in falhou", res.status, text);
    throw new Error("Não foi possível gerar a cobrança Pix.");
  }

  const data = (await res.json()) as CashInResponse;
  if (!data.pix_code) throw new Error("SyncPay não retornou o código Pix.");
  return data;
}
