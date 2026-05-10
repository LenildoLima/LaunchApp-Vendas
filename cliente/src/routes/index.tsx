import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { ProductDialog } from "@/components/ProductDialog";
import { CATEGORIES, PRICE_RANGE, type Category, type Product } from "@/data/products";
import { formatBRL } from "@/store/cart";
import { getProdutos } from "@/api/produtos";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "Todas">("Todas");
  const [maxPrice, setMaxPrice] = useState(PRICE_RANGE[1]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      const { data } = await getProdutos();
      if (data) {
        const mapped = data.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          descricao: p.descricao,
          descricaoLonga: p.descricao,
          preco: p.preco_promocional || p.preco,
          categoria: (p.categorias?.nome as Category) || "Geral",
          imagem: p.imagem_url,
          estoque: p.quantidade_estoque,
        }));
        setProdutos(mapped);
      }
      setLoading(false);
    };
    buscar();
  }, []);

  const filtered = useMemo(() => {
    return produtos.filter((p) => {
      if (query && !p.nome.toLowerCase().includes(query.toLowerCase())) return false;
      if (category !== "Todas" && p.categoria !== category) return false;
      if (p.preco > maxPrice) return false;
      if (onlyInStock && p.estoque === 0) return false;
      return true;
    });
  }, [produtos, query, category, maxPrice, onlyInStock]);

  const clearFilters = () => {
    setQuery("");
    setCategory("Todas");
    setMaxPrice(PRICE_RANGE[1]);
    setOnlyInStock(false);
  };

  const hasFilters =
    query !== "" || category !== "Todas" || maxPrice !== PRICE_RANGE[1] || onlyInStock;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-primary via-primary to-[oklch(0.28_0.13_270)] text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-soft ring-1 ring-accent/30">
              Loja online · entrega rápida
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Tudo que você ama,
              <br />
              <span className="text-accent">em poucos cliques.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
              Curadoria de produtos premium com checkout simples e sem precisar
              entrar no WhatsApp. Adicione ao carrinho e finalize em menos de 1 minuto.
            </p>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos…"
              className="h-12 w-full rounded-full border bg-card pl-11 pr-11 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full hover:bg-muted"
                aria-label="Limpar busca"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className="flex h-12 items-center justify-center gap-2 rounded-full border bg-card px-5 text-sm font-medium transition hover:border-accent sm:w-auto"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
            {hasFilters && (
              <span className="ml-1 h-2 w-2 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {filtersOpen && (
          <div className="border-t bg-card/50">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Todas", ...CATEGORIES] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        category === c
                          ? "bg-primary text-primary-foreground"
                          : "border bg-card hover:border-primary"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preço máximo: {formatBRL(maxPrice)}
                </label>
                <input
                  type="range"
                  min={PRICE_RANGE[0]}
                  max={PRICE_RANGE[1]}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent"
                />
              </div>

              <div className="flex items-end justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="h-4 w-4 rounded accent-accent"
                  />
                  Somente em estoque
                </label>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold">Catálogo</h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card py-20 text-center">
            <p className="font-display text-lg font-semibold">
              Nenhum produto encontrado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tente ajustar a busca ou os filtros.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={setSelected} />
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Novalia · Todos os direitos reservados
        </div>
      </footer>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
