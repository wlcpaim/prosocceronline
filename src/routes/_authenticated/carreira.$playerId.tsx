import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Star,
  Crown,
  TrendingUp,
  Trophy,
  Ruler,
  Weight,
  Flag,
  Footprints,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/PlayerCard";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  categoryValue,
  playerSlug,
  POSITIONS,
  PLAY_STYLES,
  type Attrs,
} from "@/lib/player";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/_authenticated/carreira/$playerId")({
  head: () => ({
    meta: [{ title: "Minha Carreira — Pro Soccer Online" }],
  }),
  component: CarreiraPage,
});

interface PlayerRow {
  id: string;
  name: string;
  nationality: string | null;
  position: string;
  alt_positions: string[] | null;
  preferred_foot: string | null;
  weak_foot: number;
  skill_moves: number;
  height_cm: number;
  weight_kg: number;
  age: number;
  play_style: string | null;
  overall: number;
  potential: number;
  attributes: Attrs;
  created_at: string;
}

function positionLabel(code: string) {
  return POSITIONS.find((p) => p.code === code)?.label ?? code;
}

function playStyleDesc(name: string | null) {
  return PLAY_STYLES.find((s) => s.name === name)?.desc ?? "";
}

function CarreiraPage() {
  return <CarreiraInner />;
}

function CarreiraInner() {
  const { playerId } = Route.useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("players")
        .select("*")
        .eq("id", playerId)
        .maybeSingle();
      setPlayer((data as PlayerRow | null) ?? null);
      setLoading(false);
    })();
  }, [playerId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5 text-center">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-bold">Jogador não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este jogador não existe ou não pertence à sua conta.
          </p>
          <Button variant="hero" size="lg" className="mt-6" asChild>
            <Link to="/jogadores">Voltar aos jogadores</Link>
          </Button>
        </div>
      </div>
    );
  }

  const memberSince = new Date(player.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/jogadores" })}>
            <ArrowLeft className="h-4 w-4" /> Jogadores
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Minha Carreira</p>
          <h1 className="font-display text-3xl font-bold">
            <span className="text-gradient">{player.name}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Carreira individual — esta evolução pertence apenas a este jogador.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <PlayerCard
              name={player.name}
              position={player.position}
              altPositions={player.alt_positions ?? undefined}
              nationality={player.nationality ?? undefined}
              overall={player.overall}
              attributes={player.attributes}
              weakFoot={player.weak_foot}
              skillMoves={player.skill_moves}
              preferredFoot={player.preferred_foot ?? undefined}
            />

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-sm font-bold">Ficha do jogador</h2>
              <dl className="space-y-3 text-sm">
                <Info icon={Flag} label="Nacionalidade" value={player.nationality ?? "—"} />
                <Info icon={Trophy} label="Posição" value={positionLabel(player.position)} />
                <Info
                  icon={Footprints}
                  label="Pé preferido"
                  value={player.preferred_foot ?? "—"}
                />
                <Info icon={Ruler} label="Altura" value={`${player.height_cm} cm`} />
                <Info icon={Weight} label="Peso" value={`${player.weight_kg} kg`} />
                <Info icon={Sparkles} label="Estilo" value={player.play_style ?? "—"} />
                <Info icon={TrendingUp} label="Na base desde" value={memberSince} />
              </dl>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={Star} label="Overall" value={player.overall} highlight />
              <Stat icon={Crown} label="Potencial" value={player.potential} />
              <Stat icon={TrendingUp} label="Idade" value={`${player.age} anos`} />
              <Stat
                icon={Crown}
                label="Margem"
                value={`+${Math.max(0, player.potential - player.overall)}`}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-4 font-display text-sm font-bold">Atributos completos</h2>
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {CATEGORIES.map((cat) => {
                  const catVal = categoryValue(player.attributes, cat.key);
                  return (
                    <div key={cat.key}>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-primary">{cat.label}</span>
                        <span className="font-display text-base font-bold">{catVal}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${catVal}%` }}
                        />
                      </div>
                      <div className="mt-2 space-y-1">
                        {cat.attrs.map((a) => (
                          <div
                            key={a.key}
                            className="flex items-center justify-between text-[11px] text-muted-foreground"
                          >
                            <span>{a.label}</span>
                            <span className="font-semibold text-foreground/80">
                              {player.attributes[a.key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {playStyleDesc(player.play_style) && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h2 className="mb-2 font-display text-sm font-bold">Estilo de jogo</h2>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{player.play_style}</strong> —{" "}
                  {playStyleDesc(player.play_style)}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Star;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-accent" />
        {label}
      </dt>
      <dd className="font-semibold text-foreground/90">{value}</dd>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Star;
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${highlight ? "text-primary" : "text-accent"}`} />
        {label}
      </div>
      <div
        className={`mt-1 font-display text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
