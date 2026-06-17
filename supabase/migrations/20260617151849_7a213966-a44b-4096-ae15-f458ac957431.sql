-- Permitir múltiplos jogadores por usuário
ALTER TABLE public.players DROP CONSTRAINT IF EXISTS players_user_id_key;

-- Nomes de jogador não podem se repetir (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS players_name_lower_key
  ON public.players (lower(name));

-- Função para checar disponibilidade de nome sem expor dados de outros usuários
CREATE OR REPLACE FUNCTION public.is_player_name_available(_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.players
    WHERE lower(name) = lower(trim(_name))
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_player_name_available(text) TO anon, authenticated;