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
 */
async function onHeartbeatTick(): Promise<void> {
  const settings = getHeartbeatSettings();

  // Check if we should run based on time-of-day settings
  if (!shouldRunNow(settings)) {
    console.log('[Heartbeat] Skipping tick (outside scheduled time)');
    return;
  }

  try {
    console.log('[Heartbeat] Running AI inference...');
    const insight = await runHeartbeatInference();

    if (insight) {
      console.log('[Heartbeat] Insight generated:', insight);

      // Trigger notification if enabled
      if (settings.notificationsEnabled) {
        await showHeartbeatNotification(insight);
      }
    } else {
      console.log('[Heartbeat] No actionable insights found (NO_ACTION)');
    }
  } catch (e) {
    console.error('[Heartbeat] Tick failed:', e);

    // Agent 7 P1-3: Show user-facing error notification for critical failures
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    if (errorMessage.includes('API key') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
      // Critical: API key issue — notify immediately
      await showErrorNotification('Heartbeat failed: Check your AI settings');
    }
  }
}

/**
 * Run AI inference to generate a proactive insight.
 * Returns the insight text if actionable, or null if NO_ACTION.
 */
async function runHeartbeatInference(): Promise<string | null> {
  try {
    // Import dependencies
    const { buildHeartbeatPrompt } = await import('./heartbeat-prompt');
    const { getSoulConfig, getAISettings } = await import('../ai/settings');
    const { assembleAppContext } = await import('../ai/prompt-assembler');
    const { callAI } = await import('../ai/chat-service');

    // Get AI settings
    const aiSettings = getAISettings();
    if (!aiSettings.apiKey) {
      console.warn('[Heartbeat] No API key configured, skipping inference');
      return null;
    }

    // Assemble context
    const soul = getSoulConfig();
    const appContext = await assembleAppContext();
    const prompt = buildHeartbeatPrompt({ soul, appContext });

    // Call AI with heartbeat-optimized settings
    const response = await callAI({
      messages: [{ role: 'user', content: prompt }],
      provider: aiSettings.provider,
      model: aiSettings.model,
      apiKey: aiSettings.apiKey,
      temperature: 0.3, // Deterministic, not creative
      maxTokens: 150, // Keep it concise
      ollamaBaseUrl: aiSettings.ollamaBaseUrl,
    });

    const insight = response.content.trim();

    // Check if actionable
    if (insight === 'NO_ACTION' || insight.length === 0) {
      return null;
    }

    // Store insight in database
    await storeInsight(insight, appContext);

    return insight;
  } catch (e) {
    console.error('[Heartbeat] Inference failed:', e);
    return null;
  }
}

/**
 * Store the generated insight in the database
 */
async function storeInsight(insight: string, appContext: unknown): Promise<void> {
  try {
    const settings = getHeartbeatSettings();

    // Check if we have Supabase client
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    if (isTauri) {
      // Desktop: use SQLite via Tauri SQL plugin
      // For now, just log (full SQLite integration is Phase B)
      console.log('[Heartbeat] Would store to SQLite:', insight);
    } else {
      // Web: use Supabase
      const { supabase } = await import('@/integrations/supabase/client');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.warn('[Heartbeat] No user authenticated, skipping insight storage');
        return;
      }

      await supabase.from('heartbeat_insights').insert({
        user_id: user.id,
        insight,
        is_actionable: true,
        context_snapshot: appContext,
        frequency_setting: settings.frequency,
      });

      console.log('[Heartbeat] Insight stored to database');
    }
  } catch (e) {
    console.error('[Heartbeat] Failed to store insight:', e);
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

/**
 * Show a system notification with the heartbeat insight.
 * Desktop: Tauri notification API
 * Web: Browser Notification API (with permission request)
 */
async function showHeartbeatNotification(insight: string): Promise<void> {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    // Desktop: Use Tauri notification
    try {
      const { sendNotification } = await import('@tauri-apps/plugin-notification');
      await sendNotification({
        title: 'Proactive Insight',
        body: insight,
      });
      console.log('[Heartbeat] Desktop notification sent');
    } catch (e) {
      console.error('[Heartbeat] Failed to send desktop notification:', e);
    }
  } else {
    // Web: Use browser Notification API
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('[Heartbeat] Browser does not support notifications');
        return;
      }

      // Request permission if needed
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('[Heartbeat] Notification permission denied');
          return;
        }
      }

      // Show notification if permission granted
      if (Notification.permission === 'granted') {
        const notification = new Notification('Proactive Insight', {
          body: insight,
          icon: '/icon-192.png', // App icon (assuming it exists in public/)
          tag: 'heartbeat', // Replace previous heartbeat notifications
        });

        // Navigate to chat when clicked
        notification.onclick = () => {
          window.focus();
          window.location.href = '/chat';
        };

        console.log('[Heartbeat] Web notification sent');
      }
    } catch (e) {
      console.error('[Heartbeat] Failed to send web notification:', e);
    }
  }
}

/**
 * Show an error notification for heartbeat failures (Agent 7 P1-3)
 */
async function showErrorNotification(message: string): Promise<void> {
  const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

  if (isTauri) {
    // Desktop: Use Tauri notification
    try {
      const { sendNotification } = await import('@tauri-apps/plugin-notification');
      await sendNotification({
        title: 'Proactive Insights Error',
        body: message,
      });
    } catch (e) {
      console.error('[Heartbeat] Failed to send error notification:', e);
    }
  } else {
    // Web: Use browser Notification API (if permission granted)
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Proactive Insights Error', {
          body: message,
          icon: '/icon-192.png',
          tag: 'heartbeat-error',
        });
      }
    } catch (e) {
      console.error('[Heartbeat] Failed to send web error notification:', e);
    }
  }
}
