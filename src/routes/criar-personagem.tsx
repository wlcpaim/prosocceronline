import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Trophy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Star,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlayerCard, previewStats } from "@/components/PlayerCard";
import {
  ATTRIBUTES,
  ATTR_BASE,
  ATTR_MAX,
  ATTR_MIN,
  ATTR_POOL,
  NATIONALITIES,
  PLAY_STYLES,
  POSITIONS,
  type AttrKey,
  type PlayerDraft,
  computePotential,
  defaultDraft,
  saveDraft,
  subValue,
  withStyleBonus,
} from "@/lib/player";

export const Route = createFileRoute("/criar-personagem")({
  head: () => ({
    meta: [
      { title: "Crie seu jogador — Fut Manager Online" },
      {
        name: "description",
        content:
          "Monte seu craque no estilo EA SPORTS FC: posição, estilo de jogo e atributos. Comece sua carreira aos 14 anos.",
      },
    ],
  }),
  component: CriarPersonagem,
});

const STEPS = ["Identidade", "Atributos", "Resumo"];

function StarPicker({
  value,
  onChange,
  max = 5,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          className="p-0.5"
          aria-label={`${i + 1} estrelas`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              i < value ? "fill-accent text-accent" : "text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function CriarPersonagem() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PlayerDraft>(() => defaultDraft());

  const update = <K extends keyof PlayerDraft>(key: K, value: PlayerDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const distributed = useMemo(
    () =>
      (Object.keys(draft.attributes) as AttrKey[]).reduce(
        (acc, k) => acc + (draft.attributes[k] - ATTR_BASE),
        0,
      ),
    [draft.attributes],
  );
  const remaining = ATTR_POOL - distributed;

  const setAttr = (key: AttrKey, value: number) => {
    const current = draft.attributes[key];
    const delta = value - current;
    if (delta > remaining) value = current + remaining;
    value = Math.max(ATTR_MIN, Math.min(ATTR_MAX, value));
    setDraft((d) => ({ ...d, attributes: { ...d.attributes, [key]: value } }));
  };

  const preview = useMemo(
    () => previewStats(draft.attributes, draft.position, draft.playStyle),
    [draft.attributes, draft.position, draft.playStyle],
  );
  const potential = computePotential(preview.overall, draft.age);
  const finalAttrs = useMemo(
    () => withStyleBonus(draft.attributes, draft.playStyle),
    [draft.attributes, draft.playStyle],
  );

  const canNext = step === 0 ? draft.name.trim().length >= 2 : true;

  const toggleAlt = (code: string) => {
    setDraft((d) => {
      const has = d.altPositions.includes(code);
      if (has) return { ...d, altPositions: d.altPositions.filter((c) => c !== code) };
      if (d.altPositions.length >= 2 || code === d.position) return d;
      return { ...d, altPositions: [...d.altPositions, code] };
    });
  };

  const finish = () => {
    saveDraft({ ...draft, attributes: draft.attributes });
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Fut<span className="text-primary">Manager</span>
            </span>
          </Link>
          <span className="text-xs text-muted-foreground">
            Etapa {step + 1} de {STEPS.length}
          </span>
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

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Form area */}
          <div>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold">Quem é o seu craque?</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Toda lenda começa aos 14 anos. Defina a identidade do seu jogador.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="name">Nome do jogador</Label>
                    <Input
                      id="name"
                      value={draft.name}
                      maxLength={24}
                      placeholder="Ex: João Silva"
                      onChange={(e) => update("name", e.target.value)}
                      className="mt-1.5"
                    />
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
                  <Label>Posições alternativas (até 2)</Label>
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
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-bold">Estilo e atributos</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Escolha o DNA do seu jogador e distribua os pontos iniciais.
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <Label>Fintas (skill moves)</Label>
                    <div className="mt-2">
                      <StarPicker value={draft.skillMoves} onChange={(v) => update("skillMoves", v)} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <Label>Pé ruim</Label>
                    <div className="mt-2">
                      <StarPicker value={draft.weakFoot} onChange={(v) => update("weakFoot", v)} />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Label className="text-base">Atributos</Label>
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
                  <div className="space-y-4">
                    {ATTRIBUTES.map((cat) => (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{cat.label}</span>
                          <span className="font-display font-bold text-primary">
                            {draft.attributes[cat.key]}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={ATTR_MIN}
                          max={ATTR_MAX}
                          value={draft.attributes[cat.key]}
                          onChange={(e) => setAttr(cat.key, Number(e.target.value))}
                          className="mt-1.5 w-full accent-[oklch(0.84_0.21_145)]"
                        />
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
                  <Detail label="Overall" value={String(preview.overall)} highlight />
                  <Detail label="Potencial" value={String(potential)} />
                  <Detail label="Posição" value={draft.position} />
                  <Detail
                    label="Posições alt."
                    value={draft.altPositions.join(", ") || "—"}
                  />
                  <Detail label="Idade" value={`${draft.age} anos`} />
                  <Detail label="Estilo" value={draft.playStyle} />
                  <Detail label="Altura / Peso" value={`${draft.heightCm}cm · ${draft.weightKg}kg`} />
                  <Detail label="Pé preferido" value={draft.preferredFoot} />
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <h3 className="mb-3 font-display text-sm font-bold">Atributos detalhados</h3>
                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {ATTRIBUTES.map((cat) => (
                      <div key={cat.key}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-primary">
                            {cat.label}
                          </span>
                          <span className="font-display text-sm font-bold">
                            {finalAttrs[cat.key]}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {cat.subs.map((s) => (
                            <div
                              key={s.key}
                              className="flex items-center justify-between text-[11px] text-muted-foreground"
                            >
                              <span>{s.label}</span>
                              <span className="font-semibold text-foreground/80">
                                {subValue(finalAttrs[cat.key], s.offset)}
                              </span>
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
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to="/">Cancelar</Link>
                </Button>
              )}

              {step < STEPS.length - 1 ? (
                <Button variant="hero" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                  Continuar <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="hero" size="lg" onClick={finish}>
                  <Sparkles className="h-4 w-4" /> Começar carreira
                </Button>
              )}
            </div>
          </div>

          {/* Live preview card */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PlayerCard
              name={draft.name}
              position={draft.position}
              nationality={draft.nationality}
              overall={preview.overall}
              attributes={preview.attrs}
              weakFoot={draft.weakFoot}
              skillMoves={draft.skillMoves}
              preferredFoot={draft.preferredFoot}
            />
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Prévia ao vivo do seu jogador
            </p>
          </aside>
        </div>
      </main>
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
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 font-display text-lg font-bold ${highlight ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
