import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, FormEvent } from "react";
import { Header } from "@/components/Header";
import supabase from "@/api/supabaseClient";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

type Mode = "login" | "cadastro";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [busy, setBusy] = useState(false);

  // Campos
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) throw new Error("Email ou senha inválidos");
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao fazer login");
    } finally {
      setBusy(false);
    }
  };

  const handleCadastro = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return toast.error("Informe seu nome");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Email inválido");
    if (senha.length < 6) return toast.error("Senha deve ter no mínimo 6 caracteres");
    if (senha !== confirmar) return toast.error("As senhas não são iguais");

    setBusy(true);
    try {
      // Verificar se email já existe em clientes
      const { data: existing } = await supabase
        .from("clientes")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existing) {
        toast.error("Email já cadastrado. Faça login.");
        setMode("login");
        setBusy(false);
        return;
      }

      // Criar usuário via Supabase Auth (senha hasheada no servidor)
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { full_name: nome } },
      });

      if (error) throw new Error(error.message);

      // Sincroniza com tabela clientes
      if (data.user) {
        await supabase.from("clientes").insert([
          {
            id: data.user.id,
            email,
            nome,
            google_id: null,
          },
        ]);
      }

      toast.success("Conta criada! Você já está logado.");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao criar conta");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-16 pb-24">
        {/* Cabeçalho */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold">
            {mode === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            {mode === "login"
              ? "Acesse sua conta para continuar comprando."
              : "Cadastre-se e comece a comprar agora."}
          </p>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border bg-card p-8 shadow-sm space-y-6">
          {/* Tab switcher */}
          <div className="flex rounded-xl border p-1 gap-1">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode("cadastro")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                mode === "cadastro"
                  ? "bg-accent text-accent-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar conta
            </button>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background p-3 text-sm font-medium shadow-sm transition hover:bg-muted"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="h-5 w-5"
              alt="Google"
            />
            Continuar com Google
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Formulário Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Senha <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Entrar
              </button>
            </form>
          )}

          {/* Formulário Cadastro */}
          {mode === "cadastro" && (
            <form onSubmit={handleCadastro} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Nome completo <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Email <span className="text-accent">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Senha <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSenha ? "text" : "password"}
                    required
                    minLength={6}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-11 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Confirmar Senha <span className="text-accent">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmar ? "text" : "password"}
                    required
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="Repita a senha"
                    className={`h-11 w-full rounded-xl border bg-background px-4 pr-12 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${
                      confirmar && confirmar !== senha ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmar && confirmar !== senha && (
                  <p className="mt-1 text-xs text-destructive">As senhas não são iguais</p>
                )}
              </div>
              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Criar conta
              </button>
            </form>
          )}
        </div>

        {/* Troca de modo (mobile-friendly) */}
        <p className="mt-6 text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              Não tem conta?{" "}
              <button
                onClick={() => setMode("cadastro")}
                className="font-semibold text-accent hover:underline"
              >
                Cadastre-se aqui
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-semibold text-accent hover:underline"
              >
                Faça login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default Login;
