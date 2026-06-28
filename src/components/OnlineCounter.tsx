import { useEffect, useState } from "react";
import { onlinePlayers } from "@/lib/online-count";

interface OnlineCounterProps {
  label: string;
  className?: string;
}

/**
 * Mostra um número de jogadores "online agora" que varia em tempo real,
 * atualizando a cada poucos segundos para simular gente entrando e saindo.
 */
export function OnlineCounter({ label, className }: OnlineCounterProps) {
  const [count, setCount] = useState(() => onlinePlayers());

  useEffect(() => {
    const id = setInterval(() => setCount(onlinePlayers()), 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 ${className ?? ""}`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
      </span>
      <span className="font-display text-sm font-bold tabular-nums text-foreground sm:text-base">
        {count.toLocaleString("pt-BR")}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
