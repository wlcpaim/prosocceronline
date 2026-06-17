import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Sparkles,
  GraduationCap,
  Search,
  ShieldCheck,
  Globe2,
  Gauge,
  Zap,
  Target,
  Brain,
  Hand,
  Wind,
  ChevronRight,
  Users,
  Vote,
  CalendarClock,
  Coins,
  ShoppingBag,
  MessageCircle,
  BarChart3,
  Medal,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPlayer from "@/assets/hero-player.jpg";
import trainingAcademy from "@/assets/training-academy.jpg";
import scout from "@/assets/scout.jpg";
import contract from "@/assets/contract.jpg";
import { PlayerEvolution } from "@/components/PlayerEvolution";
import { Logo } from "@/components/Logo";
import { PresaleBanner } from "@/components/PresaleBanner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pro Soccer Online — Sua carreira de jogador começa aqui" },
      {
        name: "description",
        content:
          "Pro Soccer Online: crie seu jogador, comece aos 14 anos, treine na base, seja descoberto por olheiros e evolua em partidas PvP e cooperativas. Sem downloads.",
      },
    ],
    links: [
      { rel: "preload", as: "image", href: heroPlayer, fetchpriority: "high" },
    ],
  }),
  component: Landing,
});

const journeyIcons = [Sparkles, GraduationCap, Search, ShieldCheck];
const journeyImgs = [heroPlayer, trainingAcademy, scout, contract];
const styleIcons = [Wind, Target, Brain, ShieldCheck, Hand, Zap];
const onlineIcons = [Users, Vote, Globe2, MessageCircle];
const systemIcons = [BarChart3, CalendarClock, Coins, ShoppingBag, Medal, Flame];

function Landing() {
  const { t } = useI18n();
  const L = t.landing;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:py-4">
          <a href="#top" className="flex items-center gap-2">
            <Logo />
          </a>
          <div className="flex items-center gap-4">
            <Link
              to="/auth"
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.nav.enter}
            </Link>
            <Button variant="hero" size="sm" asChild className="text-xs sm:text-sm px-4">
              <Link to="/criar-personagem">{t.nav.playNow}</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-20">
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {L.badge}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              {L.heroTitlePre}
              <span className="text-gradient">{L.heroTitleHi}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
              {L.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button variant="hero" size="lg" asChild>
                <a href="#jogar">
                  {L.startCareer} <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#jornada">{L.seeHow}</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-4 gap-3 border-t border-border/60 pt-6">
              {L.stats.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-xl font-bold text-primary sm:text-2xl">
                    {s.value}
                  </div>
                  <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent blur-2xl" />
              <img
                src={heroPlayer}
                width={1280}
                height={1600}
                fetchPriority="high"
                decoding="async"
                alt={L.heroImgAlt}
                className="relative w-full rounded-[1.75rem] border border-border object-cover shadow-elevated"
              />
              <div className="absolute -bottom-4 left-1/2 z-20 flex w-[88%] -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-card/90 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Gauge className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">{L.overall}</div>
                    <div className="font-display text-sm font-bold">{L.todayGain}</div>
                  </div>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {L.live}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pré-venda / Comunidade */}
      <PresaleBanner />

      {/* Jornada */}
      <section id="jornada" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            {L.journeyKicker}
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.journeyTitle}</h2>
          <p className="mt-3 text-muted-foreground">{L.journeySubtitle}</p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {L.journey.map((step, i) => {
            const Icon = journeyIcons[i];
            return (
              <article
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={journeyImgs[i]}
                    loading="lazy"
                    width={1280}
                    height={960}
                    alt={step.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  <span className="absolute right-4 top-4 font-display text-3xl font-bold text-primary/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Estilos */}
      <section className="border-y border-border bg-surface-elevated/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              {L.stylesKicker}
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.stylesTitle}</h2>
            <p className="mt-3 text-muted-foreground">{L.stylesSubtitle}</p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {styleIcons.map((Icon, i) => {
              const name = t.styleName(["Velocista", "Artilheiro", "Maestro", "Muralha", "Goleiro", "Box-to-box"][i]);
              const desc =
                t.lang === "en"
                  ? t.styleDesc(["Velocista", "Artilheiro", "Maestro", "Muralha", "Goleiro", "Box-to-box"][i])
                  : [
                      "Explosão e drible nas pontas",
                      "Faro de gol dentro da área",
                      "Visão de jogo e passe decisivo",
                      "Força e desarme na defesa",
                      "Reflexo e segurança no gol",
                      "Energia do ataque à defesa",
                    ][i];
              return (
                <div
                  key={name}
                  className="group rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
                >
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-bold">{name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
                </div>
              );
            })}
          </div>

          {/* Evolução no modo carreira */}
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.evolveTitle}</h2>
            <p className="mt-3 text-muted-foreground">{L.evolveSubtitle}</p>
          </div>
          <div className="mt-10">
            <PlayerEvolution />
          </div>
        </div>
      </section>

      {/* Online */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              {L.onlineKicker}
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.onlineTitle}</h2>
            <p className="mt-4 text-muted-foreground">{L.onlineSubtitle}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {L.onlineFeatures.map((f, i) => {
                const Icon = onlineIcons[i];
                return (
                  <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h3 className="mt-3 font-display text-sm font-bold">{f.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-primary/15 to-transparent blur-2xl" />
            <img
              src={trainingAcademy}
              loading="lazy"
              width={1280}
              height={960}
              alt={L.onlineImgAlt}
              className="relative w-full rounded-2xl border border-border object-cover shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* Campeonatos */}
      <section className="border-y border-border bg-surface-elevated/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              {L.compsKicker}
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.compsTitle}</h2>
            <p className="mt-3 text-muted-foreground">{L.compsSubtitle}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {L.competitions.map((c) => (
              <div key={c.region} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold">{c.region}</h3>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-lg bg-surface-elevated px-3 py-2 text-xs text-foreground/90"
                    >
                      <Trophy className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sistemas do jogo */}
      <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            {L.systemsKicker}
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{L.systemsTitle}</h2>
          <p className="mt-3 text-muted-foreground">{L.systemsSubtitle}</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {L.systems.map((s, i) => {
            const Icon = systemIcons[i];
            return (
              <div
                key={s.title}
                className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA jogar */}
      <section id="jogar" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center">
          <div className="absolute inset-0 bg-hero-glow" aria-hidden />
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              {L.ctaTitlePre}
              <span className="text-gradient">{L.ctaTitleHi}</span>
            </h2>
            <p className="mt-3 text-muted-foreground">{L.ctaSubtitle}</p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg" className="px-8" asChild>
                <Link to="/criar-personagem">
                  {L.createMyPlayer} <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Logo />
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <Link
              to="/seguranca"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {L.footerSecurity}
            </Link>
            <p className="text-xs text-muted-foreground">{L.footerRights(new Date().getFullYear())}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
