-- ============================================================
-- GAME SERVERS (jogadores escolhem um servidor antes da carreira)
-- ============================================================
CREATE TABLE public.servers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  season text NOT NULL,
  region text,
  status text NOT NULL DEFAULT 'open',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.servers TO anon;
GRANT SELECT ON public.servers TO authenticated;
GRANT ALL ON public.servers TO service_role;

ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;

-- Lista de servidores é pública (apenas leitura)
CREATE POLICY "Servers are publicly viewable"
  ON public.servers FOR SELECT
  USING (true);

CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON public.servers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Servidor inicial
INSERT INTO public.servers (code, name, season, region, status, sort_order)
VALUES ('CATANDUVA-SP-S01', 'Catanduva-SP', 'S01', 'Brasil', 'open', 1);

-- Vincula jogadores a um servidor
ALTER TABLE public.players
  ADD COLUMN server_id uuid REFERENCES public.servers(id) ON DELETE SET NULL;

-- Jogadores existentes entram no servidor inicial
UPDATE public.players
  SET server_id = (SELECT id FROM public.servers WHERE code = 'CATANDUVA-SP-S01')
  WHERE server_id IS NULL;

-- ============================================================
-- TREINOS (escola) — estado de treino por jogador, server-authoritative
-- ============================================================
CREATE TABLE public.player_training (
  player_id uuid NOT NULL PRIMARY KEY REFERENCES public.players(id) ON DELETE CASCADE,
  basico_key text,
  basico_until timestamp with time zone,
  avancado_key text,
  avancado_until timestamp with time zone,
  profissional_key text,
  profissional_until timestamp with time zone,
  global_lock_until timestamp with time zone,
  skill_key text,
  skill_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.player_training TO authenticated;
GRANT ALL ON public.player_training TO service_role;

ALTER TABLE public.player_training ENABLE ROW LEVEL SECURITY;

-- Usuário só enxerga o treino do próprio jogador (escritas via service role nos server functions)
CREATE POLICY "Users can view their own player training"
  ON public.player_training FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.players p
    WHERE p.id = player_training.player_id
      AND p.user_id = auth.uid()
  ));

CREATE TRIGGER update_player_training_updated_at
  BEFORE UPDATE ON public.player_training
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();