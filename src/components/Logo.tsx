import logoMark from "@/assets/logo-mark.png";

interface LogoProps {
  className?: string;
  /** Mantido por compatibilidade. O texto já faz parte da arte da logo. */
  showText?: boolean;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoMark}
      width={512}
      height={512}
      alt="Pro Soccer Online"
      className={`h-12 w-auto select-none ${className ?? ""}`}
      draggable={false}
    />
  );
}
