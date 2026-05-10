import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { useAuth } from "@/store/auth";
import { useEffect, useState } from "react";
import supabase from "@/api/supabaseClient";
import { ArrowLeft, Package } from "lucide-react";
import { formatBRL } from "@/store/cart";

export const Route = createFileRoute("/meus-pedidos")({
  component: MeusPedidos,
});

function MeusPedidos() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [user, isLoading, navigate]);

  useEffect(() => {
    async function getPedidos() {
      if (!user) return;
      const { data } = await supabase
        .from("pedidos")
        .select(`
          *,
          itens_pedido (
            quantidade,
            preco_unitario,
            produtos (nome)
          )
        `)
        .eq("cliente_id", user.id)
        .order("criado_em", { ascending: false });

      if (data) setPedidos(data);
      setLoadingPedidos(false);
    }
    getPedidos();
  }, [user]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/perfil"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Perfil
        </Link>

        <h1 className="mt-4 font-display text-3xl font-bold">Meus Pedidos</h1>

        <div className="mt-8 space-y-6">
          {loadingPedidos ? (
            <p className="text-muted-foreground">Carregando seus pedidos...</p>
          ) : pedidos.length === 0 ? (
            <div className="rounded-3xl border bg-card p-12 text-center text-muted-foreground">
              <Package className="mx-auto h-12 w-12 opacity-20" />
              <p className="mt-4 font-medium">Nenhum pedido encontrado.</p>
              <Link
                to="/"
                className="mt-4 inline-block text-accent hover:underline"
              >
                Voltar ao catálogo
              </Link>
            </div>
          ) : (
            pedidos.map((pedido) => (
              <div key={pedido.id} className="rounded-2xl border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Pedido #{pedido.numero_pedido || pedido.id.split("-")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Data: {new Date(pedido.criado_em).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {formatBRL(pedido.total || 0)}
                    </p>
                    <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase text-accent">
                      {pedido.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-medium">Itens:</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {pedido.itens_pedido?.map((item: any, i: number) => (
                      <li key={i}>
                        {item.quantidade}x {item.produtos?.nome || "Item"}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default MeusPedidos;
