/**
 * License Verification — Sprint 25 P6
 *
 * Pure offline Ed25519 verification of Kaivoo license keys.
 * Works in both web (TypeScript) and desktop (Tauri) contexts.
 *
 * The public key is embedded here — it can only verify, not generate keys.
 */

import type { LicenseInfo, LicensePayload, LicenseTier } from './types';
import { EMPTY_LICENSE } from './types';

// Ed25519 public key (hex) — generated alongside the private key stored in Supabase secrets.
// This key can ONLY verify signatures, not create them.
const PUBLIC_KEY_HEX = '1593ff8d9d4cd806219506d7de0753e8aeb3ae4b477d931495184ee99db0054b';

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function fromBase64Url(str: string): Uint8Array {
  // Restore standard base64
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Parse the license key block format:
 * ----- BEGIN KAIVOO LICENSE -----
 * Kaivoo {Tier} - Single User License
 * {base64url encoded data...}
 * ----- END KAIVOO LICENSE -----
 */
function parseLicenseBlock(raw: string): string | null {
  const lines = raw
    .trim()
    .split('\n')
    .map((l) => l.trim());
  const beginIdx = lines.findIndex((l) => l.includes('BEGIN KAIVOO LICENSE'));
  const endIdx = lines.findIndex((l) => l.includes('END KAIVOO LICENSE'));

  if (beginIdx === -1 || endIdx === -1 || endIdx <= beginIdx + 2) return null;

  // Skip BEGIN line and human-readable header line, take everything until END
  const dataLines = lines.slice(beginIdx + 2, endIdx);
  return dataLines.join('');
}

/**
 * Verify and decode a Kaivoo license key.
 * Returns LicenseInfo on success, EMPTY_LICENSE on failure.
 */
export async function verifyLicenseKey(raw: string): Promise<LicenseInfo> {
  try {
    const encoded = parseLicenseBlock(raw);
    if (!encoded) return EMPTY_LICENSE;

    const combined = fromBase64Url(encoded);
    if (combined.length < 2 + 1 + 64) return EMPTY_LICENSE; // minimum: 2 length + 1 payload + 64 sig

    // Extract payload length (2 bytes, big-endian)
    const payloadLen = (combined[0] << 8) | combined[1];
    if (2 + payloadLen + 64 > combined.length) return EMPTY_LICENSE;

    const payloadBytes = combined.slice(2, 2 + payloadLen);
    const signature = combined.slice(2 + payloadLen, 2 + payloadLen + 64);

    // Lazy-load Ed25519 (keeps crypto lib off initial bundle)
    const { ed25519 } = await import('@noble/curves/ed25519.js');

    // Verify Ed25519 signature
    const pubKey = hexToBytes(PUBLIC_KEY_HEX);
    const valid = ed25519.verify(signature, payloadBytes, pubKey);
    if (!valid) return EMPTY_LICENSE;

    // Decode payload
    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload: LicensePayload = JSON.parse(payloadStr);

    // Validate payload structure
    if (payload.v !== 1 || typeof payload.t !== 'number' || typeof payload.i !== 'number') {
      return EMPTY_LICENSE;
    }

    const tier: LicenseTier = payload.t === 0 ? 'founding' : 'standard';
    const issuedAt = new Date(payload.i * 86400 * 1000); // days since epoch → ms

    return {
      isLicensed: true,
      tier,
      issuedAt,
      emailHash: payload.e || null,
      raw,
    };
  } catch {
    return EMPTY_LICENSE;
  }
}

/**
 * Quick check: is this string shaped like a Kaivoo license key?
 * (Does not verify signature — just checks format.)
 */
export function looksLikeLicenseKey(text: string): boolean {
  return text.includes('BEGIN KAIVOO LICENSE') && text.includes('END KAIVOO LICENSE');
}
