import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Star,
  Check,
  Minus,
  Plus,
  Loader2,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerCard } from "@/components/PlayerCard";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  ATTR_BASE,
  ATTR_CAP,
  FREE_POINTS,
  OVERALL_CAP,
  STAR_BASE,
  STAR_POOL,
  NATIONALITIES,
  PLAY_STYLES,
  POSITIONS,
  type PlayerDraft,
  baseAttrs,
  finalAttrs,
  spentPoints,
  computeOverall,
  computePotential,
  defaultDraft,
  emptyFreePoints,
  saveDraft,
  loadDraft,
  clearDraft,
} from "@/lib/player";
import { createPlayer, checkPlayerName } from "@/lib/players.functions";

export const Route = createFileRoute("/criar-personagem")({
  head: () => ({
    meta: [
      { title: "Crie seu jogador — Pro Soccer Online" },
      {
        name: "description",
        content:
          "Monte seu craque no Pro Soccer Online: posição, estilo de jogo, físico e atributos. Tudo afeta o overall ao vivo.",
      },
    ],
  }),
  component: CriarPersonagem,
});

const STEPS = ["Identidade", "Atributos", "Resumo"];

function CriarPersonagem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PlayerDraft>(() => defaultDraft());

  // Restaura um rascunho salvo (ex.: quando o nome escolhido já foi usado e o
  // jogador voltou para escolher outro). Feito após montar para não quebrar a
  // hidratação do SSR.
  useEffect(() => {
    const saved = loadDraft();
    if (saved) setDraft(saved);
  }, []);

  const update = <K extends keyof PlayerDraft>(key: K, value: PlayerDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  // --- Atributos ao vivo ---
  const base = useMemo(() => baseAttrs(draft), [draft]);
  const attrs = useMemo(() => finalAttrs(draft), [draft]);
  const overall = useMemo(() => computeOverall(attrs, draft.position), [attrs, draft.position]);
  const potential = computePotential(overall, draft.age);
  const spent = spentPoints(draft.freePoints);
  const remaining = FREE_POINTS - spent;

  // estrelas (fintas + pé ruim)
  const starsUsed = draft.weakFoot - STAR_BASE + (draft.skillMoves - STAR_BASE);
  const starsLeft = STAR_POOL - starsUsed;

  // --- Disponibilidade de nome ---
  const [nameStatus, setNameStatus] = useState<"idle" | "checking" | "ok" | "taken" | "short">("idle");
  const checkRef = useRef(0);
  useEffect(() => {
    const name = draft.name.trim();
    if (name.length < 3) {
      setNameStatus(name.length === 0 ? "idle" : "short");
      return;
    }
    setNameStatus("checking");
    const id = ++checkRef.current;
    const t = setTimeout(async () => {
      const res = await checkPlayerName({ data: { name } });
      if (id !== checkRef.current) return;
      if (!res.ok) setNameStatus("idle");
      else setNameStatus(res.available ? "ok" : "taken");
    }, 450);
    return () => clearTimeout(t);
  }, [draft.name]);

  const setFree = (key: string, delta: number) => {
    setDraft((d) => {
      const cur = d.freePoints[key] ?? 0;
      let next = cur + delta;
      if (next < 0) next = 0;
      // não pode ultrapassar pontos restantes
      if (delta > 0 && spentPoints(d.freePoints) >= FREE_POINTS) return d;
      // não pode ultrapassar o teto do atributo
      if (base[key] + next > ATTR_CAP) next = ATTR_CAP - base[key];
      return { ...d, freePoints: { ...d.freePoints, [key]: Math.max(0, next) } };
    });
  };

  const setStarFor = (which: "weakFoot" | "skillMoves", delta: number) => {
    setDraft((d) => {
      const cur = d[which];
      let next = cur + delta;
      next = Math.max(STAR_BASE, Math.min(STAR_BASE + STAR_POOL, next));
      const otherExtra = (which === "weakFoot" ? d.skillMoves : d.weakFoot) - STAR_BASE;
      if (next - STAR_BASE + otherExtra > STAR_POOL) return d;
      return { ...d, [which]: next };
    });
  };

  const canNext =
    step === 0 ? nameStatus === "ok" && draft.name.trim().length >= 3 : true;

  const toggleAlt = (code: string) => {
    setDraft((d) => {
      const has = d.altPositions.includes(code);
      if (has) return { ...d, altPositions: d.altPositions.filter((c) => c !== code) };
      if (d.altPositions.length >= 2 || code === d.position) return d;
      return { ...d, altPositions: [...d.altPositions, code] };
    });
  };

  const [finishing, setFinishing] = useState(false);
  const finish = async () => {
    const name = draft.name.trim();
    if (name.length < 3) {
      setStep(0);
      setNameStatus("short");
      return;
    }
    setFinishing(true);
    try {
      // Revalida o nome no banco logo antes de avançar para o login, evitando
      // que dois jogadores escolham o mesmo nome ao mesmo tempo.
      const { data, error } = await supabase.rpc("is_player_name_available", { _name: name });
      if (error) {
        toast.error("Não foi possível validar o nome. Tente novamente.");
        return;
      }
      if (!data) {
        setNameStatus("taken");
        setStep(0);
        toast.error("Esse nome de jogador já está em uso. Escolha outro para continuar.");
        return;
      }

      // Se o usuário já está logado (ex.: criando um jogador adicional),
      // cria direto na nuvem e vai ao painel, sem passar pela tela de login.
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      if (userId) {
        // Atributos e overall são calculados no servidor (anti-trapaça).
        const res = await createPlayer({ data: { ...draft, name } });
        if (!res.ok) {
          if (res.error === "name_taken") {
            setNameStatus("taken");
            setStep(0);
            toast.error("Esse nome de jogador já está em uso. Escolha outro para continuar.");
            return;
          }
          toast.error(res.error);
          return;
        }
        clearDraft();
        toast.success("Jogador criado!");
        navigate({ to: "/jogadores" });
        return;
      }

      saveDraft(draft);
      navigate({ to: "/auth" });
    } finally {
      setFinishing(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Etapa {step + 1} de {STEPS.length}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {/* Stepper */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors ${
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary/20 text-primary ring-2 ring-primary"
                      : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-sm font-semibold sm:inline ${
                  i === step ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Form area */}
          <div>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold">Quem é o seu craque?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Toda lenda começa aos 14 anos. Físico, posição e nacionalidade já moldam seus atributos.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Nome do jogador (único)</Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="name"
                        value={draft.name}
                        maxLength={24}
                        placeholder="Ex: João Silva"
                        onChange={(e) => {
                          let val = e.target.value.replace(/^\s+/, "");
                          val = val.replace(/\s{2,}/g, " ");
                          const firstSpaceIndex = val.indexOf(" ");
                          if (firstSpaceIndex !== -1) {
                            const beforeSpace = val.substring(0, firstSpaceIndex + 1);
                            const afterSpace = val.substring(firstSpaceIndex + 1).replace(/\s/g, "");
                            val = beforeSpace + afterSpace;
                          }
                          update("name", val);
                        }}
                        onBlur={(e) => update("name", e.target.value.trimEnd())}
                        className={`pr-9 ${
                          nameStatus === "ok"
                            ? "border-primary focus-visible:ring-primary"
                            : nameStatus === "taken" || nameStatus === "short"
                              ? "border-destructive focus-visible:ring-destructive"
                              : ""
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {nameStatus === "checking" && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {nameStatus === "ok" && <CircleCheck className="h-4 w-4 text-primary" />}
                        {(nameStatus === "taken" || nameStatus === "short") && (
                          <CircleX className="h-4 w-4 text-destructive" />
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {nameStatus === "taken" && (
                        <span className="text-destructive">Esse nome já está em uso. Escolha outro.</span>
                      )}
                      {nameStatus === "short" && "O nome precisa ter ao menos 3 letras."}
                      {nameStatus === "ok" && <span className="text-primary">Nome disponível!</span>}
                      {(nameStatus === "idle" || nameStatus === "checking") &&
                        "Nomes de jogador não podem se repetir no Pro Soccer Online."}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="nat">Nacionalidade</Label>
                    <select
                      id="nat"
                      value={draft.nationality}
                      onChange={(e) => update("nationality", e.target.value)}
                      className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {NATIONALITIES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="foot">Pé preferido</Label>
                    <select
                      id="foot"
                      value={draft.preferredFoot}
                      onChange={(e) =>
                        update("preferredFoot", e.target.value as PlayerDraft["preferredFoot"])
                      }
                      className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="Direito">Direito</option>
                      <option value="Esquerdo">Esquerdo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Posição principal</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {POSITIONS.map((p) => (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => {
                          update("position", p.code);
                          setDraft((d) => ({
                            ...d,
                            altPositions: d.altPositions.filter((c) => c !== p.code),
                          }));
                        }}
                        className={`rounded-xl border px-2 py-2.5 text-center transition-all ${
                          draft.position === p.code
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="font-display text-sm font-bold">{p.code}</div>
                        <div className="text-[10px] text-muted-foreground">{p.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Posições secundárias (até 2)</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {POSITIONS.filter((p) => p.code !== draft.position).map((p) => {
                      const active = draft.altPositions.includes(p.code);
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => toggleAlt(p.code)}
                          className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                            active
                              ? "border-accent bg-accent/15 text-accent"
                              : "border-border bg-card text-muted-foreground hover:border-accent/40"
                          }`}
                        >
                          {p.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="height">Altura: {draft.heightCm} cm</Label>
                    <input
                      id="height"
                      type="range"
                      min={155}
                      max={205}
                      value={draft.heightCm}
                      onChange={(e) => update("heightCm", Number(e.target.value))}
                      className="mt-3 w-full accent-[oklch(0.84_0.21_145)]"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Mais alto: + força, impulsão e cabeceio · − agilidade e ritmo
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso: {draft.weightKg} kg</Label>
                    <input
                      id="weight"
                      type="range"
                      min={55}
                      max={100}
                      value={draft.weightKg}
                      onChange={(e) => update("weightKg", Number(e.target.value))}
                      className="mt-3 w-full accent-[oklch(0.84_0.21_145)]"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Mais pesado: + força e combatividade · − aceleração e fôlego
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold">Estilo e atributos</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Cada posição e estilo já dá atributos específicos. Distribua {FREE_POINTS} pontos
                    extras com inteligência — o overall muda ao vivo (máx. {OVERALL_CAP}).
                  </p>
                </div>

                <div>
                  <Label>Estilo de jogo</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {PLAY_STYLES.map((s) => (
                      <button
                        key={s.name}
                        type="button"
                        onClick={() => update("playStyle", s.name)}
                        className={`rounded-xl border p-3 text-left transition-all ${
                          draft.playStyle === s.name
                            ? "border-primary bg-primary/15"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="font-display text-sm font-bold">{s.name}</div>
                        <div className="mt-0.5 text-[11px] text-muted-foreground">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="text-base">Fintas e pé ruim</Label>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        starsLeft > 0 ? "bg-accent/15 text-accent" : "bg-surface-elevated text-muted-foreground"
                      }`}
                    >
                      {starsLeft} estrela(s) restante(s)
                    </span>
                  </div>
                  <p className="mb-3 text-[11px] text-muted-foreground">
                    Todos começam com 1 estrela em cada — evoluem durante o jogo. Você tem {STAR_POOL} para distribuir agora.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StarRow
                      label="Fintas"
                      value={draft.skillMoves}
                      onAdd={() => setStarFor("skillMoves", 1)}
                      onSub={() => setStarFor("skillMoves", -1)}
                    />
                    <StarRow
                      label="Pé ruim"
                      value={draft.weakFoot}
                      onAdd={() => setStarFor("weakFoot", 1)}
                      onSub={() => setStarFor("weakFoot", -1)}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="text-base">Atributos (35)</Label>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        remaining > 0
                          ? "bg-primary/15 text-primary"
                          : "bg-surface-elevated text-muted-foreground"
                      }`}
                    >
                      {remaining} pts restantes
                    </span>
                  </div>
                  <div className="space-y-5">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-primary">{cat.label}</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {cat.attrs.map((a) => {
                            const free = draft.freePoints[a.key] ?? 0;
                            const val = attrs[a.key];
                            return (
                              <div
                                key={a.key}
                                className="flex items-center justify-between gap-2 rounded-lg bg-surface-elevated px-3 py-2"
                              >
                                <span className="truncate text-xs text-foreground/90">{a.label}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setFree(a.key, -1)}
                                    disabled={free <= 0}
                                    className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary/50 disabled:opacity-30"
                                    aria-label={`Reduzir ${a.label}`}
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-7 text-center font-display text-sm font-bold">
                                    {val}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setFree(a.key, 1)}
                                    disabled={remaining <= 0 || val >= ATTR_CAP}
                                    className="grid h-6 w-6 place-items-center rounded-md border border-border text-primary transition-colors hover:border-primary disabled:opacity-30"
                                    aria-label={`Aumentar ${a.label}`}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold">Seu craque está pronto!</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Revise os detalhes e crie sua conta para começar a carreira.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail label="Overall" value={String(overall)} highlight />
                  <Detail label="Potencial" value={String(potential)} />
                  <Detail label="Posição" value={draft.position} />
                  <Detail label="Posições sec." value={draft.altPositions.join(", ") || "—"} />
                  <Detail label="Nacionalidade" value={draft.nationality} />
                  <Detail label="Estilo" value={draft.playStyle} />
                  <Detail label="Idade" value={`${draft.age} anos`} />
                  <Detail label="Altura / Peso" value={`${draft.heightCm}cm · ${draft.weightKg}kg`} />
                  <Detail label="Pé preferido" value={draft.preferredFoot} />
                  <Detail label="Fintas / Pé ruim" value={`${draft.skillMoves}★ / ${draft.weakFoot}★`} />
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-bold">Atributos detalhados</h3>
                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {CATEGORIES.map((cat) => (
                      <div key={cat.key}>
                        <div className="mb-1.5 text-xs font-bold uppercase text-primary">
                          {cat.label}
                        </div>
                        <div className="space-y-1">
                          {cat.attrs.map((a) => (
                            <div
                              key={a.key}
                              className="flex items-center justify-between text-[11px] text-muted-foreground"
                            >
                              <span>{a.label}</span>
                              <span className="font-semibold text-foreground/80">{attrs[a.key]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </Button>
              {step < STEPS.length - 1 ? (
                <Button variant="hero" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" onClick={finish} disabled={finishing}>
                  {finishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Criar conta e começar <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Live preview */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PlayerCard
              name={draft.name}
              position={draft.position}
              altPositions={draft.altPositions}
              nationality={draft.nationality}
              overall={overall}
              attributes={attrs}
              weakFoot={draft.weakFoot}
              skillMoves={draft.skillMoves}
              preferredFoot={draft.preferredFoot}
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="text-xs text-muted-foreground">Overall</div>
                <div className="font-display text-3xl font-bold text-primary">{overall}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 text-center">
                <div className="text-xs text-muted-foreground">Potencial</div>
                <div className="font-display text-3xl font-bold">{potential}</div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Base fixa de {ATTR_BASE} por atributo. Quem distribui com inteligência chega a {OVERALL_CAP}.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function StarRow({
  label,
  value,
  onAdd,
  onSub,
}: {
  label: string;
  value: number;
  onAdd: () => void;
  onSub: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2">
      <div>
        <div className="text-xs font-semibold">{label}</div>
        <div className="mt-0.5 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${i < value ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onSub}
          disabled={value <= STAR_BASE}
          className="grid h-6 w-6 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-accent/50 disabled:opacity-30"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="grid h-6 w-6 place-items-center rounded-md border border-border text-accent transition-colors hover:border-accent disabled:opacity-30"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-display text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

void emptyFreePoints;
