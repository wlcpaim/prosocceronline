import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Lock,
  Database,
  ServerCog,
  CreditCard,
  UserCheck,
  Trash2,
  Mail,
  ChevronLeft,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança e Privacidade — Pro Soccer Online" },
      {
        name: "description",
        content:
          "Como o Pro Soccer Online protege sua conta e seus dados: autenticação, banco de dados com regras de acesso, cálculos no servidor (anti-trapaça) e pagamentos Pix processados por parceiro.",
      },
      { name: "robots", content: "index,follow" },
      { property: "og:title", content: "Segurança e Privacidade — Pro Soccer Online" },
      {
        property: "og:description",
        content:
          "Como o Pro Soccer Online protege sua conta e seus dados: autenticação, regras de acesso, cálculos no servidor (anti-trapaça) e pagamentos Pix.",
      },
      { property: "og:url", content: "https://prosoccer.online/seguranca" },
    ],
    links: [{ rel: "canonical", href: "https://prosoccer.online/seguranca" }],
  }),
  component: SecurityPage,
});

const controls = [
  {
    icon: UserCheck,
    title: "Autenticação de conta",
    desc: "O acesso é protegido por login com e-mail e senha (e provedores sociais quando habilitados). Cada pessoa só acessa a própria conta após autenticação.",
  },
  {
    icon: Database,
    title: "Banco de dados com regras de acesso",
    desc: "Os dados ficam em um banco de dados gerenciado na nuvem com regras de acesso por linha (Row-Level Security). Cada usuário só consegue ler e gerenciar os próprios registros.",
  },
  {
    icon: ServerCog,
    title: "Cálculos no servidor (anti-trapaça)",
    desc: "Atributos, overall e progressão do jogador são calculados exclusivamente no servidor. O aplicativo nunca confia em valores enviados pelo navegador, dificultando o uso de ferramentas de trapaça.",
  },
  {
    icon: Lock,
    title: "Escrita apenas pelo servidor",
    desc: "A criação e a alteração de dados sensíveis do jogo (jogadores, assinaturas e cargos) acontecem apenas por funções de servidor confiáveis — não é possível editar esses dados diretamente.",
  },
  {
    icon: CreditCard,
    title: "Pagamentos Pix",
    desc: "Os pagamentos via Pix são processados por um provedor de pagamentos parceiro. A confirmação chega ao jogo por um canal de notificação verificado. Não armazenamos dados de cartão.",
  },
  {
    icon: Mail,
    title: "Comunicação por e-mail",
    desc: "E-mails do sistema (como confirmação de conta) são enviados por filas no servidor. Você pode solicitar o cancelamento de comunicações a qualquer momento.",
  },
  {
    icon: Trash2,
    title: "Seus dados, seu controle",
    desc: "Você pode visualizar e excluir o seu jogador dentro do aplicativo. Para solicitar a remoção da conta e dos dados associados, entre em contato com a equipe.",
  },
];

function SecurityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link to="/" aria-label="Pro Soccer Online — início">
            <Logo />
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ChevronLeft className="h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Confiança e proteção
          </span>
        </div>

        <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
          Segurança e Privacidade
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Esta página é mantida pela equipe do Pro Soccer Online para explicar, de
          forma simples, as principais práticas de segurança e privacidade do jogo.
          Ela descreve controles atualmente ativos no aplicativo e pode ser
          atualizada conforme o jogo evolui.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {controls.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-base font-bold">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Responsabilidade compartilhada</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            A segurança envolve diferentes partes. A infraestrutura de nuvem que
            hospeda o jogo oferece recursos de plataforma, como conexões
            criptografadas em trânsito (HTTPS) e um banco de dados gerenciado. A
            equipe do Pro Soccer Online é responsável pelas regras de acesso, pela
            lógica do jogo no servidor e pelo tratamento dos dados dentro do
            aplicativo. Você, como jogador, ajuda mantendo sua senha em segredo e
            usando uma senha forte e exclusiva.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Relatar um problema de segurança</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Encontrou uma possível falha de segurança ou tem dúvidas sobre
            privacidade? Entre em contato com a equipe do Pro Soccer Online pelos
            canais oficiais de suporte. Pedimos que você não divulgue publicamente o
            problema antes de nos dar a oportunidade de corrigi-lo.
          </p>
        </section>

        <p className="mt-10 text-xs text-muted-foreground">
          Conteúdo informativo mantido pela equipe do Pro Soccer Online. Não
          constitui certificação independente nem garantia legal. As práticas podem
          mudar; consulte esta página para a versão mais recente.
        </p>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
          <Logo />
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Pro Soccer Online. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
