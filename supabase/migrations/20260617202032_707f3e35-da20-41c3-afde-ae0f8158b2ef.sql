-- ============================================================
-- Anti-cheat hardening: server-authoritative writes + locked-down functions
-- ============================================================

-- ===== players: only the server (service role) may insert/update game data =====
CREATE POLICY "Service role can insert players"
  ON public.players FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update players"
  ON public.players FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ===== subscriptions: only the server (service role) may insert/update/delete =====
CREATE POLICY "Service role can insert subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (auth.role() = 'service_role');

-- ===== user_roles: only the server (service role) may change roles (no self-promotion) =====
CREATE POLICY "Service role can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update roles"
  ON public.user_roles FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete roles"
  ON public.user_roles FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- Lock down SECURITY DEFINER functions so they are NOT callable
-- by anonymous or signed-in users through the public API.
-- ============================================================

-- Trigger-only functions (never called directly by clients)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Internal email-queue functions (only invoked by the server via service role)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;

-- Game data helpers: now called only from the server (service role)
REVOKE EXECUTE ON FUNCTION public.get_player_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_player_name_available(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_access(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_player_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_player_name_available(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_access(uuid) TO service_role;

-- has_role must remain executable by signed-in users because it is used
-- inside row-level security policies, but never by anonymous visitors.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;