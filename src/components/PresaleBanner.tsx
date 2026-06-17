import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Users, UserCheck, ChevronRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FULL_PRICE,
  PRESALE_PRICE,
  PRESALE_END,
  isPresaleActive,
  formatBRL,
} from "@/lib/pricing";
import { getPlayerStats } from "@/lib/stats.functions";

function getRemaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, ended: diff <= 0 };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="grid min-w-[3.5rem] place-items-center rounded-xl border border-border bg-card px-3 py-3 font-display text-3xl font-bold text-foreground tabular-nums sm:min-w-[4.5rem] sm:text-4xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function PresaleBanner() {
  const fetchStats = useServerFn(getPlayerStats);
  const [remaining, setRemaining] = useState(() => getRemaining(PRESALE_END));
  const [active, setActive] = useState(() => isPresaleActive());
  const [stats, setStats] = useState<{ online: number; registered: number } | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      const r = getRemaining(PRESALE_END);
      setRemaining(r);
      if (r.ended) setActive(false);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Quando a pré-venda acaba, busca os números de jogadores.
  useEffect(() => {
    if (active) return;
    let mounted = true;
    fetchStats({})
      .then((s) => {
        if (mounted) setStats(s);
      })
      .catch(() => {});
    const id = setInterval(() => {
      fetchStats({})
        .then((s) => {
          if (mounted) setStats(s);
        })
        .catch(() => {});
    }, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-card px-6 py-10 text-center shadow-glow">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="relative z-10 mx-auto max-w-2xl">
          {active ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Flame className="h-4 w-4" /> Pré-venda · 50% OFF
              </span>
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                Garanta seu acesso com <span className="text-gradient">50% de desconto</span>
              </h2>
              <p className="mt-3 text-muted-foreground">
                Oferta de lançamento por tempo limitado. Quando o contador zerar, o
                desconto acaba.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="text-lg text-muted-foreground line-through">
                  {formatBRL(FULL_PRICE)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 font-display text-xl font-bold text-primary-foreground">
                  <Tag className="h-4 w-4" /> {formatBRL(PRESALE_PRICE)}
                </span>
              </div>

              <div className="mt-8 flex items-end justify-center gap-3 sm:gap-4">
                <TimeBox value={remaining.days} label="Dias" />
                <TimeBox value={remaining.hours} label="Horas" />
                <TimeBox value={remaining.minutes} label="Min" />
                <TimeBox value={remaining.seconds} label="Seg" />
              </div>

              <div className="mt-8">
                <Button variant="hero" size="lg" className="px-8" asChild>
                  <Link to="/criar-personagem">
                    Aproveitar a pré-venda <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-primary/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Users className="h-4 w-4" /> Comunidade ao vivo
              </span>
              <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                A bola já está rolando
              </h2>
              <p className="mt-3 text-muted-foreground">
                Acesso por {formatBRL(FULL_PRICE)}. Entre agora e dispute espaço com
                jogadores do mundo todo.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Users className="h-5 w-5" />
                  </span>
                  <div className="mt-3 font-display text-3xl font-bold text-primary tabular-nums sm:text-4xl">
                    {stats ? stats.online.toLocaleString("pt-BR") : "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Jogadores online</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                    <UserCheck className="h-5 w-5" />
                  </span>
                  <div className="mt-3 font-display text-3xl font-bold tabular-nums sm:text-4xl">
                    {stats ? stats.registered.toLocaleString("pt-BR") : "—"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Jogadores cadastrados</div>
                </div>
              </div>

              <div className="mt-8">
                <Button variant="hero" size="lg" className="px-8" asChild>
                  <Link to="/criar-personagem">
                    Entrar agora <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
