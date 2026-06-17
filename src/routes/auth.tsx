import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trophy, Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  computeOverall,
  computePotential,
  loadDraft,
  clearDraft,
  withStyleBonus,
} from "@/lib/player";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Fut Manager Online" },
      { name: "description", content: "Crie sua conta e salve sua carreira no Fut Manager Online." },
    ],
  }),
  component: AuthPage,
});

async function persistDraftAndGo(navigate: ReturnType<typeof useNavigate>) {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return false;
  const userId = session.user.id;

  const draft = loadDraft();
  if (draft) {
    const finalAttrs = withStyleBonus(draft.attributes, draft.playStyle);
    const overall = computeOverall(finalAttrs, draft.position);
    const potential = computePotential(overall, draft.age);
    const { error } = await supabase.from("players").upsert(
      {
        user_id: userId,
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
        attributes: finalAttrs,
      },
      { onConflict: "user_id" },
    );
    if (error) {
      console.error(error);
      toast.error("Não foi possível salvar seu jogador. Tente novamente.");
      return false;
    }
    clearDraft();
  }
  navigate({ to: "/dashboard" });
  return true;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const hasDraft = typeof window !== "undefined" && !!loadDraft();

  // Se já estiver logado (ou voltar de um OAuth), segue o fluxo
  useEffect(() => {
    persistDraftAndGo(navigate);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") persistDraftAndGo(navigate);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/auth`,
      });
      if (result.error) {
        toast.error("Falha ao entrar. Tente novamente.");
        setOauthLoading(null);
        return;
      }
      if (result.redirected) return;
      await persistDraftAndGo(navigate);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao entrar. Tente novamente.");
    } finally {
      setOauthLoading(null);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          await persistDraftAndGo(navigate);
        } else {
          toast.success("Conta criada! Confirme seu e-mail para entrar.");
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("E-mail ou senha inválidos.");
          return;
        }
        await persistDraftAndGo(navigate);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="absolute inset-0 bg-hero-glow" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <Link
          to={hasDraft ? "/criar-personagem" : "/"}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {hasDraft ? "Voltar ao personagem" : "Voltar"}
        </Link>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Fut<span className="text-primary">Manager</span>
            </span>
          </div>

          <h1 className="mt-6 font-display text-2xl font-bold">
            {mode === "signup" ? "Crie sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasDraft
              ? "Crie sua conta para salvar seu jogador e iniciar a carreira."
              : mode === "signup"
                ? "Comece sua jornada rumo ao estrelato."
                : "Entre para continuar sua carreira."}
          </p>

          {/* OAuth */}
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={!!oauthLoading}
              onClick={() => handleOAuth("google")}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continuar com Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              size="lg"
              disabled={!!oauthLoading}
              onClick={() => handleOAuth("apple")}
            >
              {oauthLoading === "apple" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AppleIcon />
              )}
              Continuar com Apple
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou com e-mail
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-9"
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signup" ? "Criar conta e começar" : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="font-semibold text-primary hover:underline"
            >
              {mode === "signup" ? "Entrar" : "Criar conta"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M17.05 12.04c-.03-2.7 2.2-4 2.3-4.06-1.25-1.84-3.2-2.09-3.9-2.12-1.66-.17-3.24.98-4.08.98-.84 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.08 1.35 10.72.9 1.29 1.96 2.74 3.35 2.69 1.34-.05 1.85-.87 3.47-.87 1.62 0 2.08.87 3.5.84 1.45-.03 2.36-1.32 3.24-2.62 1.02-1.5 1.44-2.95 1.46-3.03-.03-.01-2.8-1.08-2.83-4.28zM14.4 4.16c.74-.9 1.24-2.15 1.1-3.4-1.07.05-2.36.72-3.13 1.61-.69.79-1.29 2.06-1.13 3.27 1.19.09 2.42-.6 3.16-1.48z" />
    </svg>
  );
}
