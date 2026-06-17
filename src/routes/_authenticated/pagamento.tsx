import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, Copy, Check, ShieldCheck, ArrowLeft, QrCode, Smartphone, Apple, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { createPixCharge, getMyAccess } from "@/lib/payment.functions";

export const Route = createFileRoute("/_authenticated/pagamento")({
  head: () => ({
    meta: [{ title: "Liberar acesso — Pro Soccer Online" }],
  }),
  component: PaymentPage,
});

function maskCpf(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function PaymentPage() {
  const navigate = useNavigate();
  const charge = useServerFn(createPixCharge);
  const access = useServerFn(getMyAccess);

  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Verifica acesso inicial.
  useEffect(() => {
    (async () => {
      try {
        const a = await access({});
        if (a.hasAccess) {
          navigate({ to: "/jogadores" });
          return;
        }
        if (a.pixCode) setPixCode(a.pixCode);
      } catch {
        /* ignore */
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Faz polling do status enquanto houver um Pix gerado.
  useEffect(() => {
    if (!pixCode) return;
    pollRef.current = setInterval(async () => {
      try {
        const a = await access({});
        if (a.hasAccess) {
          if (pollRef.current) clearInterval(pollRef.current);
          toast.success("Pagamento confirmado! Acesso liberado.");
          navigate({ to: "/jogadores" });
        }
      } catch {
        /* ignore */
      }
    }, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await charge({ data: { name, cpf, phone } });
      if (res.alreadyActive) {
        navigate({ to: "/jogadores" });
        return;
      }
      if (res.pixCode) {
        setPixCode(res.pixCode);
        setAmount(res.amount);
        toast.success("Pix gerado! Escaneie ou copie o código para pagar.");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error && err.message.includes("inválido")
          ? err.message
          : "Não foi possível gerar o Pix. Verifique os dados e tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </button>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
          <Logo />

          {!pixCode ? (
            <>
              <div className="mt-6 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wide">Acesso vitalício</span>
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold">Libere seu acesso</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Pague via Pix para liberar sua carreira no Pro Soccer Online. A confirmação é
                automática.
              </p>

              <div className="mt-6 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Forma de pagamento
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-3 py-2.5 text-sm font-semibold text-foreground">
                    <QrCode className="h-4 w-4 text-primary" />
                    Pix
                  </div>
                  {[
                    { label: "Play Store", icon: Smartphone },
                    { label: "Apple", icon: Apple },
                    { label: "Cartão", icon: CreditCard },
                  ].map(({ label, icon: Icon }) => (
                    <div
                      key={label}
                      aria-disabled
                      className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm font-medium text-muted-foreground opacity-60"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex flex-col leading-none">
                        {label}
                        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-primary/70">
                          Em breve
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={cpf}
                    onChange={(e) => setCpf(maskCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Gerar Pix
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="mt-6 font-display text-2xl font-bold">Pague com Pix</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escaneie o QR Code{amount ? ` de R$ ${amount.toFixed(2).replace(".", ",")}` : ""} ou
                copie o código abaixo. A liberação é automática após o pagamento.
              </p>

              <div className="mt-6 flex justify-center rounded-2xl bg-white p-4">
                <QRCodeSVG value={pixCode} size={208} />
              </div>

              <div className="mt-4">
                <Label className="text-xs text-muted-foreground">Pix copia e cola</Label>
                <div className="mt-1.5 flex items-center gap-2">
                  <code className="flex-1 truncate rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs">
                    {pixCode}
                  </code>
                  <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando confirmação do pagamento...
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
