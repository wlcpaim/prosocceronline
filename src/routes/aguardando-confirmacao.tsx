import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MailCheck, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  computeOverall,
  computePotential,
  loadDraft,
  clearDraft,
  finalAttrs,
} from "@/lib/player";

export const Route = createFileRoute("/aguardando-confirmacao")({
  head: () => ({
    meta: [
      { title: "Confirme seu e-mail — Pro Soccer Online" },
      {
        name: "description",
        content: "Confirme seu e-mail para ativar sua conta no Pro Soccer Online.",
      },
    ],
  }),
  component: AwaitingConfirmationPage,
});

const PENDING_EMAIL_KEY = "pso_pending_email";

async function persistDraftIfAny() {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return;
  const draft = loadDraft();
  if (!draft) return;
  const attrs = finalAttrs(draft);
  const overall = computeOverall(attrs, draft.position);
  const potential = computePotential(overall, draft.age);
  const { error } = await supabase.from("players").insert({
    user_id: session.user.id,
    name: draft.name,
    nationality: draft.nationality,
    position: draft.position,
    alt_positions: draft.altPositions,
    preferred_foot: draft.preferredFoot,
    weak_foot: draft.weakFoot,
    skill_moves: draft.skillMoves,
    height_cm: draft.heightCm,
    weight_kg: draft.weightKg,
    age: draft.age,
    play_style: draft.playStyle,
    overall,
    potential,
    attributes: attrs,
  });
  if (!error) clearDraft();
}

function AwaitingConfirmationPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem(PENDING_EMAIL_KEY) ?? "");

    const finish = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await persistDraftIfAny();
        localStorage.removeItem(PENDING_EMAIL_KEY);
        toast.success("E-mail confirmado! Bem-vindo ao Pro Soccer Online.");
        navigate({ to: "/" });
      }
    };

    // Caso o usuário abra o link de confirmação nesta mesma aba.
    finish();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") finish();
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    if (!email) {
      toast.error("Não encontramos seu e-mail. Faça o cadastro novamente.");
      return;
    }
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/aguardando-confirmacao` },
      });
      if (error) {
        toast.error("Não foi possível reenviar. Tente em alguns instantes.");
        return;
      }
      toast.success("E-mail de confirmação reenviado!");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/auth"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-elevated sm:p-8">
          <Logo />

          <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold">Confirme seu e-mail</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de confirmação{email ? " para " : "."}
            {email && <span className="font-semibold text-foreground">{email}</span>}
            {email && "."}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Abra seu e-mail e clique no link para ativar sua conta. Esta página
            redireciona sozinha assim que a confirmação for concluída.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Aguardando confirmação...
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 w-full"
            disabled={resending}
            onClick={handleResend}
          >
            {resending && <Loader2 className="h-4 w-4 animate-spin" />}
            Reenviar e-mail de confirmação
          </Button>
        </div>
      </div>
    </div>
  );
}
