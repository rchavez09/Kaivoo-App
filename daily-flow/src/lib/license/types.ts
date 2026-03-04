/**
 * License Types — Sprint 25 P6
 *
 * Type definitions for the license key system.
 */

export type LicenseTier = 'founding' | 'standard';

export interface LicensePayload {
  v: number; // format version
  t: number; // tier: 0=founding, 1=standard
  i: number; // issued_at (days since epoch)
  e: string; // first 8 hex chars of SHA-256(email)
  f: number; // flags bitfield
}

export interface LicenseInfo {
  isLicensed: boolean;
  tier: LicenseTier | null;
  issuedAt: Date | null;
  emailHash: string | null;
  raw: string | null; // The full license key text
}

export const EMPTY_LICENSE: LicenseInfo = {
  isLicensed: false,
  tier: null,
  issuedAt: null,
  emailHash: null,
  raw: null,
};
