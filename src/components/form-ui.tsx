import type { ComponentProps } from "react";

export function Field({
  label,
  id,
  ...props
}: { label: string; id: string } & ComponentProps<"input">) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 dark:border-zinc-700"
        {...props}
      />
    </div>
  );
}

export function FormErrors({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <ul
      role="alert"
      className="list-disc rounded-md bg-red-50 py-2 pl-7 pr-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
    >
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
    >
      {pending ? "Enviando…" : children}
    </button>
  );
}
