import { create } from "zustand";
import type { CartItem } from "./cart";

export interface OrderData {
  numero: string;
  criadoEm: string;
  cliente: {
    nome: string;
    telefone: string;
    endereco: string;
    complemento?: string;
    observacoes?: string;
  };
  itens: CartItem[];
  total: number;
}

interface OrderState {
  last: OrderData | null;
  set: (o: OrderData) => void;
}

export const useOrder = create<OrderState>((set) => ({
  last: null,
  set: (o) => set({ last: o }),
}));

export function generateOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `PED-${ymd}-${seq}`;
}
