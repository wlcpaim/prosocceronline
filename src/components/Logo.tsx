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
        className="h-10 w-auto select-none"
        draggable={false}
      />
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Pro Soccer <span className="text-primary">Online</span>
        </span>
      )}
    </div>
  );
}
