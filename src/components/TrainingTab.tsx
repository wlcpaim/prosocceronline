import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Lock, Star, Dumbbell, ChevronRight, Sparkles } from "lucide-react";
import {
  getTraining,
  startTraining,
  startSkillTraining,
  TIERS,
  type TrainingSnapshot,
  type TierKey,
  type SkillKey,
} from "@/lib/training.functions";
import { CATEGORIES, cardCategories, type CatKey } from "@/lib/player";

function fmt(v: number) {
  return Math.round(v * 10) % 10 === 0 ? String(Math.round(v)) : (Math.round(v * 10) / 10).toFixed(1);
}

function duration(untilIso: string | null, now: number) {
  if (!untilIso) return "";
  const ms = new Date(untilIso).getTime() - now;
  if (ms <= 0) return "pronto";
  const s = Math.ceil(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function isActive(until: string | null, now: number) {
  return !!until && new Date(until).getTime() > now;
}

const TIER_ORDER: TierKey[] = ["basico", "avancado", "profissional"];
const TIER_STYLE: Record<TierKey, string> = {
  basico: "border-amber-700/50 hover:bg-amber-700/10",
  avancado: "border-slate-400/50 hover:bg-slate-400/10",
  profissional: "border-yellow-400/60 hover:bg-yellow-400/10",
};

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
        />
      ))}
    </div>
  );
}

export function TrainingTab({ playerId }: { playerId: string }) {
  const fetchTraining = useServerFn(getTraining);
  const trainAttr = useServerFn(startTraining);
  const trainSkill = useServerFn(startSkillTraining);

  const [snap, setSnap] = useState<TrainingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const reloadRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetchTraining({ data: { playerId } });
      if (res.ok) setSnap(res as TrainingSnapshot);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [fetchTraining, playerId]);

  useEffect(() => {
    load();
  }, [load]);

  // tick para countdowns
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // recarrega quando um treino de habilidade conclui (aplica +1 estrela no servidor)
  useEffect(() => {
    if (!snap?.training.skill.until) return;
    const ms = new Date(snap.training.skill.until).getTime() - Date.now();
    if (ms <= 0) return;
    reloadRef.current = window.setTimeout(() => load(), ms + 500);
    return () => {
      if (reloadRef.current) window.clearTimeout(reloadRef.current);
    };
  }, [snap?.training.skill.until, load]);

  const handleTrain = async (catKey: CatKey, tier: TierKey) => {
    setBusy(`${catKey}-${tier}`);
    try {
      const res = await trainAttr({ data: { playerId, catKey, tier } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSnap(res as TrainingSnapshot);
      const r = (res as TrainingSnapshot).result;
      if (r?.changes && r.changes.length > 0) {
        toast.success(
          `Treino ${TIERS[tier].label} concluído — ${r.beforeCatOverall} → ${r.afterCatOverall}`,
        );
      } else {
        toast.info("Atributos já estão no teto (99).");
      }
    } catch {
      toast.error("Não foi possível treinar agora.");
    } finally {
      setBusy(null);
    }
  };

  const handleSkill = async (skill: SkillKey) => {
    setBusy(`skill-${skill}`);
    try {
      const res = await trainSkill({ data: { playerId, skill } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setSnap(res as TrainingSnapshot);
      toast.success("Treino de habilidade iniciado — conclui em 1 semana (+1 estrela).");
    } catch {
      toast.error("Não foi possível iniciar o treino.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!snap) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar o centro de treinamento.
      </div>
    );
  }

  const cats = cardCategories(snap.position);
  const globalLocked = isActive(snap.training.globalLockUntil, now);
  const skillActive = isActive(snap.training.skill.until, now);

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-surface-elevated/40 px-5 py-4">
        <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/10 text-primary">
          <Dumbbell className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Centro de Treinamento
          </div>
          <div className="font-display text-lg font-bold">Evolua seus atributos</div>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-primary">{snap.overall}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Overall</div>
          </div>
          <div className="text-center">
            <div className="font-display text-2xl font-bold text-accent">{snap.potential}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Potencial</div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid gap-4">
        {cats.map((catKey) => {
          const def = CATEGORIES.find((c) => c.key === catKey)!;
          const catOvr = Math.round(
            def.attrs.reduce((a, at) => a + (snap.attributes[at.key] ?? 35), 0) / def.attrs.length,
          );
          let trainingHere: string | null = null;
          for (const t of TIER_ORDER) {
            const slot = snap.training[t];
            if (slot.key === catKey && isActive(slot.until, now)) {
              trainingHere = `Treino ${TIERS[t].label} · libera em ${duration(slot.until, now)}`;
            }
          }
          return (
            <div
              key={catKey}
              className={`rounded-2xl border bg-card p-5 transition-colors ${
                trainingHere ? "border-primary/60" : "border-border"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary/40 font-display text-xs font-bold text-primary">
                    {def.short}
                  </span>
                  <h3 className="font-display text-base font-bold">{def.label}</h3>
                </div>
                <span className="font-display text-xl font-bold">{catOvr}</span>
              </div>

              {trainingHere && (
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <Lock className="h-3 w-3" /> {trainingHere}
                </div>
              )}

              <div className="mb-4 grid gap-x-5 gap-y-2 sm:grid-cols-2">
                {def.attrs.map((at) => {
                  const v = snap.attributes[at.key] ?? 35;
                  return (
                    <div key={at.key} className="flex items-center gap-2.5">
                      <span className="flex-1 truncate text-xs text-muted-foreground">{at.label}</span>
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-elevated">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${Math.min(100, v)}%` }}
                        />
                      </span>
                      <span className="w-7 text-right text-xs font-bold tabular-nums">{fmt(v)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {TIER_ORDER.map((tier) => {
                  const slot = snap.training[tier];
                  const tierBusy = isActive(slot.until, now);
                  const disabled =
                    tierBusy || globalLocked || busy === `${catKey}-${tier}`;
                  return (
                    <button
                      key={tier}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleTrain(catKey, tier)}
                      className={`flex-1 min-w-[130px] rounded-xl border bg-surface-elevated/40 px-3 py-2.5 text-left transition-all disabled:cursor-not-allowed disabled:opacity-45 ${TIER_STYLE[tier]}`}
                    >
                      <span className="block text-xs font-bold capitalize text-foreground">
                        {TIERS[tier].label}
                      </span>
                      <span className="block font-display text-base font-bold text-primary">
                        +{TIERS[tier].add}
                      </span>
                      <span className="block text-[10px] font-semibold text-muted-foreground">
                        {busy === `${catKey}-${tier}` ? (
                          <Loader2 className="inline h-3 w-3 animate-spin" />
                        ) : tierBusy ? (
                          `em uso · ${duration(slot.until, now)}`
                        ) : globalLocked ? (
                          `troca · ${duration(snap.training.globalLockUntil, now)}`
                        ) : (
                          "pronto agora"
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skills */}
      <div>
        <p className="mb-3 mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Habilidades técnicas
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {([
            { key: "weakFoot" as SkillKey, label: "Pé ruim", stars: snap.weakFoot },
            { key: "skillMoves" as SkillKey, label: "Fintas", stars: snap.skillMoves },
          ]).map((sk) => {
            const ownTraining = snap.training.skill.key === sk.key && skillActive;
            const blockedByOther = skillActive && snap.training.skill.key !== sk.key;
            const maxed = sk.stars >= 5;
            const disabled = ownTraining || blockedByOther || maxed || busy === `skill-${sk.key}`;
            return (
              <div
                key={sk.key}
                className={`rounded-2xl border bg-card p-5 ${ownTraining ? "border-primary/60" : "border-border"}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-display text-base font-bold">{sk.label}</h3>
                  <div className="flex items-center gap-2">
                    <Stars value={sk.stars} />
                    <span className="text-xs font-bold text-muted-foreground">{sk.stars}/5</span>
                  </div>
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  {maxed
                    ? "Nível máximo atingido."
                    : ownTraining
                      ? `Em treinamento — conclui em ${duration(snap.training.skill.until, now)}`
                      : blockedByOther
                        ? `Bloqueado — outra habilidade treinando (${duration(snap.training.skill.until, now)})`
                        : "Disponível. Cada treino dura 1 semana e dá +1 estrela."}
                </p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSkill(sk.key)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary/10 px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:border-border disabled:opacity-45"
                >
                  {busy === `skill-${sk.key}` ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : maxed ? (
                    "Nível máximo"
                  ) : ownTraining ? (
                    `Treinando · ${duration(snap.training.skill.until, now)}`
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Treinar {sk.label}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-2xl border border-border bg-card px-5 py-4 text-[11px] leading-relaxed text-muted-foreground">
        <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
        Básico +0,5 · Avançado +1,5 · Profissional +5 por atributo (teto 99). Após treinar, aguarde 5
        min para treinar outra categoria. Cada tipo libera em 1h / 24h / 7 dias. Pé ruim e Fintas
        evoluem +1 estrela por semana, uma de cada vez.
      </p>
    </div>
  );
}
