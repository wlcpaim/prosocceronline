-- Anti-trapaça: jogadores só podem ser criados/atualizados pelo servidor (cálculo na nuvem).
-- Remove a escrita direta pelo cliente. Leitura e exclusão do próprio jogador continuam permitidas.

DROP POLICY IF EXISTS "Users can insert their own player" ON public.players;
DROP POLICY IF EXISTS "Users can update their own player" ON public.players;

-- Revoga INSERT/UPDATE direto via Data API para usuários comuns.
REVOKE INSERT, UPDATE ON public.players FROM authenticated;
REVOKE INSERT, UPDATE ON public.players FROM anon;

-- O servidor (service_role) mantém acesso total para gravar valores calculados.
GRANT ALL ON public.players TO service_role;