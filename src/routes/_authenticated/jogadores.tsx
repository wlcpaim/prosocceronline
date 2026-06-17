import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Trophy,
  LogOut,
  TrendingUp,
  Crown,
  Star,
  Dumbbell,
  Search,
  Calendar,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlayerCard } from "@/components/PlayerCard";
import { Logo } from "@/components/Logo";
import { AccessGate } from "@/components/AccessGate";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, categoryValue, type Attrs } from "@/lib/player";

export const Route = createFileRoute("/_authenticated/jogadores")({
  head: () => ({
    meta: [{ title: "Jogadores — Pro Soccer Online" }],
  }),
  component: Jogadores,
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
}

function Jogadores() {
  return (
    <AccessGate>
      <JogadoresPanel />
    </AccessGate>
  );
}

function JogadoresPanel() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      // O acesso ao painel é liberado pelo AccessGate (pagamento confirmado ou Owner/admin).
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (user) {
        setDisplayName(
          (user.user_metadata?.display_name as string) ||
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "Craque",
        );
      }
      const { data } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });
      const rows = (data as PlayerRow[] | null) ?? [];
      setPlayers(rows);
      setSelectedId(rows[0]?.id ?? null);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const player = players.find((p) => p.id === selectedId) ?? null;

  const handleDelete = async () => {
    if (!player || confirmText.trim().toUpperCase() !== "CONFIRMAR") return;
    setDeleting(true);
    const { error } = await supabase.from("players").delete().eq("id", player.id);
    setDeleting(false);
    if (error) {
      toast.error("Não foi possível excluir o jogador. Tente novamente.");
      return;
    }
    const remaining = players.filter((p) => p.id !== player.id);
    setPlayers(remaining);
    setSelectedId(remaining[0]?.id ?? null);
    setDeleteOpen(false);
    setConfirmText("");
    toast.success("Jogador excluído.");
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : !player ? (
          <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" />
            <h1 className="mt-4 font-display text-2xl font-bold">Você ainda não tem um jogador</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Crie seu craque para iniciar sua carreira.
            </p>
            <Button variant="hero" size="lg" className="mt-6" asChild>
              <Link to="/criar-personagem">Criar jogador</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Olá, {displayName} 👋</p>
                <h1 className="font-display text-3xl font-bold">
                  Carreira de <span className="text-gradient">{player.name}</span>
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/criar-personagem">
                    <Plus className="h-4 w-4" /> Criar outro jogador
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setConfirmText("");
                    setDeleteOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Excluir jogador
                </Button>
              </div>
            </div>


            {players.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                      p.id === selectedId
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {p.name} · {p.position} · {p.overall}
                  </button>
                ))}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              {/* Card */}
              <div>
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
              </div>

              {/* Stats + attrs */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Stat icon={Star} label="Overall" value={player.overall} highlight />
                  <Stat icon={Crown} label="Potencial" value={player.potential} />
                  <Stat icon={TrendingUp} label="Idade" value={`${player.age} anos`} />
                  <Stat icon={Trophy} label="Posição" value={player.position} />
                </div>

                <div className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="mb-4 font-display text-sm font-bold">Atributos do jogador</h2>
                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    {CATEGORIES.map((cat) => {
                      const catVal = categoryValue(player.attributes, cat.key);
                      return (
                        <div key={cat.key}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-primary">
                              {cat.label}
                            </span>
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

                {/* Próximos passos */}
                <div>
                  <h2 className="mb-3 font-display text-sm font-bold">Próximos passos</h2>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <NextStep
                      icon={Dumbbell}
                      title="Treinar"
                      desc="Evolua atributos, fintas e pé ruim na escola de base."
                    />
                    <NextStep
                      icon={Search}
                      title="Ser observado"
                      desc="Brilhe para atrair olheiros dos clubes."
                    />
                    <NextStep
                      icon={Calendar}
                      title="Temporada"
                      desc="Dispute partidas PvP e cooperativas e marque sua história."
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir jogador</DialogTitle>
            <DialogDescription>
              Esta ação é permanente e não pode ser desfeita
              {player ? <> — o jogador <strong>{player.name}</strong> será apagado</> : null}.
              Digite <strong>CONFIRMAR</strong> para avançar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="confirm-delete">Confirmação</Label>
            <Input
              id="confirm-delete"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="CONFIRMAR"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || confirmText.trim().toUpperCase() !== "CONFIRMAR"}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

function NextStep({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Star;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h3 className="mt-3 font-display text-sm font-bold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
