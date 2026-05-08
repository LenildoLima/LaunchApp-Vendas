import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { formatBRL, useCart } from "@/store/cart";
import { generateOrderNumber, useOrder } from "@/store/order";
import { toast } from "sonner";
import { createPedido } from "@/api/pedidos";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  telefone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\)\s?9\d{4}-\d{4}$/, "Formato: (XX) 9XXXX-XXXX"),
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  complemento: z.string().trim().max(100).optional().or(z.literal("")),
  observacoes: z.string().trim().max(300).optional().or(z.literal("")),
});

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const setOrder = useOrder((s) => s.set);

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    endereco: "",
    complemento: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-bold">Seu carrinho está vazio</h1>
          <p className="mt-2 text-muted-foreground">
            Adicione produtos antes de finalizar a compra.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const i of result.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      toast.error("Verifique os campos do formulário");
      return;
    }
    setErrors({});
    
    const pedidoData = {
      cliente_nome: result.data.nome,
      cliente_telefone: result.data.telefone,
      cliente_endereco: result.data.endereco,
      cliente_complemento: result.data.complemento,
      observacoes: result.data.observacoes,
      subtotal: subtotal,
      total: subtotal,
    };

    const itens = items.map(item => ({
      produto_id: item.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
      subtotal: item.preco * item.quantidade
    }));

    const { data, error } = await createPedido(pedidoData, itens);

    if (error) {
      toast.error("Erro ao criar pedido no Supabase");
      return;
    }

    setOrder({
      numero: data.numero_pedido,
      criadoEm: data.criado_em,
      cliente: {
        nome: result.data.nome,
        telefone: result.data.telefone,
        endereco: result.data.endereco,
        complemento: result.data.complemento || undefined,
        observacoes: result.data.observacoes || undefined,
      },
      itens: items,
      total: subtotal,
    });
    
    clear();
    toast.success(`Pedido criado: ${data.numero_pedido}`);
    navigate({ to: "/sucesso" });
  };

  const field = (name: keyof typeof form, label: string, required = true) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        value={form[name]}
        onChange={(e) =>
          setForm((f) => ({
            ...f,
            [name]: name === "telefone" ? maskPhone(e.target.value) : e.target.value,
          }))
        }
        className={`h-11 w-full rounded-xl border bg-card px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          errors[name] ? "border-destructive" : ""
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-destructive">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
          Finalizar compra
        </h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          <form onSubmit={submit} className="space-y-5 rounded-3xl border bg-card p-6 sm:p-8">
            <h2 className="font-display text-lg font-semibold">Dados de entrega</h2>
            {field("nome", "Nome completo")}
            {field("telefone", "Telefone")}
            {field("endereco", "Endereço")}
            {field("complemento", "Complemento", false)}
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Observações
              </label>
              <textarea
                value={form.observacoes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, observacoes: e.target.value }))
                }
                rows={3}
                placeholder="Ex: entregar após 18h"
                className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                to="/"
                className="rounded-full border px-6 py-3 text-center text-sm font-medium transition hover:bg-muted"
              >
                Voltar ao carrinho
              </Link>
              <button
                type="submit"
                className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-cta)] transition hover:scale-[1.02]"
              >
                Confirmar pedido
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold">Resumo</h2>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3">
                  <img
                    src={i.imagem}
                    alt={i.nome}
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium leading-tight">
                      {i.nome}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {i.quantidade} × {formatBRL(i.preco)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatBRL(i.preco * i.quantidade)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-baseline justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold">
                {formatBRL(subtotal)}
              </span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
