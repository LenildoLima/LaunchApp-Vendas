import headphones from "@/assets/products/headphones.jpg";
import smartwatch from "@/assets/products/smartwatch.jpg";
import mug from "@/assets/products/mug.jpg";
import tshirt from "@/assets/products/tshirt.jpg";
import sneakers from "@/assets/products/sneakers.jpg";
import speaker from "@/assets/products/speaker.jpg";
import book from "@/assets/products/book.jpg";
import backpack from "@/assets/products/backpack.jpg";

export type Category = "Eletrônicos" | "Moda" | "Casa" | "Livros";

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  descricaoLonga: string;
  preco: number;
  categoria: Category;
  imagem: string;
  estoque: number;
}

export const CATEGORIES: Category[] = ["Eletrônicos", "Moda", "Casa", "Livros"];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    nome: "Fone Bluetooth Pro",
    descricao: "Cancelamento de ruído ativo e até 30h de bateria.",
    descricaoLonga:
      "Fone over-ear premium com drivers de 40mm, ANC adaptativo, conexão multiponto e estojo de viagem incluso.",
    preco: 899.9,
    categoria: "Eletrônicos",
    imagem: headphones,
    estoque: 12,
  },
  {
    id: "p2",
    nome: "Smartwatch Onyx",
    descricao: "Tela AMOLED, GPS e monitor cardíaco 24h.",
    descricaoLonga:
      "Acompanhe treinos, sono e notificações com até 7 dias de bateria. Resistente a água até 50m.",
    preco: 1299.0,
    categoria: "Eletrônicos",
    imagem: smartwatch,
    estoque: 7,
  },
  {
    id: "p3",
    nome: "Caneca Cerâmica Minimal",
    descricao: "350ml, branco fosco, ideal para café e chá.",
    descricaoLonga:
      "Caneca em cerâmica de alta qualidade, acabamento fosco e alça ergonômica. Apta para microondas.",
    preco: 49.9,
    categoria: "Casa",
    imagem: mug,
    estoque: 48,
  },
  {
    id: "p4",
    nome: "Camiseta Essential Branca",
    descricao: "100% algodão pima, modelagem regular.",
    descricaoLonga:
      "Camiseta básica premium em algodão pima de toque suave. Costuras reforçadas e gola redonda.",
    preco: 119.0,
    categoria: "Moda",
    imagem: tshirt,
    estoque: 30,
  },
  {
    id: "p5",
    nome: "Tênis Court White",
    descricao: "Couro legítimo, solado emborrachado.",
    descricaoLonga:
      "Tênis casual de couro com palmilha em EVA e solado antiderrapante. Conforto para o dia todo.",
    preco: 459.0,
    categoria: "Moda",
    imagem: sneakers,
    estoque: 0,
  },
  {
    id: "p6",
    nome: "Caixa de Som Pulse",
    descricao: "Bluetooth 5.3, 20W RMS, à prova d'água.",
    descricaoLonga:
      "Som potente e estéreo verdadeiro com pareamento entre duas unidades. Bateria para 16h de uso.",
    preco: 329.9,
    categoria: "Eletrônicos",
    imagem: speaker,
    estoque: 15,
  },
  {
    id: "p7",
    nome: "Diário Capa Dura Cream",
    descricao: "240 páginas pautadas, papel 90g.",
    descricaoLonga:
      "Caderno de capa dura com papel marfim de alta gramatura, marcador de fita e elástico de fechamento.",
    preco: 79.0,
    categoria: "Livros",
    imagem: book,
    estoque: 60,
  },
  {
    id: "p8",
    nome: "Mochila Urban 22L",
    descricao: "Compartimento para notebook 15\".",
    descricaoLonga:
      "Mochila resistente à água com bolsos organizadores, alças acolchoadas e visual minimalista.",
    preco: 389.0,
    categoria: "Moda",
    imagem: backpack,
    estoque: 9,
  },
];

export const PRICE_RANGE: [number, number] = [
  0,
  Math.ceil(Math.max(...PRODUCTS.map((p) => p.preco)) / 100) * 100,
];
