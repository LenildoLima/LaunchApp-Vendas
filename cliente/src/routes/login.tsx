import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import supabase from "@/api/supabaseClient";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center px-4 pt-32 text-center">
        <h1 className="font-display text-3xl font-bold">Faça seu Login</h1>
        <p className="mb-8 mt-2 text-muted-foreground">
          Acesse para gerenciar seus dados e comprar de forma rápida.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition hover:bg-muted"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="h-6 w-6"
            alt="Google"
          />
          <span className="font-medium">Entrar com Google</span>
        </button>
      </div>
    </div>
  );
}

export default Login;
