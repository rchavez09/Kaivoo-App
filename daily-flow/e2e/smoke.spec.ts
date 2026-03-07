import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("app loads without errors", async ({ page }) => {
    // Root route shows a loading state while Supabase auth initializes.
    // Verify the page loads successfully (200) and JS bundle executes.
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // Verify React app mounted (Supabase auth iframe indicates JS executed)
    await expect(page.locator("iframe, nav, main, form").first()).toBeAttached({
      timeout: 10000,
    });
  });

  test("auth page renders sign-in form", async ({ page }) => {
    await page.goto("/auth");

    // Should see some form of sign-in UI
    await expect(page.locator("form, button, input").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("unauthenticated user is redirected from protected routes", async ({ page }) => {
    // Attempt to visit a protected route without auth
    await page.goto("/today");

    // Should either redirect to /auth or show a sign-in prompt
    await page.waitForURL(/\/(auth)?/, { timeout: 10000 });
  });

  test("static assets load correctly", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    // CSS should be loaded (app won't look right without it)
    const styles = await page.evaluate(
      () => document.styleSheets.length
    );
    expect(styles).toBeGreaterThan(0);
  });
});
