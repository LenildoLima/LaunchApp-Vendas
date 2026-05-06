import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";
import { formatBRL, useCart } from "@/store/cart";
import { toast } from "sonner";

interface Props {
  product: Product;
  onOpen: (p: Product) => void;
}

export function ProductCard({ product, onOpen }: Props) {
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const outOfStock = product.estoque === 0;

  return (
    <article
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
      onClick={() => onOpen(product)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.imagem}
          alt={product.nome}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
          {product.categoria}
        </span>
        {outOfStock && (
          <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-medium text-destructive-foreground">
            Esgotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {product.nome}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {product.descricao}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="font-display text-2xl font-bold text-foreground">
            {formatBRL(product.preco)}
          </span>
          <button
            disabled={outOfStock}
            onClick={(e) => {
              e.stopPropagation();
              add(product, 1);
              toast.success(`${product.nome} adicionado`, {
                action: { label: "Ver carrinho", onClick: openCart },
              });
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-cta)] transition hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
