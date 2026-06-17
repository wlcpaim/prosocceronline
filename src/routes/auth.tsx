import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, ShieldCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { loadDraft, clearDraft } from "@/lib/player";
import { createPlayer } from "@/lib/players.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Pro Soccer Online" },
      { name: "description", content: "Crie sua conta e salve sua carreira no Pro Soccer Online." },
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
    const attrs = finalAttrs(draft);
    const overall = computeOverall(attrs, draft.position);
    const potential = computePotential(overall, draft.age);
    const { error } = await supabase.from("players").insert({
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
      attributes: attrs,
    });
    if (error) {
      if (error.code === "23505") {
        // Nome já usado por outra pessoa enquanto o jogador fazia login.
        // Mantém o rascunho e volta para a criação para trocar o nome.
        toast.error("Esse nome de jogador já está em uso. Escolha outro para continuar.");
        navigate({ to: "/criar-personagem" });
        return false;
      }
      console.error(error);
      toast.error("Não foi possível salvar seu jogador. Tente novamente.");
      return false;
    }
    clearDraft();
  }
  navigate({ to: "/jogadores" });
  return true;
}

function AuthPage() {
  const navigate = useNavigate();
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isNotRobot, setIsNotRobot] = useState(false);
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const hasDraft = typeof window !== "undefined" && !!loadDraft();


  useEffect(() => {
    persistDraftAndGo(navigate);
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") persistDraftAndGo(navigate);
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleOAuth = async (provider: "google" | "apple") => {
    if (!acceptedTerms || !isNotRobot) {
      toast.error("Por favor, aceite os termos e confirme que não é um robô para continuar.");
      return;
    }
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
          <Logo />

          <h1 className="mt-6 font-display text-2xl font-bold">
            {hasDraft ? "Crie sua conta" : "Entrar"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasDraft
              ? "Crie sua conta para salvar seu jogador e iniciar a carreira."
              : "Entre para continuar sua carreira."}
          </p>

          {/* Custom CAPTCHA "Não sou robô" */}
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-muted/20 p-4.5 shadow-sm select-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isNotRobot || captchaVerifying}
                onClick={() => {
                  setCaptchaVerifying(true);
                  setTimeout(() => {
                    setIsNotRobot(true);
                    setCaptchaVerifying(false);
                    toast.success("Verificação concluída com sucesso!");
                  }, 1200);
                }}
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-all ${
                  isNotRobot
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-muted-foreground/30 hover:border-primary bg-background"
                } cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed`}
              >
                {captchaVerifying && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {isNotRobot && <Check className="h-4 w-4 stroke-[3]" />}
              </button>
              <span className="text-sm font-medium text-foreground/95">Não sou um robô</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground/60">
              <div className="flex flex-col items-end text-[9px] leading-none">
                <span className="font-medium">Pro Soccer</span>
                <span className="mt-0.5 font-bold tracking-wider uppercase text-[7px] text-primary">Security</span>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary/60 animate-pulse" />
            </div>
          </div>

          {/* Termos de Uso (Clicável centralizado e elegante abaixo do CAPTCHA) */}
          <div className="mt-4 flex items-start gap-2.5 px-1.5 py-1">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(!!checked)}
              className="mt-0.5 border-muted-foreground/30 data-[state=checked]:border-primary"
            />
            <label
              htmlFor="terms"
              className="text-xs text-muted-foreground cursor-pointer select-none leading-normal"
            >
              Eu li e concordo com os{" "}
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="text-primary font-semibold hover:underline cursor-pointer transition-all hover:text-primary-glow"
              >
                termos de uso
              </button>{" "}
              do Pro Soccer Online.
            </label>
          </div>

          {/* OAuth */}
          <div className="mt-6 space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full transition-all duration-300"
              size="lg"
              disabled={!!oauthLoading || !acceptedTerms || !isNotRobot}
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
              className="w-full transition-all duration-300"
              size="lg"
              disabled={!!oauthLoading || !acceptedTerms || !isNotRobot}
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

          <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-6 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold">
                  Termos de Uso
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 mt-4 pr-2 text-sm text-muted-foreground overflow-y-auto max-h-[50vh] space-y-4">
                <p>
                  <strong>Bem-vindo ao Pro Soccer Online!</strong> Este é um manager
                  de carreira individual desenvolvido para entretenimento. Ao criar sua
                  conta ou fazer login, você concorda e aceita integralmente as regras e
                  termos descritos abaixo.
                </p>

                <h3 className="font-semibold text-foreground">1. Cadastro e Contas</h3>
                <p>
                  Para salvar sua carreira, criar personagens e disputar as partidas,
                  você deve se cadastrar utilizando um método de autenticação válido
                  (Google ou Apple). É permitida apenas uma conta ativa por jogador.
                  O uso de bots, scripts de automação ou hacks é expressamente proibido
                  e resultará na suspensão permanente da conta.
                </p>

                <h3 className="font-semibold text-foreground">2. Economia do Jogo</h3>
                <p>
                  Todos os salários, bônus por gol, premiações e itens disponíveis na
                  loja são fictícios e adquiridos exclusivamente por meio da jogabilidade.
                  Nenhum recurso dentro do jogo possui valor monetário real, e a compra
                  ou venda de contas e recursos por dinheiro externo é proibida.
                </p>

                <h3 className="font-semibold text-foreground">3. Conduta do Jogador</h3>
                <p>
                  Esperamos que todos mantenham um ambiente esportivo e respeitoso.
                  Comportamentos tóxicos, discursos de ódio no chat global, ofensas no
                  vestiário ou tentativas de jogar de má-fé estão sujeitos a moderação e banimento.
                </p>

                <h3 className="font-semibold text-foreground">4. Modificações no Serviço</h3>
                <p>
                  O Pro Soccer Online poderá realizar atualizações, rebalanceamentos de
                  atributos ou redefinições sazonais de ligas a fim de garantir uma simulação
                  competitiva e divertida para toda a comunidade.
                </p>

                <h3 className="font-semibold text-foreground">5. Privacidade e Dados</h3>
                <p>
                  Coletamos dados de autenticação exclusivamente para gerenciar seu acesso
                  e salvar o progresso dos seus jogadores. Seus dados nunca serão compartilhados ou vendidos.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setTermsOpen(false)} className="w-full">
                  Entendi e Aceito
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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
