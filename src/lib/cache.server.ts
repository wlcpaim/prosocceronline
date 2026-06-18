/**
 * Cache utility com suporte a TTL (Time To Live)
 * Ideal para cachear tokens, respostas de API, etc.
 *
 * Uso:
 *   const token = await cache.get('syncpay-token', () => fetchToken(), 3600)
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Obtém um valor do cache ou o calcula via função
   * @param key - Chave única do cache
   * @param fn - Função que retorna o valor (chamada se não estiver em cache ou expirado)
   * @param ttlSeconds - Tempo de vida em segundos (padrão: 3600s = 1 hora)
   */
  async get<T>(
    key: string,
    fn: () => Promise<T> | T,
    ttlSeconds: number = 3600
  ): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key) as CacheEntry<T> | undefined;

    // Se existe e não expirou, retorna
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    // Calcula novo valor
    const value = await fn();

    // Armazena com TTL
    this.store.set(key, {
      value,
      expiresAt: now + ttlSeconds * 1000,
    });

    return value;
  }

  /**
   * Define um valor no cache diretamente
   */
  set<T>(key: string, value: T, ttlSeconds: number = 3600): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Remove um valor do cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Limpa entradas expiradas (útil para liberar memória)
   */
  prune(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.store.entries()) {
      if (entry.expiresAt <= now) {
        this.store.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Retorna estatísticas do cache
   */
  stats() {
    return {
      size: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, entry.expiresAt - Date.now()),
      })),
    };
  }
}

// Instância global única (usa-se em server-side)
export const apiCache = new TTLCache();
