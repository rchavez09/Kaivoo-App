/**
 * Tauri Plugin Validation Tests
 *
 * Sprint 20 P1: Validates tauri-plugin-sql (SQLite) and tauri-plugin-fs
 * from the JavaScript side. Run these from the browser console when
 * the app is running inside the Tauri shell.
 *
 * Usage: import { runTauriTests } from '@/lib/tauri-test'; runTauriTests();
 */

// Check if we're running inside Tauri
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Test tauri-plugin-sql: Create table, insert, select, delete
 */
export async function testSQLite(): Promise<{
  success: boolean;
  details: string;
}> {
  if (!isTauri()) {
    return { success: false, details: "Not running in Tauri — skipping SQLite test" };
  }

  try {
    const { default: Database } = await import("@tauri-apps/plugin-sql");

    // Connect to SQLite (creates file if not exists)
    const db = await Database.load("sqlite:kaivoo-test.db");

    // Create test table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS test_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Insert
    const insertResult = await db.execute(
      "INSERT INTO test_items (title) VALUES ($1)",
      ["Hello from Tauri SQLite"]
    );

    // Select
    const rows = await db.select<
      Array<{ id: number; title: string; created_at: string }>
    >("SELECT * FROM test_items ORDER BY id DESC LIMIT 5");

    // Cleanup
    await db.execute("DROP TABLE IF EXISTS test_items");
    await db.close();

    return {
      success: true,
      details: `SQLite OK: inserted row (lastInsertId=${insertResult.lastInsertId}), read ${rows.length} row(s): "${rows[0]?.title}"`,
    };
  } catch (err) {
    return {
      success: false,
      details: `SQLite FAILED: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Test tauri-plugin-fs: Write file, read file, check exists, remove
 */
export async function testFileSystem(): Promise<{
  success: boolean;
  details: string;
}> {
  if (!isTauri()) {
    return { success: false, details: "Not running in Tauri — skipping FS test" };
  }

  try {
    const { writeTextFile, readTextFile, exists, remove, BaseDirectory } =
      await import("@tauri-apps/plugin-fs");

    const testContent = `# Tauri FS Test\nWritten at: ${new Date().toISOString()}`;
    const testPath = "kaivoo-fs-test.md";
    const opts = { baseDir: BaseDirectory.AppData };

    // Write
    await writeTextFile(testPath, testContent, opts);

    // Check exists
    const fileExists = await exists(testPath, opts);

    // Read
    const readBack = await readTextFile(testPath, opts);

    // Cleanup
    await remove(testPath, opts);

    const match = readBack === testContent;

    return {
      success: fileExists && match,
      details: `FS OK: wrote ${testContent.length} chars, exists=${fileExists}, read-back match=${match}`,
    };
  } catch (err) {
    return {
      success: false,
      details: `FS FAILED: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Run all Tauri validation tests
 */
export async function runTauriTests(): Promise<void> {
  console.log("=== Tauri Plugin Validation Tests ===");
  console.log(`Running in Tauri: ${isTauri()}`);

  const sqliteResult = await testSQLite();
  console.log(
    `[${sqliteResult.success ? "PASS" : "FAIL"}] SQLite: ${sqliteResult.details}`
  );

  const fsResult = await testFileSystem();
  console.log(
    `[${fsResult.success ? "PASS" : "FAIL"}] FileSystem: ${fsResult.details}`
  );

  const allPassed = sqliteResult.success && fsResult.success;
  console.log(`\n=== ${allPassed ? "ALL TESTS PASSED" : "SOME TESTS FAILED"} ===`);
}
