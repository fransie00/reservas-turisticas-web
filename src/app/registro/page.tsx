import Link from "next/link";
import { RegisterForm } from "@/components/register-form";

export default function RegistroPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <RegisterForm />
      <p className="text-sm text-cafe-600 dark:text-cafe-400">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Inicia sesión
        </Link>
      </p>
    </main>
  );
}
