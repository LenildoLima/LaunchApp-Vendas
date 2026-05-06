import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { Product } from "@/data/products";
import { formatBRL, useCart } from "@/store/cart";
import { toast } from "sonner";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductDialog({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);

  useEffect(() => {
    setQty(1);
    if (product) {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", onKey);
        document.body.style.overflow = "";
      };
    }
  }, [product, onClose]);

  if (!product) return null;
  const out = product.estoque === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl bg-card shadow-2xl md:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition hover:bg-background"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="aspect-square w-full bg-muted md:aspect-auto">
          <img
            src={product.imagem}
            alt={product.nome}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto p-6 md:p-8">
          <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {product.categoria}
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight">
            {product.nome}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.descricaoLonga}
          </p>

          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold">
              {formatBRL(product.preco)}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            {out ? (
              <span className="font-medium text-destructive">Fora de estoque</span>
            ) : (
              <span>
                <span className="font-medium text-success">Em estoque</span> ·{" "}
                {product.estoque} disponíveis
              </span>
            )}
          </div>

          {!out && (
            <div className="mt-2 flex items-center gap-3">
              <span className="text-sm font-medium">Quantidade</span>
              <div className="flex items-center rounded-full border">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-l-full transition hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">
                  {qty}
                </span>
                <button
                  onClick={() =>
                    setQty((q) => Math.min(product.estoque, q + 1))
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-r-full transition hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <div className="mt-auto flex flex-col gap-2 pt-4 sm:flex-row">
            <button
              onClick={onClose}
              className="rounded-full border px-6 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Continuar comprando
            </button>
            <button
              disabled={out}
              onClick={() => {
                add(product, qty);
                toast.success(`${product.nome} adicionado`, {
                  action: { label: "Ver carrinho", onClick: openCart },
                });
                onClose();
              }}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-cta)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
