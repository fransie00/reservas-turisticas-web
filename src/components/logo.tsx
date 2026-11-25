/** Isotipo de Explora: montañas y sol sobre fondo naranja. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="8" fill="#c2410c" />
      <circle cx="22.5" cy="10.5" r="3" fill="#fdba74" />
      <path d="M11 25 18 14.5 29 25Z" fill="#fed7aa" />
      <path d="M3 25 12.5 10.5 22 25Z" fill="#fff7ed" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="text-xl font-bold tracking-tight">Explora</span>
    </span>
  );
}
