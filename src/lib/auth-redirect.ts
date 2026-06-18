import { supabase } from "@/integrations/supabase/client";

/**
 * Verifica se o usuário está logado
 */
export async function isUserLoggedIn(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Erro ao verificar sessão:", error);
      return false;
    }
    return !!data.session?.user;
  } catch (e) {
    console.error("Erro ao verificar autenticação:", e);
    return false;
  }
}

/**
 * Hook para obter o estado de autenticação em tempo real
 */
export function setupAuthListener(onAuthStateChange: (isLoggedIn: boolean) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
    const isLoggedIn = event === "SIGNED_IN";
    onAuthStateChange(isLoggedIn);
  });

  return () => subscription.subscription.unsubscribe();
}
