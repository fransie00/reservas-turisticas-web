import Link from "next/link";

/** Retrocede un solo nivel. */
export function Volver({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-block self-start rounded-md border border-cafe-300 px-3 py-1.5 text-sm hover:border-primary dark:border-cafe-700">
      ← {children}
    </Link>
  );
}
