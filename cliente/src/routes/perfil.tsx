import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";
import supabase from "@/api/supabaseClient";
import { toast } from "sonner";
import { Save } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  component: Perfil,
});

function Perfil() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setNome(data.nome || "");
        setTelefone(data.telefone || "");
        setEndereco(data.endereco || "");
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSalvando(true);
    const { error } = await supabase
      .from("clientes")
      .update({ nome, telefone, endereco })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao atualizar perfil");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    setSalvando(false);
  };


  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold">Meu Perfil</h1>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-6 rounded-3xl border bg-card p-6 sm:p-8">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nome</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-4 outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <input
                  readOnly
                  disabled
                  value={user.email || ""}
                  className="h-11 w-full rounded-xl border bg-background/50 px-4 text-muted-foreground outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Telefone</label>
                <input
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-4 outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Endereço Padrão
                </label>
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="h-11 w-full rounded-xl border bg-background px-4 outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={salvando}
                className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Perfil;
