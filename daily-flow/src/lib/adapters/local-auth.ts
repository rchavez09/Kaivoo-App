/**
 * Local Auth Adapter — SQLite-persisted offline auth for desktop (Sprint 21 P6)
 *
 * Generates and persists a local user identity in SQLite. Desktop users
 * don't authenticate against Supabase — they get a permanent local identity.
 */

import type { AuthAdapter, AuthUser, AuthSession } from './types';
import type { TauriDatabase } from './local-types';
import { uuid } from './local-types';

export class LocalAuthAdapter implements AuthAdapter {
  private user: AuthUser;

  private constructor(user: AuthUser) {
    this.user = user;
  }

  /** Create the auth adapter, loading or generating the local user identity from SQLite. */
  static async create(db: TauriDatabase): Promise<LocalAuthAdapter> {
    try {
      // Try to load existing user from local_session table
      const rows = await db.select<{ value: string }[]>("SELECT value FROM local_session WHERE key = 'user'");
      if (rows.length > 0) {
        const user = JSON.parse(rows[0].value) as AuthUser;
        return new LocalAuthAdapter(user);
      }

      // First launch: generate a persistent local identity
      const user: AuthUser = { id: uuid(), email: 'local@kaivoo.desktop' };
      await db.execute("INSERT INTO local_session (key, value) VALUES ('user', $1)", [JSON.stringify(user)]);
      return new LocalAuthAdapter(user);
    } catch (e) {
      throw new Error(`[LocalAuth.create] ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async getUser(): Promise<AuthUser> {
    return this.user;
  }
  async getSession(): Promise<AuthSession> {
    return { user: this.user, accessToken: 'local' };
  }
  async signInWithPassword(): Promise<AuthSession> {
    return { user: this.user, accessToken: 'local' };
  }
  async signUp(): Promise<AuthSession> {
    return { user: this.user, accessToken: 'local' };
  }
  async signInWithOAuth(): Promise<void> {}
  async signOut(): Promise<void> {}
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): () => void {
    const session = { user: this.user, accessToken: 'local' };
    setTimeout(() => callback('INITIAL_SESSION', session), 0);
    return () => {};
  }
}
