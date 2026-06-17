import { ATTRIBUTES, type Attrs, computeOverall, withStyleBonus } from "@/lib/player";
import { Star } from "lucide-react";

interface PlayerCardProps {
  name: string;
  position: string;
  nationality?: string;
  overall: number;
  attributes: Attrs;
  weakFoot?: number;
  skillMoves?: number;
  preferredFoot?: string;
  className?: string;
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < count ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
        />
      ))}
    </span>
  );
}

export function PlayerCard({
  name,
  position,
  nationality,
  overall,
  attributes,
  weakFoot,
  skillMoves,
  preferredFoot,
  className,
}: PlayerCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-b from-surface-elevated to-card p-5 shadow-elevated ${className ?? ""}`}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      {/* Top */}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="font-display text-5xl font-bold leading-none text-primary">{overall}</div>
          <div className="mt-1 text-sm font-bold tracking-wide text-foreground/80">{position}</div>
          {nationality && <div className="mt-1 text-xs text-muted-foreground">{nationality}</div>}
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 font-display text-2xl font-bold text-primary">
          {name ? name.charAt(0).toUpperCase() : "?"}
        </div>
      </div>

      <h3 className="relative mt-4 truncate font-display text-xl font-bold uppercase tracking-wide">
        {name || "Seu Craque"}
      </h3>

      {/* 6 categorias */}
      <div className="relative mt-4 grid grid-cols-3 gap-y-3 border-t border-border pt-4">
        {ATTRIBUTES.map((cat) => (
          <div key={cat.key} className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-foreground">
              {attributes[cat.key]}
            </span>
            <span className="text-[11px] font-semibold uppercase text-muted-foreground">
              {cat.short}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      {(weakFoot || skillMoves || preferredFoot) && (
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          {skillMoves != null && (
            <div className="flex items-center gap-1.5">
              <span>Fintas</span>
              <Stars count={skillMoves} />
            </div>
          )}
          {weakFoot != null && (
            <div className="flex items-center gap-1.5">
              <span>Pé ruim</span>
              <Stars count={weakFoot} />
            </div>
          )}
          {preferredFoot && (
            <div className="flex items-center gap-1.5">
              <span>Pé bom</span>
              <span className="font-semibold text-foreground">{preferredFoot}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper para o preview usar atributos já com bônus do estilo + overall calculado
export function previewStats(attrs: Attrs, position: string, styleName: string) {
  const withBonus = withStyleBonus(attrs, styleName);
  return { attrs: withBonus, overall: computeOverall(withBonus, position) };
}
