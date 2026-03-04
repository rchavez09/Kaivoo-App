/**
 * License Storage — Sprint 25 P6
 *
 * Persists verified license info to localStorage (web) or SQLite (desktop).
 * The license key is stored after verification — never stored unverified.
 */

import type { LicenseInfo } from './types';
import { EMPTY_LICENSE } from './types';
import { verifyLicenseKey } from './verify';

const STORAGE_KEY = 'kaivoo_license';

/**
 * Save a verified license to persistent storage.
 */
export function saveLicense(info: LicenseInfo): void {
  if (!info.isLicensed || !info.raw) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        raw: info.raw,
        tier: info.tier,
        emailHash: info.emailHash,
        issuedAt: info.issuedAt?.toISOString(),
        activatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // localStorage might be unavailable
  }
}

/**
 * Load and re-verify the stored license.
 * Re-verification ensures the key hasn't been tampered with in storage.
 */
export async function loadLicense(): Promise<LicenseInfo> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return EMPTY_LICENSE;

    const { raw } = JSON.parse(stored);
    if (!raw) return EMPTY_LICENSE;

    // Re-verify the stored key
    return await verifyLicenseKey(raw);
  } catch {
    return EMPTY_LICENSE;
  }
}

/**
 * Remove stored license (for debugging / reset).
 */
export function clearLicense(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Check if banner was dismissed this session.
 */
export function isBannerDismissed(): boolean {
  try {
    return sessionStorage.getItem('kaivoo_license_banner_dismissed') === '1';
  } catch {
    return false;
  }
}

/**
 * Dismiss the license banner for this session.
 */
export function dismissBanner(): void {
  try {
    sessionStorage.setItem('kaivoo_license_banner_dismissed', '1');
  } catch {
    // ignore
  }
}
