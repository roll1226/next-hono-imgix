// メモリキャッシュ用ユーティリティ
class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttlSeconds: number = 300) {
    // デフォルト5分
    this.ttl = ttlSeconds * 1000;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // TTLチェック
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // 古いキャッシュを定期的に削除
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// インスタンス作成
export const postsCache = new MemoryCache<unknown>(180); // 3分間キャッシュ
export const ogpCache = new MemoryCache<unknown>(600); // 10分間キャッシュ

// 定期的なクリーンアップ（5分毎）
if (typeof window === "undefined") {
  // サーバーサイドでのみ実行
  setInterval(() => {
    postsCache.cleanup();
    ogpCache.cleanup();
  }, 5 * 60 * 1000);
}
