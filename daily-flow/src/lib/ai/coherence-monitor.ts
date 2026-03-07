/**
 * Concierge Coherence Monitor — Sprint 30 P10 (Layer 7 basic)
 *
 * Lightweight drift detection for the concierge. After each response,
 * checks whether the concierge is still referencing its soul personality
 * and citing user data accurately.
 *
 * Phase A: Observation only — logs signals to localStorage for manual review.
 * Phase B: Will move to a proper table with automated alerting.
 */

import type { SoulConfig, ConversationMessage } from './types';

export interface CoherenceSignal {
  id: string;
  timestamp: string;
  conversationId: string;
  signal: 'personality_drift' | 'generic_response' | 'data_hallucination' | 'name_mismatch';
  severity: 'low' | 'medium' | 'high';
  details: string;
  responseSnippet: string;
}

const COHERENCE_LOG_KEY = 'flow-coherence-log';
const MAX_LOG_ENTRIES = 200;

/** Retrieve all coherence log entries. */
export function getCoherenceLog(): CoherenceSignal[] {
  try {
    const stored = localStorage.getItem(COHERENCE_LOG_KEY);
    return stored ? (JSON.parse(stored) as CoherenceSignal[]) : [];
  } catch {
    return [];
  }
}

function saveSignal(signal: CoherenceSignal): void {
  const log = getCoherenceLog();
  log.unshift(signal);
  localStorage.setItem(COHERENCE_LOG_KEY, JSON.stringify(log.slice(0, MAX_LOG_ENTRIES)));
}

/**
 * Check a concierge response for drift signals.
 * Called after each assistant message is finalized.
 *
 * Returns any detected signals (empty array = coherent).
 */
export function checkCoherence(
  response: string,
  soul: SoulConfig | null,
  conversationId: string,
  recentUserMessages: ConversationMessage[],
): CoherenceSignal[] {
  const signals: CoherenceSignal[] = [];
  const snippet = response.slice(0, 200);
  const responseLower = response.toLowerCase();

  // 1. Name mismatch — concierge refers to itself by a different name
  if (soul?.name) {
    const soulNameLower = soul.name.toLowerCase();
    const wrongNames = ['chatgpt', 'claude', 'gemini', 'assistant', 'copilot', 'siri', 'alexa'];
    for (const wrong of wrongNames) {
      if (responseLower.includes(`i'm ${wrong}`) || responseLower.includes(`i am ${wrong}`)) {
        signals.push({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          conversationId,
          signal: 'name_mismatch',
          severity: 'high',
          details: `Concierge identified as "${wrong}" instead of "${soulNameLower}"`,
          responseSnippet: snippet,
        });
      }
    }
  }

  // 2. Generic response — no personalization despite having user context
  if (soul?.userName && recentUserMessages.length >= 3) {
    const hasAnyPersonalization =
      responseLower.includes(soul.userName.toLowerCase()) ||
      responseLower.includes('your task') ||
      responseLower.includes('your meeting') ||
      responseLower.includes('your project') ||
      responseLower.includes('you mentioned') ||
      responseLower.includes('your goal');

    // Only flag if response is long enough to warrant personalization
    if (!hasAnyPersonalization && response.length > 200) {
      signals.push({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        conversationId,
        signal: 'generic_response',
        severity: 'low',
        details: 'Long response with no personalization signals detected',
        responseSnippet: snippet,
      });
    }
  }

  // 3. Personality drift — tone mismatch
  if (soul?.tone === 'playful') {
    const formalIndicators = ['furthermore', 'in conclusion', 'it is imperative', 'one must consider'];
    const formalCount = formalIndicators.filter((f) => responseLower.includes(f)).length;
    if (formalCount >= 2) {
      signals.push({
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        conversationId,
        signal: 'personality_drift',
        severity: 'medium',
        details: `Tone set to "playful" but response uses formal language (${formalCount} indicators)`,
        responseSnippet: snippet,
      });
    }
  }

  // Save detected signals
  for (const s of signals) {
    saveSignal(s);
  }

  return signals;
}
