/**
 * Authenticated E2E Tests — Sprint 20 P10
 *
 * Tests key user journeys with a logged-in session.
 * Depends on auth.setup.ts for storageState.
 *
 * Updated Sprint 31: Tasks merged into Projects page (All Tasks tab)
 * Updated Sprint 32: Vault merged into Knowledge page (Vault tab at /topics?tab=vault)
 */

import { test, expect, Page } from '@playwright/test';

// Helper: wait for the app to finish loading (DataLoader + React Query)
async function waitForAppReady(page: Page) {
  // The app shows a spinner while loading auth/data.
  // Wait for the sidebar nav to appear (indicates app is loaded).
  await page.waitForSelector('nav', { timeout: 15000 });
}

// ─── Navigation ─────────────────────────────────────────────

test.describe('Navigation', () => {
  test('authenticated user sees the main app layout', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Should see the sidebar with nav links
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // Should NOT be on the auth page
    await expect(page).not.toHaveURL(/\/auth/);
  });

  test('sidebar navigation links work', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // Navigate to Projects (Sprint 31: Tasks merged into Projects)
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL(/\/projects/);

    // Navigate to Knowledge (Sprint 32: Topics + Vault merged)
    await page.click('a[href="/topics"]');
    await expect(page).toHaveURL(/\/topics/);
    await expect(page.locator('h1:has-text("Topics")')).toBeVisible({ timeout: 10000 });

    // Navigate to Notes
    await page.click('a[href="/notes"]');
    await expect(page).toHaveURL(/\/notes/);
    await expect(page.locator('h1:has-text("Notes")')).toBeVisible({ timeout: 10000 });

    // Navigate back to Today
    await page.click('a[href="/"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('protected routes stay accessible when authenticated', async ({ page }) => {
    // Directly visit a protected route — should NOT redirect to /auth
    await page.goto('/projects');
    await waitForAppReady(page);
    await expect(page).toHaveURL(/\/projects/);
  });
});

// ─── Today Dashboard ────────────────────────────────────────

test.describe('Today Dashboard', () => {
  test('today page loads with widgets', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);

    // The Today page should render widget containers
    // Look for main content area with widgets
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Should have at least one widget card or section
    const widgets = page.locator(".widget-card, [class*='card'], section");
    const count = await widgets.count();
    expect(count).toBeGreaterThan(0);
  });
});

// ─── Tasks (Sprint 31: merged into Projects page, "All Tasks" tab) ──

test.describe('Tasks', () => {
  test('tasks page loads via /projects with header and controls', async ({ page }) => {
    // /tasks redirects to /projects (Sprint 31)
    await page.goto('/projects');
    await waitForAppReady(page);

    // "All Tasks" is the default tab — TasksContent renders h1 "Tasks"
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible({ timeout: 10000 });

    // Should see the New Task button
    await expect(page.locator('button:has-text("New Task")')).toBeVisible();
  });

  test('/tasks redirects to /projects', async ({ page }) => {
    await page.goto('/tasks');
    await waitForAppReady(page);

    // Should redirect to /projects
    await expect(page).toHaveURL(/\/projects/);
  });

  test('can open new task input and cancel', async ({ page }) => {
    await page.goto('/projects');
    await waitForAppReady(page);
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible({ timeout: 10000 });

    // Click "New Task" to show input
    await page.click('button:has-text("New Task")');

    // Input should appear
    const input = page.locator('input[placeholder="What needs to be done?"]');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Type a task title
    await input.fill('E2E test task - should be cancelled');

    // Cancel instead of submitting
    await page.click('button:has-text("Cancel")');

    // Input should disappear
    await expect(input).not.toBeVisible();
  });

  test('task view mode buttons are visible', async ({ page }) => {
    await page.goto('/projects');
    await waitForAppReady(page);
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible({ timeout: 10000 });

    // View mode buttons should be present
    const viewButtons = page.locator(
      'button[title="List view"], button[title="Kanban view"], button[title="Timeline view"]',
    );
    const count = await viewButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('task search input works', async ({ page }) => {
    await page.goto('/projects');
    await waitForAppReady(page);
    await expect(page.locator('h1:has-text("Tasks")')).toBeVisible({ timeout: 10000 });

    // Find and use the search input
    const search = page.locator('input[placeholder="Search tasks..."]');
    await expect(search).toBeVisible();
    await search.fill('nonexistent-task-xyz-12345');

    // Should show no results or empty state
    // (Wait a moment for filtering to apply)
    await page.waitForTimeout(500);
  });
});

// ─── Knowledge (Sprint 32: Topics + Vault unified) ─────────

test.describe('Knowledge', () => {
  test('knowledge page loads with Topics tab by default', async ({ page }) => {
    await page.goto('/topics');
    await waitForAppReady(page);

    // Topics tab is default — TopicsContent renders h1 "Topics"
    await expect(page.locator('h1:has-text("Topics")')).toBeVisible({ timeout: 10000 });

    // Tab bar should show both tabs
    await expect(page.locator('button[role="tab"]:has-text("Topics")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Vault")')).toBeVisible();
  });

  test('new topic dialog opens and closes', async ({ page }) => {
    await page.goto('/topics');
    await waitForAppReady(page);
    await expect(page.locator('h1:has-text("Topics")')).toBeVisible({ timeout: 10000 });

    // Click New Topic button
    await page.click('button:has-text("New Topic")');

    // Dialog should appear with topic name input
    const input = page.locator('input[placeholder*="Topic name"]');
    await expect(input).toBeVisible({ timeout: 5000 });

    // Close the dialog by pressing Escape
    await page.keyboard.press('Escape');
    await expect(input).not.toBeVisible();
  });

  test('switching to Vault tab shows vault content', async ({ page }) => {
    await page.goto('/topics');
    await waitForAppReady(page);

    // Click Vault tab
    await page.click('button[role="tab"]:has-text("Vault")');

    // Should show Vault header
    await expect(page.locator('h1:has-text("Vault")')).toBeVisible({ timeout: 10000 });

    // URL should update to include tab=vault
    await expect(page).toHaveURL(/tab=vault/);
  });
});

// ─── Notes / Journal ────────────────────────────────────────

test.describe('Notes', () => {
  test('notes page loads with editor', async ({ page }) => {
    await page.goto('/notes');
    await waitForAppReady(page);

    await expect(page.locator('h1:has-text("Notes")')).toBeVisible({ timeout: 10000 });

    // The ProseMirror editor should be present
    const editor = page.locator('.ProseMirror');
    await expect(editor).toBeVisible({ timeout: 10000 });
  });
});

// ─── Settings ───────────────────────────────────────────────

test.describe('Settings', () => {
  test('settings page loads', async ({ page }) => {
    await page.goto('/settings');
    await waitForAppReady(page);

    // Settings page should have settings-related content
    // Look for common settings UI patterns
    const settingsContent = page.locator(
      'h1:has-text("Settings"), h2:has-text("Settings"), h1:has-text("Preferences")',
    );
    await expect(settingsContent.first()).toBeVisible({ timeout: 10000 });
  });
});

// ─── Calendar ───────────────────────────────────────────────

test.describe('Calendar', () => {
  test('calendar page loads', async ({ page }) => {
    await page.goto('/calendar');
    await waitForAppReady(page);

    // Calendar should show some date-related UI
    const calendarContent = page.locator('main');
    await expect(calendarContent).toBeVisible({ timeout: 10000 });
  });
});

// ─── Vault (Sprint 32: now a tab under Knowledge) ─────────

test.describe('Vault', () => {
  test('/vault redirects to /topics?tab=vault and shows vault content', async ({ page }) => {
    await page.goto('/vault');
    await waitForAppReady(page);

    // Should redirect to /topics with tab=vault
    await expect(page).toHaveURL(/\/topics.*tab=vault/);

    await expect(page.locator('h1:has-text("Vault")')).toBeVisible({ timeout: 10000 });

    // Should show the search input
    await expect(page.getByLabel('Search vault')).toBeVisible();

    // Should show the file tree container (widget-card)
    await expect(page.locator('.widget-card')).toBeVisible();
  });

  test('vault search input accepts text via tab', async ({ page }) => {
    await page.goto('/topics?tab=vault');
    await waitForAppReady(page);
    await expect(page.locator('h1:has-text("Vault")')).toBeVisible({ timeout: 10000 });

    const search = page.getByLabel('Search vault');
    await search.fill('journal');
    await expect(search).toHaveValue('journal');
  });
});
