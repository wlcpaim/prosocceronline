-- Game currency wallet per user
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins integer NOT NULL DEFAULT 1000,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shop purchases (game currency)
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  item_name text NOT NULL,
  price integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.purchases TO authenticated;
GRANT ALL ON public.purchases TO service_role;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Gol a Gol x1 PvP matches
CREATE TABLE public.gol_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'waiting',
  p1_user_id uuid NOT NULL,
  p1_player_id uuid NOT NULL,
  p1_name text NOT NULL,
  p1_overall integer NOT NULL,
  p1_score integer NOT NULL DEFAULT 0,
  p2_user_id uuid,
  p2_player_id uuid,
  p2_name text,
  p2_overall integer,
  p2_score integer NOT NULL DEFAULT 0,
  rounds jsonb,
  winner_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gol_matches TO authenticated;
GRANT ALL ON public.gol_matches TO service_role;
ALTER TABLE public.gol_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gol_matches_select_participant" ON public.gol_matches FOR SELECT TO authenticated USING (p1_user_id = auth.uid() OR p2_user_id = auth.uid());
CREATE INDEX gol_matches_waiting_idx ON public.gol_matches (status, created_at) WHERE status = 'waiting';
CREATE TRIGGER gol_matches_updated_at BEFORE UPDATE ON public.gol_matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();