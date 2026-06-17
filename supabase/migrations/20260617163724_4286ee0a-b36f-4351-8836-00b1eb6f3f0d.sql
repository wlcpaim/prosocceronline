CREATE OR REPLACE FUNCTION public.get_player_stats()
RETURNS TABLE(registered bigint, online bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    count(*)::bigint AS registered,
    GREATEST(
      count(*) FILTER (WHERE updated_at > now() - interval '15 minutes'),
      1
    )::bigint AS online
  FROM public.players;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_stats() TO anon, authenticated, service_role;