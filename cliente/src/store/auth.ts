import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import supabase from "../api/supabaseClient";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user || null, isLoading: false });
      if (session?.user) {
        syncUser(session.user);
      }
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user || null, isLoading: false });
      if (session?.user) {
        syncUser(session.user);
      }
    });
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
}));

async function syncUser(user: User) {
  try {
    const nome = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0];
    
    // Verifica se já existe para não dar conflito
    const { data: existing, error } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
      
    if (!existing) {
       await supabase.from("clientes").insert([
         {
           id: user.id,
           google_id: user.user_metadata?.provider_id || user.id,
           email: user.email,
           nome: nome,
         }
       ]);
    }
  } catch (err) {
    console.error("Erro sincronizando cliente", err);
  }
}
