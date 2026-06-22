import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Loader2,
  Swords,
  Trophy,
  Target,
  X,
  Coins,
  Sparkles,
  Circle,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  joinGolQueue,
  getGolMatch,
  cancelGolQueue,
  type GolMatch,
  type GolRound,
} from "@/lib/golagol.functions";
import { POSITIONS } from "@/lib/player";

export const Route = createFileRoute("/_authenticated/gol-a-gol")({
  head: () => ({
    meta: [{ title: "Gol a Gol — Pro Soccer Online" }],
  }),
  component: GolAGolPage,
});

interface MyPlayer {
  id: string;
  name: string;
  overall: number;
  position: string;
}

type Phase = "loading" | "no-player" | "idle" | "searching" | "reveal" | "result";

function positionLabel(code: string) {
  return POSITIONS.find((p) => p.code === code)?.label ?? code;
}

function GolAGolPage() {
  const join = useServerFn(joinGolQueue);
  const poll = useServerFn(getGolMatch);
  const cancel = useServerFn(cancelGolQueue);

  const [players, setPlayers] = useState<MyPlayer[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("loading");
  const [match, setMatch] = useState<GolMatch | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Carrega os jogadores do usuário.
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("players")
        .select("id, name, overall, position")
        .order("overall", { ascending: false });
      const rows = (data as MyPlayer[] | null) ?? [];
      setPlayers(rows);
      if (rows.length === 0) {
        setPhase("no-player");
      } else {
        setSelectedId(rows[0].id);
        setPhase("idle");
      }
    })();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const selected = players.find((p) => p.id === selectedId) ?? null;

  const startReveal = useCallback((m: GolMatch) => {
    setMatch(m);
    setRevealCount(0);
    setPhase("reveal");
  }, []);

  // Animação de revelação rodada a rodada.
  useEffect(() => {
    if (phase !== "reveal" || !match?.rounds) return;
    if (revealCount >= match.rounds.length) {
      const t = setTimeout(() => setPhase("result"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealCount((c) => c + 1), 800);
    return () => clearTimeout(t);
  }, [phase, revealCount, match]);

  const handleSearch = useCallback(async () => {
    if (!selected) return;
    setPhase("searching");
    try {
      const m = await join({ data: { playerId: selected.id } });
      if (!m) {
        setPhase("idle");
        return;
      }
      if (m.status === "finished") {
        startReveal(m);
        return;
      }
      setMatch(m);
      // Aguardando oponente: faz polling.
      pollRef.current = setInterval(async () => {
        try {
          const updated = await poll({ data: { matchId: m.id } });
          if (updated && updated.status === "finished") {
            if (pollRef.current) clearInterval(pollRef.current);
            startReveal(updated);
          }
        } catch {
          /* tenta de novo no próximo tick */
        }
      }, 2500);
    } catch {
      setPhase("idle");
    }
  }, [selected, join, poll, startReveal]);

  const handleCancel = useCallback(async () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (match) {
      try {
        await cancel({ data: { matchId: match.id } });
      } catch {
        /* ignore */
      }
    }
    setMatch(null);
    setPhase("idle");
  }, [match, cancel]);

  const playAgain = useCallback(() => {
    setMatch(null);
    setRevealCount(0);
    setPhase("idle");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Topbar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card/80 px-5 py-3 backdrop-blur-xl">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link to="/jogadores">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
            <Swords className="h-5 w-5" />
          </span>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Jogos · PvP
            </div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Gol a Gol — x1</h1>
          </div>
        </div>

        {phase === "loading" && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {phase === "no-player" && (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-display text-xl font-bold">Crie um jogador primeiro</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você precisa de um craque para disputar o Gol a Gol.
            </p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/criar-personagem">Criar jogador</Link>
            </Button>
          </div>
        )}

        {phase === "idle" && selected && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Seu representante
                </span>
                {players.length > 1 && (
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-sm text-foreground"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.overall})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full border-2 border-primary/40 bg-surface-elevated font-display text-2xl font-bold text-primary">
                  {selected.overall}
                </span>
                <div>
                  <div className="font-display text-lg font-bold">{selected.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {positionLabel(selected.position)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 text-center">
              <Target className="mx-auto h-7 w-7 text-accent" />
              <h2 className="mt-3 font-display text-lg font-bold">Disputa de 5 cobranças</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Você é pareado com outro jogador de verdade. Cada craque cobra; quem fizer mais
                gols vence. Empate vai para a morte súbita.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-1.5 text-sm">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-muted-foreground">
                  Vitória <strong className="text-foreground">+50</strong> · Participação{" "}
                  <strong className="text-foreground">+15</strong>
                </span>
              </div>
              <Button variant="hero" size="lg" className="mt-6 w-full sm:w-auto px-10" onClick={handleSearch}>
                <Swords className="h-5 w-5" /> Procurar partida
              </Button>
            </div>
          </div>
        )}

        {phase === "searching" && (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-5 font-display text-xl font-bold">Procurando oponente...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aguardando outro jogador entrar na fila do Gol a Gol.
            </p>
            <Button variant="outline" className="mt-6" onClick={handleCancel}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
          </div>
        )}

        {(phase === "reveal" || phase === "result") && match && (
          <MatchView match={match} revealCount={revealCount} onPlayAgain={playAgain} phase={phase} />
        )}
      </main>
    </div>
  );
}

function liveScore(rounds: GolRound[], count: number, side: "p1" | "p2") {
  return rounds.slice(0, count).filter((r) => r[side]).length;
}

function MatchView({
  match,
  revealCount,
  onPlayAgain,
  phase,
}: {
  match: GolMatch;
  revealCount: number;
  onPlayAgain: () => void;
  phase: Phase;
}) {
  const rounds = match.rounds ?? [];
  const youName = match.youAreP1 ? match.p1Name : match.p2Name ?? "Você";
  const oppName = match.youAreP1 ? match.p2Name ?? "Oponente" : match.p1Name;
  const youSide: "p1" | "p2" = match.youAreP1 ? "p1" : "p2";
  const oppSide: "p1" | "p2" = match.youAreP1 ? "p2" : "p1";
  const youScore = liveScore(rounds, revealCount, youSide);
  const oppScore = liveScore(rounds, revealCount, oppSide);

  return (
    <div className="space-y-6">
      <NarrationFeed
        rounds={rounds}
        revealCount={revealCount}
        youName={youName}
        oppName={oppName}
        youSide={youSide}
        oppSide={oppSide}
        phase={phase}
        outcome={match.outcome ?? null}
      />

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-6">
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-primary/40 bg-surface-elevated font-display text-lg font-bold text-primary">
              {youName.slice(0, 2).toUpperCase()}
            </div>
            <div className="mt-2 truncate text-sm font-semibold">{youName}</div>
            <div className="text-[10px] uppercase tracking-wide text-primary">Você</div>
          </div>
          <div className="px-2 text-center">
            <div className="font-display text-4xl font-bold tabular-nums">
              {youScore}
              <span className="px-2 text-muted-foreground">×</span>
              {oppScore}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
              Gol a Gol
            </div>
          </div>
          <div className="text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-border bg-surface-elevated font-display text-lg font-bold text-muted-foreground">
              {oppName.slice(0, 2).toUpperCase()}
            </div>
            <div className="mt-2 truncate text-sm font-semibold">{oppName}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Oponente</div>
          </div>
        </div>

        {/* Cobranças */}
        <div className="border-t border-border px-6 py-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Cobranças
          </div>
          <div className="space-y-3">
            {[youSide, oppSide].map((side, idx) => (
              <div key={side} className="flex items-center gap-2">
                <span className="w-20 flex-shrink-0 truncate text-xs text-muted-foreground">
                  {idx === 0 ? "Você" : "Oponente"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {rounds.map((r, i) => {
                    const revealed = i < revealCount;
                    const scored = r[side];
                    return (
                      <span
                        key={i}
                        className={`grid h-6 w-6 place-items-center rounded-full border transition-all ${
                          !revealed
                            ? "border-border bg-surface-elevated text-muted-foreground/40"
                            : scored
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-border bg-surface-elevated text-muted-foreground"
                        }`}
                      >
                        {!revealed ? (
                          <Circle className="h-3 w-3" />
                        ) : scored ? (
                          <CircleDot className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3 w-3" />
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {phase === "result" && (
        <div
          className={`rounded-3xl border p-7 text-center ${
            match.outcome === "win"
              ? "border-primary/50 bg-primary/10"
              : match.outcome === "loss"
                ? "border-border bg-card"
                : "border-border bg-card"
          }`}
        >
          <Trophy
            className={`mx-auto h-9 w-9 ${
              match.outcome === "win" ? "text-yellow-400" : "text-muted-foreground"
            }`}
          />
          <h2 className="mt-3 font-display text-2xl font-bold">
            {match.outcome === "win"
              ? "Vitória!"
              : match.outcome === "loss"
                ? "Derrota"
                : "Empate"}
          </h2>
          {match.coinsAwarded != null && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-1.5 text-sm">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="font-semibold text-foreground">+{match.coinsAwarded} moedas</span>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="hero" size="lg" onClick={onPlayAgain}>
              <Swords className="h-5 w-5" /> Jogar de novo
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/jogadores">Voltar</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
