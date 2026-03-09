/**
 * E2E Auth Setup — Sprint 20 P10
 *
 * Authenticates a test user via Supabase REST API and saves
 * the browser storageState for reuse across all authenticated tests.
 *
 * Requires E2E_EMAIL and E2E_PASSWORD env vars (or uses defaults).
 */

import { test as setup } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qfumextzhucozitrvekv.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const PROJECT_REF = 'qfumextzhucozitrvekv';

export const STORAGE_STATE = path.join(__dirname, '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_EMAIL and E2E_PASSWORD env vars are required for authenticated E2E tests.\n' +
        'Set them in .env.e2e or pass them to the test command.',
    );
  }

  // Sign in via Supabase REST API (faster than UI login)
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase auth failed (${response.status}): ${body}`);
  }

  const session = await response.json();

  // Navigate to the app first so we can set localStorage on the correct origin
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8080';
  await page.goto(baseURL);

  // Inject the Supabase session into localStorage
  // The Supabase JS client stores it under this key pattern
  const storageKey = `sb-${PROJECT_REF}-auth-token`;
  const storageValue = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + session.expires_in,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });

  await page.evaluate(
    ([key, value]) => {
      localStorage.setItem(key, value);
    },
    [storageKey, storageValue],
  );

  // Save the browser state for reuse
  await page.context().storageState({ path: STORAGE_STATE });
});
