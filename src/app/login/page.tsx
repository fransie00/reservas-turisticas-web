import Link from "next/link";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <LoginForm />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-blue-600 hover:underline">
          Regístrate
        </Link>
      </p>
    </main>
  );
}
