import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getMyAccess } from "@/lib/payment.functions";

/**
 * Bloqueia o acesso ao painel até o pagamento ser confirmado.
 * O Owner/admin passa livre (has_access retorna true para admin no servidor).
 * Toda a verificação é feita na nuvem — o cliente nunca decide o acesso.
 */
export function AccessGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const access = useServerFn(getMyAccess);
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const a = await access({});
        if (!active) return;
        if (a.hasAccess) {
          setAllowed(true);
        } else {
          navigate({ to: "/pagamento", replace: true });
        }
      } catch {
        if (active) navigate({ to: "/pagamento", replace: true });
      } finally {
        if (active) setChecking(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
