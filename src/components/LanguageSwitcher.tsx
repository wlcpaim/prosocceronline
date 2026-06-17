import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { code: Lang; flag: string; label: string }[] = [
  { code: "pt", flag: "🇧🇷", label: "PT" },
  { code: "en", flag: "🇺🇸", label: "EN" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-full border border-border bg-card/80 p-0.5 backdrop-blur-md ${className ?? ""}`}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLang(o.code)}
          aria-pressed={lang === o.code}
          title={o.code === "pt" ? "Português" : "English"}
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold transition-colors ${
            lang === o.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-sm leading-none">{o.flag}</span>
          <span>{o.label}</span>
        </button>
      ))}
    </div>
  );
}
