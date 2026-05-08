import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { formatBRL } from "@/store/cart";
import { useOrder } from "@/store/order";
import { Header } from "@/components/Header";
import { toast } from "sonner";

export const Route = createFileRoute("/sucesso")({
  component: Success,
});

function Success() {
  const order = useOrder((s) => s.last);
  if (!order) return <Navigate to="/" />;

  const data = new Date(order.criadoEm).toLocaleString("pt-BR");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-foreground">
              <Check className="h-8 w-8" strokeWidth={3} />
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">
              Pedido realizado!
            </h1>
            <p className="mt-2 max-w-md text-muted-foreground">
              Recebemos seu pedido. O administrador entrará em contato em breve
              para confirmar a entrega.
            </p>
          </div>

          <div className="mt-8 rounded-2xl bg-primary-soft p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Número do pedido
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="font-display text-2xl font-bold text-primary">
                {order.numero}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.numero);
                  toast.success("Número copiado!");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-primary transition hover:bg-primary/10"
                aria-label="Copiar"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{data}</p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Entrega
              </h2>
              <p className="mt-2 font-medium">{order.cliente.nome}</p>
              <p className="text-sm text-muted-foreground">{order.cliente.telefone}</p>
              <p className="mt-2 text-sm">{order.cliente.endereco}</p>
              {order.cliente.complemento && (
                <p className="text-sm text-muted-foreground">
                  {order.cliente.complemento}
                </p>
              )}
              {order.cliente.observacoes && (
                <p className="mt-2 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
                  {order.cliente.observacoes}
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Itens
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm">
                {order.itens.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span>
                      {i.quantidade}× {i.nome}
                    </span>
                    <span className="font-medium">
                      {formatBRL(i.preco * i.quantidade)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t pt-3">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-display text-xl font-bold">
                  {formatBRL(order.total)}
                </span>
              </div>
            </section>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              to="/"
              className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-cta)] transition hover:scale-[1.02]"
            >
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
