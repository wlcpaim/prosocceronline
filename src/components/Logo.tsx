interface LogoProps {
  className?: string;
  showText?: boolean;
}

// Bola de futebol estilizada (SVG inline, herda as cores do tema)
function Ball({ className }: { className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-primary text-primary-foreground ${className ?? "h-9 w-9"}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 6.2l3.4 2.5-1.3 4h-4.2l-1.3-4L12 6.2z"
          fill="currentColor"
        />
        <path
          d="M12 6.2V3.2M15.4 8.7l2.7-1.2M14.1 12.7l2.3 2.2M9.9 12.7l-2.3 2.2M8.6 8.7L5.9 7.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <span className={`flex items-center gap-2 ${className ?? ""}`}>
      <Ball />
      {showText && (
        <span className="font-display text-lg font-bold leading-tight tracking-tight">
          Pro<span className="text-primary"> Soccer</span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Online
          </span>
        </span>
      )}
    </span>
  );
}
