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
  Apple,
  Play,
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
  { value: "35", label: "Atributos detalhados" },
  { value: "PvP", label: "e cooperativo" },
  { value: "14", label: "Anos para começar" },
  { value: "6 em 6", label: "Meses por temporada" },
];

const competitions = [
  { region: "🇧🇷 Brasil", items: ["Brasileirão Série A", "Copa do Brasil", "Estaduais", "Sub-20 & Copinha"] },
  { region: "🌍 Mundo", items: ["Champions League", "Libertadores", "Copa do Mundo", "Mundial de Clubes"] },
];

const onlineFeatures = [
  {
    icon: Users,
    title: "Times cooperativos",
    desc: "Jogue sozinho com total autonomia ou divida o clube com outros jogadores reais.",
  },
  {
    icon: Vote,
    title: "Votação tática",
    desc: "Antes de cada partida o time vota na formação. Capitão tem voto de desempate.",
  },
  {
    icon: Globe2,
    title: "Partidas automáticas",
    desc: "Os jogos acontecem no horário marcado, com ou sem você online. O mundo nunca para.",
  },
  {
    icon: MessageCircle,
    title: "Chat global e do time",
    desc: "Conexão ao vivo com a comunidade, gols em tempo real e vestiário privado do clube.",
  },
];

const systems = [
  {
    icon: BarChart3,
    title: "Simulação justa",
    desc: "Motor com xG, momentum e fator zebra: o favorito nunca passa de 70% de chance.",
  },
  {
    icon: CalendarClock,
    title: "Temporadas vivas",
    desc: "A cada 6 meses elencos e transferências reais são atualizados — sua carreira permanece.",
  },
  {
    icon: Coins,
    title: "Economia de carreira",
    desc: "Salário, bônus por gol e premiações de títulos. Sem dinheiro real: tudo é conquistado jogando.",
  },
  {
    icon: ShoppingBag,
    title: "Loja de evolução",
    desc: "Chuteiras, agente, personal trainer e nutricionista para turbinar seus atributos.",
  },
  {
    icon: Medal,
    title: "Marcos de carreira",
    desc: "Primeiro gol, 100 jogos, convocação para a seleção e o cobiçado status de estrela 90+.",
  },
  {
    icon: Flame,
    title: "Clássicos e finais",
    desc: "Jogos decisivos rendem mais XP e definem sua reputação na geração.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:py-4">
          <a href="#top" className="flex items-center gap-2">
            <Logo />
          </a>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
            <Button variant="hero" size="sm" asChild className="order-1 sm:order-2 text-xs sm:text-sm py-1.5 h-auto sm:h-9">
              <Link to="/criar-personagem">Jogar agora</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="order-2 sm:order-1 text-xs sm:text-sm py-1 h-auto sm:h-9">
              <Link to="/auth">Entrar</Link>
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
              Manager de carreira individual · PvP e cooperativo
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              Da escola de base ao <span className="text-gradient">estrelato mundial</span>
            </h1>
            <p className="mx-auto mt-5 max-w-md text-base text-muted-foreground md:mx-0 md:text-lg">
              Pro Soccer Online: crie seu jogador e comece a escrever a sua história
              rumo ao topo. Sem downloads, jogue de qualquer dispositivo.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center md:justify-start">
              <Button variant="hero" size="lg" asChild>
                <a href="#jogar">
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

      {/* Pré-venda / Comunidade */}
      <PresaleBanner />

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
            Quatro etapas que definem a sua trajetória dentro do Pro Soccer Online.
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

          {/* Evolução no modo carreira */}
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Evolua
            </h2>
            <p className="mt-3 text-muted-foreground">
              Cada treino e partida aumenta seus atributos
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
              Multiplayer cooperativo
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Evolua online contra o mundo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Os times jogam suas rodadas automaticamente e você disputa espaço
              com jogadores reais. Decida as táticas, conquiste títulos e prove
              que é o melhor da sua geração.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {onlineFeatures.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                    <f.icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 font-display text-sm font-bold">{f.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
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

      {/* Campeonatos */}
      <section className="border-y border-border bg-surface-elevated/40">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Campeonatos reais
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Dispute as competições de verdade
            </h2>
            <p className="mt-3 text-muted-foreground">
              Da base ao profissional, do Brasileirão à Champions e à Copa do Mundo.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {competitions.map((c) => (
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
            Por dentro do jogo
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Um mundo de futebol completo
          </h2>
          <p className="mt-3 text-muted-foreground">
            Simulação realista, temporadas vivas e uma economia que recompensa
            quem joga de verdade.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {systems.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* CTA jogar */}
      <section id="jogar" className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-14 text-center">
          <div className="absolute inset-0 bg-hero-glow" aria-hidden />
          <div className="relative z-10 mx-auto max-w-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Sua carreira começa <span className="text-gradient">agora</span>
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pro Soccer Online, crie seu jogador e comece a escrever a sua história rumo
              ao topo. Sem downloads, jogue de qualquer dispositivo.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="lg" className="px-8" asChild>
                <Link to="/criar-personagem">
                  Criar meu jogador <ChevronRight className="h-5 w-5" />
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pro Soccer Online. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
