import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { formatBRL, useCart } from "@/store/cart";
import { useOrder } from "@/store/order";
import { toast } from "sonner";
import { createPedido } from "@/api/pedidos";
import { useAuth } from "@/store/auth";
import supabase from "@/api/supabaseClient";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

// Aplica máscara de telefone: (XX) 9XXXX-XXXX
function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const schema = z.object({
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Informe um telefone válido: (XX) 9XXXX-XXXX"),
  endereco: z.string().trim().min(5, "Informe o endereço").max(200),
  complemento: z.string().trim().max(100).optional().or(z.literal("")),
  observacoes: z.string().trim().max(300).optional().or(z.literal("")),
});

function Checkout() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());
  const clear = useCart((s) => s.clear);
  const setOrder = useOrder((s) => s.set);

  const { user, isLoading: isAuthLoading } = useAuth();
  const [profile, setProfile] = useState<{
    nome: string;
    telefone: string;
    endereco: string;
  } | null>(null);

  const [form, setForm] = useState({
    telefone: "",
    endereco: "",
    complemento: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("Você precisa estar logado para finalizar o pedido");
      navigate({ to: "/login" });
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const { data } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
          setForm((f) => ({
            ...f,
            endereco: data.endereco || "",
            telefone: data.telefone ? maskPhone(data.telefone) : "",
          }));
        }
      }
    }
    loadProfile();
  }, [user]);

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
    if (!user) return;

    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const i of result.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      toast.error("Verifique os campos do formulário");
      return;
    }
    setErrors({});

    // Salva telefone e endereço no banco
    const telefoneDigits = result.data.telefone.replace(/\D/g, "");
    await supabase
      .from("clientes")
      .update({
        telefone: telefoneDigits,
        endereco: result.data.endereco,
      })
      .eq("id", user.id);

    const pedidoData = {
      cliente_id: user.id,
      observacoes: result.data.observacoes,
      subtotal: subtotal,
      total: subtotal,
    };

    const itens = items.map((item) => ({
      produto_id: item.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco,
      subtotal: item.preco * item.quantidade,
    }));

    const { data, error } = await createPedido(pedidoData, itens);

    if (error) {
      toast.error("Erro ao criar pedido no Supabase");
      return;
    }

    setOrder({
      numero: data.numero_pedido || data.id,
      criadoEm: data.criado_em,
      cliente: {
        nome: profile?.nome || user.email?.split("@")[0] || "Cliente",
        telefone: result.data.telefone,
        endereco: result.data.endereco,
        complemento: result.data.complemento || undefined,
        observacoes: result.data.observacoes || undefined,
      },
      itens: items,
      total: subtotal,
    });

    clear();
    toast.success(`Pedido criado: ${data.numero_pedido || "Sucesso"}`);
    navigate({ to: "/sucesso" });
  };

  const field = (
    name: keyof typeof form,
    label: string,
    required = true,
    placeholder = ""
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        value={form[name]}
        onChange={(e) => {
          const raw = e.target.value;
          const val = name === "telefone" ? maskPhone(raw) : raw;
          setForm((f) => ({ ...f, [name]: val }));
        }}
        placeholder={placeholder}
        className={`h-11 w-full rounded-xl border bg-card px-4 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 ${
          errors[name] ? "border-destructive" : ""
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-destructive">{errors[name]}</p>
      )}
    </div>
  );

  if (isAuthLoading) return null;

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
            <h2 className="font-display text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" /> Seus Dados
            </h2>

            {/* Info do usuário logado */}
            <div className="p-4 rounded-xl bg-muted/50 border">
              <p className="font-medium">
                {profile?.nome || user?.user_metadata?.full_name || user?.email?.split("@")[0]}
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                Comprando como <strong>{user?.email}</strong>
              </p>
            </div>

            {/* Campo Telefone */}
            {field("telefone", "Telefone", true, "(11) 91234-5678")}

            <h2 className="font-display text-lg font-semibold pt-2 border-t">
              Endereço de Entrega
            </h2>
            {field("endereco", "Endereço Completo", true, "Rua Exemplo, 123 - Bairro")}
            {field("complemento", "Complemento", false, "Apto 10, bloco B")}

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

            <div className="flex flex-col gap-3 pt-4 sm:flex-row border-t">
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

          {/* Painel de resumo */}
          <aside className="h-fit rounded-3xl border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold">Resumo</h2>

            {/* Dados do cliente no resumo */}
            {(form.telefone || user?.email) && (
              <div className="mt-3 mb-4 rounded-xl bg-muted/50 border p-3 space-y-0.5 text-xs text-muted-foreground">
                <p className="font-medium text-foreground text-sm">
                  {profile?.nome || user?.user_metadata?.full_name || user?.email?.split("@")[0]}
                </p>
                {form.telefone && <p>📞 {form.telefone}</p>}
                {form.endereco && <p>📍 {form.endereco}</p>}
              </div>
            )}

            <ul className="mt-2 space-y-3">
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
