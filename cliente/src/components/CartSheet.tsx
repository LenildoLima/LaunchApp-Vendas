import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatBRL, useCart } from "@/store/cart";

export function CartSheet() {
  const { isOpen, close, items, setQty, remove, subtotal } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;
  const total = subtotal();

  return (
    <div className="fixed inset-0 z-50 flex animate-in fade-in" onClick={close}>
      <div className="flex-1 bg-foreground/40 backdrop-blur-sm" />
      <aside
        className="flex h-full w-full max-w-md flex-col bg-card shadow-2xl animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b p-5">
          <h2 className="font-display text-xl font-bold">Seu carrinho</h2>
          <button
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">
                Seu carrinho está vazio
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Adicione produtos do catálogo para começar.
              </p>
            </div>
            <button
              onClick={close}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Explorar produtos
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl border bg-background p-3"
                >
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-tight">
                        {item.nome}
                      </h3>
                      <button
                        onClick={() => remove(item.id)}
                        className="text-muted-foreground transition hover:text-destructive"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatBRL(item.preco)}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center rounded-full border">
                        <button
                          onClick={() => setQty(item.id, item.quantidade - 1)}
                          className="flex h-7 w-7 items-center justify-center transition hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-semibold">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => setQty(item.id, item.quantidade + 1)}
                          className="flex h-7 w-7 items-center justify-center transition hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        {formatBRL(item.preco * item.quantidade)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <footer className="border-t p-5">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-display text-2xl font-bold">
                  {formatBRL(total)}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/checkout"
                  onClick={close}
                  className="block rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-accent-foreground shadow-[var(--shadow-cta)] transition hover:scale-[1.02]"
                >
                  Finalizar compra
                </Link>
                <button
                  onClick={close}
                  className="rounded-full border px-6 py-3 text-sm font-medium transition hover:bg-muted"
                >
                  Continuar comprando
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
