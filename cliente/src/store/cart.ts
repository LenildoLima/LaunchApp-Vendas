import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export interface CartItem {
  id: string;
  nome: string;
  preco: number;
  imagem: string;
  estoque: number;
  quantidade: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
      add: (product, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === product.id);
          if (existing) {
            const next = Math.min(existing.quantidade + qty, product.estoque);
            return {
              items: s.items.map((i) =>
                i.id === product.id ? { ...i, quantidade: next } : i
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                id: product.id,
                nome: product.nome,
                preco: product.preco,
                imagem: product.imagem,
                estoque: product.estoque,
                quantidade: Math.min(qty, product.estoque),
              },
            ],
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              i.id === id
                ? { ...i, quantidade: Math.max(1, Math.min(qty, i.estoque)) }
                : i
            )
            .filter((i) => i.quantidade > 0),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, i) => a + i.quantidade, 0),
      subtotal: () => get().items.reduce((a, i) => a + i.quantidade * i.preco, 0),
    }),
    { name: "novalia-cart" }
  )
);

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
