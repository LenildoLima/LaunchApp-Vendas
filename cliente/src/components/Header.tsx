import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, LogOut, ClipboardList, UserCircle } from "lucide-react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";

export function Header() {
  const count = useCart((s) => s.count());
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    null;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <span className="font-display text-lg font-bold">N</span>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Novalia
          </span>
        </Link>

        {/* Ações lado direito */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              {/* Olá, Nome */}
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Olá,{" "}
                <span className="font-semibold text-foreground">{firstName}</span>
              </span>

              {/* Meu Perfil */}
              <Link
                to="/perfil"
                className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-accent hover:text-accent"
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Meu Perfil</span>
              </Link>

              {/* Meus Pedidos */}
              <Link
                to="/meus-pedidos"
                className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-accent hover:text-accent"
              >
                <ClipboardList className="h-4 w-4" />
                <span className="hidden sm:inline">Meus Pedidos</span>
              </Link>

              {/* Sair */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium text-destructive shadow-sm transition hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-accent hover:text-accent"
            >
              <span className="text-sm">Entrar</span>
            </Link>
          )}

          {/* Carrinho */}
          <button
            onClick={open}
            className="relative flex items-center gap-2 rounded-full border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-accent hover:text-accent"
            aria-label="Abrir carrinho"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Carrinho</span>
            {mounted && count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
