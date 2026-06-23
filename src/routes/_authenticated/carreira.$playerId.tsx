import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
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
  Menu,
  X,
  User,
  Table2,
  GraduationCap,
  BarChart3,
  Lock,
  Wallet,
  Mail,
  Award,
  CalendarDays,
  Info,
  Medal,
  Swords,
  ShoppingBag,
  Coins,
  Target,
  Check,
  Dumbbell,
  Smartphone,
  Package,
  Zap,
  Gift,
  ListChecks,
  Sparkle,
} from "lucide-react";
import { TrainingTab } from "@/components/TrainingTab";
import { Button } from "@/components/ui/button";
import { PlayerCard } from "@/components/PlayerCard";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { getCareerRanking, type CareerRanking } from "@/lib/career.functions";
import { getShop, buyItem, useConsumable, equipCleat, type OwnedItem } from "@/lib/shop.functions";
import { getMissions, claimMission } from "@/lib/missions.functions";
import { getGolRanking, type GolRankingRow } from "@/lib/golagol.functions";
import {
  SHOP_ITEMS,
  SHOP_CATEGORIES,
  getShopItem,
  type ShopItem,
  type ShopCategory,
} from "@/lib/shop-items";
import { progress } from "@/lib/progression";
import { toast } from "sonner";
import {
  CATEGORIES,
  categoryValue,
  playerSlug,
  POSITIONS,
  PLAY_STYLES,
  type Attrs,
} from "@/lib/player";

export const Route = createFileRoute("/_authenticated/carreira/$playerId")({
  head: () => ({
    meta: [{ title: "Minha Carreira — Pro Soccer Online" }],
  }),
  component: CarreiraPage,
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  equipped_cleat: string | null;
  created_at: string;
}

type TabKey =
  | "jogador"
  | "tabelas"
  | "escola"
  | "ranking"
  | "rankingGol"
  | "loja"
  | "missoes"
  | "inventario"
  | "hallda";

function positionLabel(code: string) {
  return POSITIONS.find((p) => p.code === code)?.label ?? code;
}

function playStyleDesc(name: string | null) {
  return PLAY_STYLES.find((s) => s.name === name)?.desc ?? "";
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CarreiraPage() {
  return <CarreiraInner />;
}

function CarreiraInner() {
  const { playerId } = Route.useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<PlayerRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("jogador");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (UUID_RE.test(playerId)) {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .maybeSingle();
        setPlayer((data as PlayerRow | null) ?? null);
      } else {
        const { data } = await supabase.from("players").select("*");
        const rows = (data as PlayerRow[] | null) ?? [];
        const match = rows.find((p) => playerSlug(p.name) === playerId) ?? null;
        setPlayer(match);
      }
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

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  const TAB_LABELS: Record<TabKey, string> = {
    jogador: "Jogador",
    tabelas: "Tabelas",
    escola: "Escola",
    ranking: "Ranking Geral",
    rankingGol: "Ranking Gol a Gol",
    loja: "Loja",
    missoes: "Missões",
    inventario: "Inventário",
    hallda: "Hall da Fama",
  };
  const TAB_SUBTITLE: Record<TabKey, string> = {
    jogador: "Visão Geral",
    tabelas: "Competições",
    escola: "Desenvolvimento",
    ranking: "Competição",
    rankingGol: "PvP · x1",
    loja: "Apple · Chuteiras · Consumíveis",
    missoes: "Recompensas",
    inventario: "Seus itens",
    hallda: "Lendas",
  };

  const mainItems: { key: TabKey; label: string; icon: typeof User }[] = [
    { key: "jogador", label: "Jogador", icon: User },
    { key: "tabelas", label: "Tabelas", icon: Table2 },
    { key: "escola", label: "Escola", icon: GraduationCap },
  ];
  const rankingItems: { key: TabKey; label: string }[] = [
    { key: "ranking", label: "Geral" },
    { key: "rankingGol", label: "Gol a Gol" },
    { key: "hallda", label: "Hall da Fama" },
  ];

  const go = (key: TabKey) => {
    setTab(key);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile topbar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-elevated text-foreground"
          aria-label="Abrir menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Minha Carreira
          </div>
          <div className="font-display text-sm font-bold">Pro Soccer Online</div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-border bg-card transition-transform duration-200 lg:sticky lg:top-0 lg:z-0 lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-5">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground lg:hidden"
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <p className="px-5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Navegação
            </p>
            {mainItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => go(item.key)}
                  className={`flex w-full items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-surface-elevated font-semibold text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  {item.label}
                </button>
              );
            })}

            {/* Loja */}
            <button
              type="button"
              onClick={() => go("loja")}
              className={`flex w-full items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-colors ${
                tab === "loja"
                  ? "border-primary bg-surface-elevated font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
              }`}
            >
              <ShoppingBag className={`h-4 w-4 ${tab === "loja" ? "text-primary" : ""}`} />
              Loja
            </button>

            {/* Jogos */}
            <p className="px-5 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Jogos
            </p>
            <Link
              to="/gol-a-gol"
              onClick={() => setSidebarOpen(false)}
              className="flex w-full items-center gap-3 border-l-[3px] border-transparent px-5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated/60 hover:text-foreground"
            >
              <Swords className="h-4 w-4" />
              <span className="flex-1 text-left">Gol a Gol</span>
              <span className="rounded border border-primary/50 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-primary">
                x1
              </span>
            </Link>

            {/* Ranking */}
            <p className="px-5 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Ranking
            </p>
            {rankingItems.map((item) => {
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => go(item.key)}
                  className={`flex w-full items-center gap-3 border-l-[3px] px-5 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-surface-elevated font-semibold text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-surface-elevated/60 hover:text-foreground"
                  }`}
                >
                  <BarChart3 className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  {item.label}
                </button>
              );
            })}

            <p className="px-5 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Em breve
            </p>
            {["Time"].map((label) => (
              <div
                key={label}
                className="flex w-full cursor-not-allowed items-center gap-3 px-5 py-2.5 text-sm text-muted-foreground/50"
              >
                <Lock className="h-4 w-4" />
                <span className="flex-1 text-left">{label}</span>
                <span className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide">
                  Bloq.
                </span>
              </div>
            ))}
          </nav>

          <div className="border-t border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full border border-border bg-surface-elevated text-xs font-bold text-primary">
                {initials(player.name)}
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{player.name}</div>
                <div className="text-[11px] text-muted-foreground">
                  {positionLabel(player.position)} · {player.age} anos
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate({ to: "/jogadores" })}
              className="mt-3 flex w-full items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar aos jogadores
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 px-5 py-7 sm:px-8">
          <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {TAB_SUBTITLE[tab]}
              </div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">{TAB_LABELS[tab]}</h1>
            </div>
            <div className="text-xs capitalize text-muted-foreground">{today}</div>
          </div>

          {tab === "jogador" && <JogadorSection player={player} />}
          {tab === "tabelas" && <TabelasSection />}
          {tab === "escola" && <EscolaSection player={player} />}
          {tab === "ranking" && <RankingSection player={player} />}
          {tab === "rankingGol" && <GolRankingSection />}
          {tab === "loja" && <LojaSection />}
          {tab === "hallda" && <HallSection />}
        </main>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Panels --- */

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: typeof Star;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
          {Icon && <Icon className="h-4 w-4 text-primary" />}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</div>
  );
}

/* ------------------------------------------------------------- Jogador ----- */

function JogadorSection({ player }: { player: PlayerRow }) {
  const margin = Math.max(0, player.potential - player.overall);
  const progress = Math.min(100, Math.round((player.overall / player.potential) * 100));

  const badges = [
    { label: "Jogador Criado", icon: User, unlocked: true },
    { label: "Olheiro Observou", icon: Mail, unlocked: false },
    { label: "1º Contrato", icon: Award, unlocked: false },
    { label: "1º Título", icon: Trophy, unlocked: false },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      {/* Left column */}
      <div className="flex flex-col gap-5">
        <Panel
          title="Perfil do Jogador"
          icon={User}
          action={
            <Link
              to="/carreira/$playerId"
              params={{ playerId: playerSlug(player.name) }}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Ver completo →
            </Link>
          }
        >
          <div className="flex items-center gap-4 p-5">
            <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full border-2 border-border bg-surface-elevated font-display text-xl font-bold text-primary">
              {initials(player.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-lg font-bold">{player.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                <span>{positionLabel(player.position)}</span>
                <span>·</span>
                <span>{player.age} anos</span>
                <span>·</span>
                <span>{player.nationality ?? "—"}</span>
              </div>
            </div>
            <div className="flex-shrink-0 border-l border-border pl-4 text-center">
              <div className="font-display text-3xl font-bold text-primary">{player.overall}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Overall
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Progresso até o potencial</span>
              <span>
                {player.overall} / {player.potential}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-border px-5 py-4">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-xs text-muted-foreground">Saldo da Carreira</span>
            <span className="rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Em breve
            </span>
          </div>
        </Panel>

        <Panel title="E-mail" icon={Mail}>
          <EmptyState>
            Sua caixa de entrada está vazia.
            <br />
            Mensagens de olheiros e clubes vão aparecer aqui.
          </EmptyState>
        </Panel>

        <Panel title="Conquistas" icon={Award}>
          <div className="grid grid-cols-4 gap-3 p-5">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full border ${
                      b.unlocked
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-surface-elevated text-muted-foreground/60"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={`text-[10.5px] leading-tight ${
                      b.unlocked ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {b.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Star} label="Overall" value={player.overall} highlight />
          <Stat icon={Crown} label="Potencial" value={player.potential} />
          <Stat icon={TrendingUp} label="Idade" value={`${player.age} anos`} />
          <Stat icon={Crown} label="Margem" value={`+${margin}`} />
        </div>

        <Panel title="Atributos" icon={BarChart3}>
          <div className="grid gap-x-5 gap-y-4 p-5 sm:grid-cols-2">
            {CATEGORIES.map((cat) => {
              const catVal = categoryValue(player.attributes, cat.key);
              return (
                <div key={cat.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-primary">{cat.label}</span>
                    <span className="font-display text-base font-bold">{catVal}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${catVal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Próximo na Escola" icon={CalendarDays}>
          <EmptyState>
            Nenhum jogo agendado.
            <br />
            Continue treinando para evoluir.
          </EmptyState>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Escola ------ */

function EscolaSection({ player }: { player: PlayerRow }) {
  const [view, setView] = useState<"ficha" | "treino">("treino");

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl border border-border bg-card p-1">
        {(
          [
            { key: "treino", label: "Treino", icon: Dumbbell },
            { key: "ficha", label: "Ficha", icon: User },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const active = view === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {view === "treino" ? (
        <TrainingTab playerId={player.id} />
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            Você está na base aos {player.age} anos. Use o Treino para evoluir seus atributos, fintas
            e pé ruim.
          </div>

          <Panel title="Ficha do Jogador" icon={User}>
            <dl className="space-y-3 p-5 text-sm">
              <Info2 icon={Flag} label="Nacionalidade" value={player.nationality ?? "—"} />
              <Info2 icon={Trophy} label="Posição" value={positionLabel(player.position)} />
              <Info2 icon={Footprints} label="Pé preferido" value={player.preferred_foot ?? "—"} />
              <Info2 icon={Ruler} label="Altura" value={`${player.height_cm} cm`} />
              <Info2 icon={Weight} label="Peso" value={`${player.weight_kg} kg`} />
              <Info2 icon={Sparkles} label="Estilo" value={player.play_style ?? "—"} />
            </dl>
          </Panel>

          {playStyleDesc(player.play_style) && (
            <Panel title="Estilo de Jogo" icon={Sparkles}>
              <p className="p-5 text-sm text-muted-foreground">
                <strong className="text-foreground">{player.play_style}</strong> —{" "}
                {playStyleDesc(player.play_style)}
              </p>
            </Panel>
          )}

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-center gap-2 p-5">
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
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- Ranking ----- */

function RankingSection({ player }: { player: PlayerRow }) {
  const fetchRanking = useServerFn(getCareerRanking);
  const [data, setData] = useState<CareerRanking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchRanking({ data: { playerId: player.id } });
        if (active) setData(res);
      } catch {
        if (active) setData({ top: [], me: null });
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.id]);

  return (
    <div className="space-y-5">
      <Panel
        title="Top Jogadores — Escola"
        icon={BarChart3}
        action={<span className="text-xs text-muted-foreground">Atualizado agora</span>}
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : data && data.top.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 text-center font-semibold">#</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Jogador</th>
                  <th className="px-4 py-2.5 text-center font-semibold">OVR</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Idade</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Títulos</th>
                </tr>
              </thead>
              <tbody>
                {data.top.map((row) => (
                  <tr
                    key={`${row.rank}-${row.name}`}
                    className={`border-t border-border ${row.isMe ? "bg-primary/5" : ""}`}
                  >
                    <td
                      className={`px-4 py-3 text-center font-display text-sm font-bold ${
                        row.rank === 1
                          ? "text-yellow-400"
                          : row.rank === 2
                            ? "text-slate-300"
                            : row.rank === 3
                              ? "text-amber-600"
                              : "text-muted-foreground"
                      }`}
                    >
                      {row.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                            row.isMe
                              ? "border-primary text-primary"
                              : "border-border bg-surface-elevated text-muted-foreground"
                          }`}
                        >
                          {initials(row.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <span className="truncate">{row.name}</span>
                            {row.isMe && (
                              <span className="rounded border border-primary px-1.5 py-0.5 text-[9px] uppercase text-primary">
                                Você
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {positionLabel(row.position)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-display text-base font-bold">
                      {row.overall}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {row.age}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {row.titles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>Ranking indisponível no momento.</EmptyState>
        )}
      </Panel>

      {data?.me && (
        <Panel title="Sua Posição" icon={Info}>
          <div className="flex flex-wrap items-center gap-6 p-5">
            <div className="min-w-[80px] flex-1 text-center">
              <div className="font-display text-3xl font-bold">#{data.me.rank}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                Posição Geral
              </div>
            </div>
            <div className="min-w-[80px] flex-1 text-center">
              <div className="font-display text-3xl font-bold">#{data.me.positionRank}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                {positionLabel(data.me.position)}
              </div>
            </div>
            <div className="min-w-[80px] flex-1 text-center">
              <div className="font-display text-3xl font-bold">{data.me.total}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                Total na Escola
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* --------------------------------------------------------- Ranking Gol ----- */

function GolRankingSection() {
  const fetchRanking = useServerFn(getGolRanking);
  const [rows, setRows] = useState<GolRankingRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchRanking({});
        if (active) setRows(res.top);
      } catch {
        if (active) setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <Swords className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        Ranking dos duelos x1 de Gol a Gol. Vença partidas para subir na tabela.
      </div>

      <Panel
        title="Melhores do Gol a Gol"
        icon={Swords}
        action={
          <Link
            to="/gol-a-gol"
            className="text-xs text-primary transition-colors hover:underline"
          >
            Jogar →
          </Link>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-2.5 text-center font-semibold">#</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Jogador</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Vitórias</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Partidas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.rank}-${row.name}`}
                    className={`border-t border-border ${row.isMe ? "bg-primary/5" : ""}`}
                  >
                    <td
                      className={`px-4 py-3 text-center font-display text-sm font-bold ${
                        row.rank === 1
                          ? "text-yellow-400"
                          : row.rank === 2
                            ? "text-slate-300"
                            : row.rank === 3
                              ? "text-amber-600"
                              : "text-muted-foreground"
                      }`}
                    >
                      {row.rank}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="truncate">{row.name}</span>
                        {row.isMe && (
                          <span className="rounded border border-primary px-1.5 py-0.5 text-[9px] uppercase text-primary">
                            Você
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-display text-base font-bold text-primary">
                      {row.wins}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {row.played}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>
            Nenhum duelo disputado ainda.
            <br />
            Seja o primeiro a entrar no Gol a Gol!
          </EmptyState>
        )}
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------- Loja -------- */

const SHOP_ICONS: Record<ShopItem["icon"], typeof Star> = {
  boots: Footprints,
  ball: Target,
  shirt: Award,
  energy: Sparkles,
  badge: Medal,
  star: Star,
};

function LojaSection() {
  const fetchShop = useServerFn(getShop);
  const buy = useServerFn(buyItem);
  const [coins, setCoins] = useState<number | null>(null);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchShop({});
        if (active) {
          setCoins(res.coins);
          setOwned(res.owned);
        }
      } catch {
        if (active) setCoins(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuy = async (item: ShopItem) => {
    setBusy(item.id);
    try {
      const res = await buy({ data: { itemId: item.id } });
      setCoins(res.coins);
      if (res.ok) {
        setOwned((o) => [...o, item.id]);
        toast.success(`${item.name} comprado!`);
      } else if (res.reason === "insufficient") {
        toast.error("Moedas insuficientes.");
      } else if (res.reason === "owned") {
        toast.info("Você já tem este item.");
        setOwned((o) => (o.includes(item.id) ? o : [...o, item.id]));
      }
    } catch {
      toast.error("Não foi possível concluir a compra.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4">
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
          <ShoppingBag className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          Loja em fase de testes. Ganhe moedas vencendo no Gol a Gol e gaste aqui.
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5">
          <Coins className="h-4 w-4 text-yellow-400" />
          <span className="font-display text-base font-bold tabular-nums">
            {coins === null ? "—" : coins.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {SHOP_ITEMS.map((item) => {
            const Icon = SHOP_ICONS[item.icon];
            const isOwned = owned.includes(item.id);
            const canAfford = (coins ?? 0) >= item.price;
            return (
              <div
                key={item.id}
                className="flex flex-col rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-display text-base font-bold">{item.name}</div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-yellow-400">
                      <Coins className="h-3.5 w-3.5" />
                      {item.price.toLocaleString("pt-BR")}
                    </div>
                  </div>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{item.desc}</p>
                <Button
                  variant={isOwned ? "outline" : "hero"}
                  className="mt-4 w-full"
                  disabled={isOwned || busy === item.id || (!isOwned && !canAfford)}
                  onClick={() => handleBuy(item)}
                >
                  {busy === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isOwned ? (
                    <>
                      <Check className="h-4 w-4" /> Adquirido
                    </>
                  ) : !canAfford ? (
                    "Moedas insuficientes"
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" /> Comprar
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------- Tabelas ----- */

const STANDINGS = [
  { pos: 1, club: "Palmeiras", p: 28, j: 12, v: 9, e: 1, d: 2, sg: "+18" },
  { pos: 2, club: "Flamengo", p: 26, j: 12, v: 8, e: 2, d: 2, sg: "+15" },
  { pos: 3, club: "Corinthians", p: 22, j: 12, v: 6, e: 4, d: 2, sg: "+8" },
  { pos: 4, club: "São Paulo", p: 20, j: 12, v: 6, e: 2, d: 4, sg: "+5" },
  { pos: 5, club: "Santos", p: 17, j: 12, v: 4, e: 5, d: 3, sg: "-1" },
];

const MATCHES = [
  { date: "Sáb · 20/06", home: "Corinthians", away: "Santos", comp: "Brasileirão" },
  { date: "Dom · 21/06", home: "Flamengo", away: "Palmeiras", comp: "Brasileirão" },
  { date: "Ter · 23/06", home: "São Paulo", away: "Botafogo", comp: "Copa do Brasil" },
];

function TabelasSection() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        Você ainda não está em um clube. Acompanhe as competições enquanto evolui na escola.
      </div>

      <Panel
        title="Classificação"
        icon={Table2}
        action={<span className="text-xs text-muted-foreground">Rodada 12</span>}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 text-center font-semibold">#</th>
                <th className="px-4 py-2.5 text-left font-semibold">Clube</th>
                <th className="px-4 py-2.5 text-center font-semibold">P</th>
                <th className="px-4 py-2.5 text-center font-semibold">J</th>
                <th className="px-4 py-2.5 text-center font-semibold">V</th>
                <th className="px-4 py-2.5 text-center font-semibold">E</th>
                <th className="px-4 py-2.5 text-center font-semibold">D</th>
                <th className="px-4 py-2.5 text-center font-semibold">SG</th>
              </tr>
            </thead>
            <tbody>
              {STANDINGS.map((r) => (
                <tr key={r.pos} className="border-t border-border text-sm text-muted-foreground">
                  <td className="px-4 py-2.5 text-center font-semibold text-foreground">{r.pos}</td>
                  <td className="px-4 py-2.5 font-semibold text-foreground">{r.club}</td>
                  <td className="px-4 py-2.5 text-center">{r.p}</td>
                  <td className="px-4 py-2.5 text-center">{r.j}</td>
                  <td className="px-4 py-2.5 text-center">{r.v}</td>
                  <td className="px-4 py-2.5 text-center">{r.e}</td>
                  <td className="px-4 py-2.5 text-center">{r.d}</td>
                  <td className="px-4 py-2.5 text-center">{r.sg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Próximas Partidas" icon={CalendarDays}>
        <div>
          {MATCHES.map((m, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border px-5 py-3.5 first:border-t-0"
            >
              <div className="w-24 flex-shrink-0 text-[11px] text-muted-foreground">{m.date}</div>
              <div className="flex flex-1 items-center justify-center gap-3 text-sm font-semibold">
                {m.home} <span className="text-xs font-normal text-muted-foreground">vs</span>{" "}
                {m.away}
              </div>
              <div className="w-28 flex-shrink-0 text-right text-[11px] text-muted-foreground">
                {m.comp}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------- Hall -------- */

const RECORDS = [
  { medal: "🏆", title: "Maior Overall", value: "97", holder: "Felipe Rocha", sub: "Atacante" },
  { medal: "⚡", title: "Evolução Recorde", value: "+61", holder: "Ana Beatriz", sub: "32 → 93" },
  { medal: "🎖", title: "Mais Títulos", value: "12", holder: "Diego Nunes", sub: "Meia" },
];

const LEGENDS = [
  { pos: 1, name: "Felipe Rocha", meta: "Atacante · Maior Overall", sv: "97", sl: "OVR Máx." },
  { pos: 2, name: "Diego Nunes", meta: "Meia · Mais Títulos", sv: "12", sl: "Títulos" },
  { pos: 3, name: "Ana Beatriz", meta: "Ponta · Evolução Recorde", sv: "+61", sl: "Evolução" },
];

function HallSection() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-7 text-center sm:flex-row sm:text-left">
        <span className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full border border-border bg-surface-elevated text-yellow-400">
          <Trophy className="h-8 w-8" />
        </span>
        <div>
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Pro Soccer Online · Escola
          </div>
          <div className="mt-1 font-display text-xl font-bold">Os Maiores da História</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Jogadores que deixaram sua marca. Entre para este grupo: chegue ao OVR 90 ou conquiste
            um título nacional.
          </p>
        </div>
      </div>

      <Panel title="Recordes Históricos" icon={Medal}>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {RECORDS.map((r) => (
            <div
              key={r.title}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-surface-elevated/40 p-4 text-center"
            >
              <div className="text-2xl">{r.medal}</div>
              <div className="text-xs font-bold text-foreground">{r.title}</div>
              <div className="font-display text-2xl font-bold text-primary">{r.value}</div>
              <div className="text-xs text-muted-foreground">{r.holder}</div>
              <div className="text-[11px] text-muted-foreground/70">{r.sub}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Lendas Imortalizadas"
        icon={Trophy}
        action={<span className="text-xs text-muted-foreground">3 jogadores</span>}
      >
        <div>
          {LEGENDS.map((l) => (
            <div
              key={l.pos}
              className="flex items-center gap-4 border-t border-border px-5 py-3.5 first:border-t-0"
            >
              <div className="w-7 flex-shrink-0 text-center font-display text-lg font-bold text-muted-foreground">
                {l.pos}
              </div>
              <span
                className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border text-sm font-bold ${
                  l.pos === 1
                    ? "border-yellow-400 text-yellow-400"
                    : "border-border bg-surface-elevated text-muted-foreground"
                }`}
              >
                {initials(l.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-foreground">{l.name}</div>
                <div className="text-[11px] text-muted-foreground">{l.meta}</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-display text-lg font-bold">{l.sv}</div>
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {l.sl}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ----------------------------------------------------------- Small bits ---- */

function Info2({
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
        className={`mt-1 font-display text-2xl font-bold ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
