// src/lib/tokenRefresher.ts
import { refreshToken as apiRefresh } from "./authApi";

type DecodedJWT = { exp?: number };

const TOKEN_KEY = "authToken";
const CLOCK_SKEW_MS = 45_000; // refresh sớm 45s

class TokenRefresher {
  private timerId: number | null = null;
  private refreshing: Promise<void> | null = null;

  initFromCurrentToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    const nextAt = this.nextAtFromToken(token);
    this.schedule(nextAt);
  }

  scheduleFromToken(token: string) {
    const nextAt = this.nextAtFromToken(token);
    this.schedule(nextAt);
  }

  scheduleFromExpiresIn(expires_in: number) {
    // backend của bạn trả "expires_in" dạng epoch giây → chuyển ms
    const expMs =
      expires_in > 10_000_000 ? expires_in * 1000 : Date.now() + expires_in * 1000;
    this.schedule(expMs - CLOCK_SKEW_MS);
  }

  stop() {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private schedule(nextAtMs: number | null) {
    this.stop();
    if (!nextAtMs) return;
    const delay = Math.max(2_000, nextAtMs - Date.now()); // min 2s
    this.timerId = window.setTimeout(() => {
      this.safeRefresh();
    }, delay);
  }

  private async safeRefresh() {
    if (!this.refreshing) {
      this.refreshing = (async () => {
        try {
          const res = await apiRefresh();
          const newToken = (res as any)?.data?.token;
          const expiresIn = (res as any)?.data?.expires_in;

          if (newToken) localStorage.setItem(TOKEN_KEY, newToken);

          if (expiresIn) this.scheduleFromExpiresIn(expiresIn);
          else if (newToken) this.scheduleFromToken(newToken);
          else this.schedule(Date.now() + 10 * 60_000); // fallback 10'
        } catch {
          this.stop();
          // tuỳ ý: window.location.href = "/login";
        } finally {
          this.refreshing = null;
        }
      })();
    }
    await this.refreshing;
  }

  private nextAtFromToken(token: string): number | null {
    try {
      const [, payloadB64] = token.split(".");
      if (!payloadB64) return null;
      const json = JSON.parse(atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))) as DecodedJWT;
      if (!json.exp) return null;
      return json.exp * 1000 - CLOCK_SKEW_MS;
    } catch {
      return null;
    }
  }
}

export const tokenRefresher = new TokenRefresher();

// Đồng bộ đa tab: tab khác refresh → tab hiện tại reschedule
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === TOKEN_KEY && e.newValue) {
      tokenRefresher.scheduleFromToken(e.newValue);
    }
  });
}
