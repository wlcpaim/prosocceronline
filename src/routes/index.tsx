import { createFileRoute } from "@tanstack/react-router";
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
  Apple,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import heroPlayer from "@/assets/hero-player.jpg";
import trainingAcademy from "@/assets/training-academy.jpg";
import scout from "@/assets/scout.jpg";
import contract from "@/assets/contract.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fut Manager Online — Sua carreira de jogador começa aqui" },
      {
        name: "description",
        content:
          "Comece aos 14 anos, treine na base, seja descoberto por olheiros e evolua online contra outros jogadores. O manager de carreira individual de futebol.",
      },
    ],
  }),
  component: Landing,
});

const journey = [
  {
    n: "01",
    title: "Comece aos 14 anos",
    desc: "Crie seu jogador do zero e entre na escola de treino. Toda lenda começa pequena.",
    icon: Sparkles,
    img: heroPlayer,
  },
  {
    n: "02",
    title: "Treine na escola de base",
    desc: "Aprimore atributos, defina sua posição e evolua treino após treino até se destacar.",
    icon: GraduationCap,
    img: trainingAcademy,
  },
  {
    n: "03",
    title: "Seja visto por olheiros",
    desc: "Quando você brilha, um olheiro de um time se interessa. Sua chance de ser notado.",
    icon: Search,
    img: scout,
  },
  {
    n: "04",
    title: "Aceite e assine contrato",
    desc: "Negocie as condições, treine na base do clube e seja contratado como profissional.",
    icon: ShieldCheck,
    img: contract,
  },
];

const styles = [
  { name: "Velocista", desc: "Explosão e drible nas pontas", icon: Wind },
  { name: "Artilheiro", desc: "Faro de gol dentro da área", icon: Target },
  { name: "Maestro", desc: "Visão de jogo e passe decisivo", icon: Brain },
  { name: "Muralha", desc: "Força e desarme na defesa", icon: ShieldCheck },
  { name: "Goleiro", desc: "Reflexo e segurança no gol", icon: Hand },
  { name: "Box-to-box", desc: "Energia do ataque à defesa", icon: Zap },
];

const stats = [
  { value: "100%", label: "Carreira individual" },
  { value: "1v1", label: "Online entre jogadores" },
  { value: "14", label: "Anos para começar" },
  { value: "∞", label: "Evolução do seu craque" },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Fut<span className="text-primary">Manager</span>
            </span>
          </a>
          <Button variant="hero" size="sm" asChild>
            <a href="#download">Jogar agora</a>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-glow" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:pb-24 md:pt-20">
          <div className="relative z-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Manager de carreira individual
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              Da escola de base ao <span className="text-gradient">estrelato mundial</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
              Crie seu jogador aos 14 anos, treine, seja descoberto por olheiros e
              evolua online contra outros craques. Sua carreira, sua história.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button variant="hero" size="lg" asChild>
                <a href="#download">
                  Começar carreira <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#jornada">Ver como funciona</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-4 gap-3 border-t border-border/60 pt-6">
              {stats.map((s) => (
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
                alt="Jovem jogador de futebol no estádio iluminado"
                className="relative w-full rounded-[1.75rem] border border-border object-cover shadow-elevated"
              />
              <div className="absolute -bottom-4 left-1/2 z-20 flex w-[88%] -translate-x-1/2 items-center justify-between rounded-2xl border border-border bg-card/90 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                    <Gauge className="h-4 w-4" />
                  </span>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Overall</div>
                    <div className="font-display text-sm font-bold">+0.4 hoje</div>
                  </div>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  AO VIVO
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jornada */}
      <section id="jornada" className="mx-auto max-w-6xl px-5 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Sua jornada
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Do garoto ao profissional
          </h2>
          <p className="mt-3 text-muted-foreground">
            Quatro etapas que definem a sua trajetória dentro do Fut Manager Online.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {journey.map((step) => (
            <article
              key={step.n}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={step.img}
                  loading="lazy"
                  width={1280}
                  height={960}
                  alt={step.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                <span className="absolute right-4 top-4 font-display text-3xl font-bold text-primary/80">
                  {step.n}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Estilos */}
      <section className="border-y border-border bg-surface-elevated/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Escolha seu estilo
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Qual craque você quer ser?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Defina o DNA do seu jogador e desenvolva atributos únicos.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {styles.map((s) => (
              <div
                key={s.name}
                className="group rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{s.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Evolução estilo FIFA modo carreira */}
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Modo carreira
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Acompanhe seu Overall crescer
            </h2>
            <p className="mt-3 text-muted-foreground">
              Como no modo carreira, cada treino e partida aumenta seus atributos
              e seu score geral rumo ao seu potencial máximo.
            </p>
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
              Multiplayer
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Evolua online contra o mundo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Os times jogam suas rodadas normalmente e você disputa espaço com
              jogadores reais. Suba de nível, conquiste títulos e prove que é o
              melhor da sua geração.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Globe2, t: "Partidas e ligas online em tempo real" },
                { icon: Gauge, t: "Atributos que evoluem a cada treino e jogo" },
                { icon: Trophy, t: "Ranking global e disputa por contratos" },
              ].map((f) => (
                <li key={f.t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-foreground/90">{f.t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-primary/15 to-transparent blur-2xl" />
            <img
              src={trainingAcademy}
              loading="lazy"
              width={1280}
              height={960}
              alt="Jogadores treinando na escola de base"
              className="relative w-full rounded-2xl border border-border object-cover shadow-elevated"
            />
          </div>
        </div>
      </section>

      {/* CTA download */}
      <section id="download" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center">
          <div className="absolute inset-0 bg-hero-glow" aria-hidden />
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Sua carreira começa <span className="text-gradient">agora</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Baixe o Fut Manager Online, crie seu jogador e comece a escrever a
              sua história rumo ao topo.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg">
                <Apple className="h-5 w-5" /> App Store
              </Button>
              <Button variant="outline" size="lg">
                <Play className="h-5 w-5" /> Google Play
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </span>
            <span className="font-display text-sm font-bold">
              Fut<span className="text-primary">Manager</span> Online
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Fut Manager Online. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
