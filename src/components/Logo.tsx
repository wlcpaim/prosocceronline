import logoMark from "@/assets/logo-mark.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <img
        src={logoMark}
        width={512}
        height={512}
        alt="Pro Soccer Online Logo"
        className="h-12 w-auto select-none"
        draggable={false}
      />
      {showText && (
        <div className="flex flex-col leading-[1.1]">
          <span className="font-display text-base font-bold tracking-tight text-foreground">
            Pro Soccer
          </span>
          <span className="font-display text-[11px] font-semibold tracking-widest text-primary uppercase">
            Online
          </span>
        </div>
      )}
    </div>
  );
}
