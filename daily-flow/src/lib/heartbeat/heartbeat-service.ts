/**
 * Heartbeat Service — Sprint 37
 *
 * Background timer that runs proactive AI insights.
 * On desktop: uses Tauri event system + Rust timer
 * On web: uses setInterval in main thread (Web Worker is Phase B optimization)
 */

import { getHeartbeatSettings, type HeartbeatSettings } from '../ai/settings';

let heartbeatInterval: number | null = null;
let tauriUnlisten: (() => void) | null = null;

/**
 * Start the heartbeat timer.
 * On desktop: registers Tauri event listener + starts Rust timer
 * On web: starts setInterval
 */
export async function startHeartbeat(): Promise<void> {
  const settings = getHeartbeatSettings();

  if (!settings.enabled || settings.frequency === 'off') {
    console.log('[Heartbeat] Disabled in settings, not starting');
    return;
  }

  // Stop any existing heartbeat first
  await stopHeartbeat();

  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    await startTauriHeartbeat(settings);
  } else {
    startWebHeartbeat(settings);
  }

  console.log(`[Heartbeat] Started with frequency: ${settings.frequency}`);
}

/**
 * Stop the heartbeat timer.
 */
export async function stopHeartbeat(): Promise<void> {
  // Stop web interval
  if (heartbeatInterval !== null) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  // Stop Tauri timer
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
  if (isTauri) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('stop_heartbeat');

      if (tauriUnlisten) {
        tauriUnlisten();
        tauriUnlisten = null;
      }
    } catch (e) {
      console.error('[Heartbeat] Failed to stop Tauri timer:', e);
    }
  }

  console.log('[Heartbeat] Stopped');
}

/**
 * Restart the heartbeat with new settings.
 * Call this when user changes settings.
 */
export async function restartHeartbeat(): Promise<void> {
  await stopHeartbeat();
  await startHeartbeat();
}

/**
 * Start heartbeat using Tauri backend timer (desktop)
 */
async function startTauriHeartbeat(settings: HeartbeatSettings): Promise<void> {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const { listen } = await import('@tauri-apps/api/event');

    // Register event listener for heartbeat ticks
    tauriUnlisten = await listen('heartbeat-tick', async () => {
      console.log('[Heartbeat] Tick received from Tauri');
      await onHeartbeatTick();
    });

    // Start the Rust timer
    const intervalSeconds = getIntervalSeconds(settings);
    await invoke('start_heartbeat', { intervalSeconds });

    console.log(`[Heartbeat] Tauri timer started (interval: ${intervalSeconds}s)`);
  } catch (e) {
    console.error('[Heartbeat] Failed to start Tauri timer:', e);
    // Fallback to web timer
    startWebHeartbeat(settings);
  }
}

/**
 * Start heartbeat using setInterval (web fallback)
 */
function startWebHeartbeat(settings: HeartbeatSettings): void {
  const intervalSeconds = getIntervalSeconds(settings);
  const intervalMs = intervalSeconds * 1000;

  heartbeatInterval = window.setInterval(() => {
    console.log('[Heartbeat] Tick from web timer');
    void onHeartbeatTick();
  }, intervalMs);

  console.log(`[Heartbeat] Web timer started (interval: ${intervalSeconds}s)`);
}

/**
 * Convert frequency setting to interval in seconds
 */
function getIntervalSeconds(settings: HeartbeatSettings): number {
  switch (settings.frequency) {
    case 'morning':
      // Run once at 8am — set 24 hour interval (will check time on each tick)
      return 24 * 60 * 60;
    case 'evening':
      // Run once at 6pm — set 24 hour interval
      return 24 * 60 * 60;
    case 'hourly':
      return settings.intervalSeconds;
    case 'custom':
      // For cron, use intervalSeconds as fallback polling interval
      return settings.intervalSeconds;
    case 'off':
    default:
      return 3600; // 1 hour default (won't be used if disabled)
  }
}

/**
 * Handle heartbeat tick — this is where the magic happens
 * P3 will implement the actual AI inference logic
 */
async function onHeartbeatTick(): Promise<void> {
  const settings = getHeartbeatSettings();

  // Check if we should run based on time-of-day settings
  if (!shouldRunNow(settings)) {
    console.log('[Heartbeat] Skipping tick (outside scheduled time)');
    return;
  }

  try {
    // P3: This will call the heartbeat AI inference
    console.log('[Heartbeat] Would run AI inference here (P3 implementation)');

    // Placeholder: In P3, we'll:
    // 1. Read user context (tasks, calendar, journal, soul file)
    // 2. Run AI inference with heartbeat prompt
    // 3. Store insight in heartbeat_insights table
    // 4. If actionable, trigger notification (P4)
  } catch (e) {
    console.error('[Heartbeat] Tick failed:', e);
  }
}

/**
 * Check if heartbeat should run now based on time-of-day settings
 */
function shouldRunNow(settings: HeartbeatSettings): boolean {
  const now = new Date();
  const hour = now.getHours();

  switch (settings.frequency) {
    case 'morning':
      // Run only between 8am-9am
      return hour === 8;
    case 'evening':
      // Run only between 6pm-7pm
      return hour === 18;
    case 'hourly':
    case 'custom':
      // Always run when timer fires
      return true;
    case 'off':
    default:
      return false;
  }
}
