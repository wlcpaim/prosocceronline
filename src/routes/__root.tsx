import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
 
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import logoMark from "../assets/logo-mark.png";
import { I18nProvider } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pro Soccer Online — Sua carreira de jogador começa aqui" },
      {
        name: "description",
        content:
          "Pro Soccer Online: crie seu jogador, comece aos 14 anos, treine na base e evolua em partidas PvP e cooperativas. Manager de carreira individual de futebol.",
      },
      { name: "author", content: "Pro Soccer Online" },
      { name: "google-site-verification", content: "WbKctHZ-gxFIqZ0yTx5jxb7nnE7BfYDWA6dUWnNno1k" },
      { property: "og:title", content: "Pro Soccer Online — Sua carreira de jogador começa aqui" },
      {
        property: "og:description",
        content:
          "Crie seu jogador, treine na base e evolua em partidas PvP e cooperativas. O futebol de carreira individual no seu navegador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@ProSoccerOnline" },
      { name: "twitter:title", content: "Pro Soccer Online — Sua carreira de jogador começa aqui" },
      {
        name: "twitter:description",
        content:
          "Crie seu jogador, treine na base e evolua em partidas PvP e cooperativas no Pro Soccer Online.",
      },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a04f67ae-cb24-4ca2-a888-f0cf9dd70773/id-preview-427e8e79--8d5dfa4b-f4b3-473f-b0ed-a599b3f5385e.lovable.app-1781662124762.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/a04f67ae-cb24-4ca2-a888-f0cf9dd70773/id-preview-427e8e79--8d5dfa4b-f4b3-473f-b0ed-a599b3f5385e.lovable.app-1781662124762.png" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/png",
        href: logoMark,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <LanguageSwitcher className="absolute top-[80px] sm:top-[96px] left-5 z-40" />
        <Toaster theme="dark" position="top-center" richColors />
      </I18nProvider>
    </QueryClientProvider>
  );
}
