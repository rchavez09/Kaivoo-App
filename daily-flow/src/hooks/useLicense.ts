/**
 * useLicense — Sprint 25 P6
 *
 * Lightweight license state hook. Loads verified license from storage
 * on mount, exposes activation and dismissal actions.
 *
 * Separate from useKaivooStore to avoid coupling license logic
 * with the main data store.
 */

import { create } from 'zustand';
import type { LicenseInfo } from '@/lib/license/types';
import { EMPTY_LICENSE } from '@/lib/license/types';
import { verifyLicenseKey } from '@/lib/license/verify';
import { saveLicense, loadLicense, clearLicense, isBannerDismissed, dismissBanner } from '@/lib/license/storage';

interface LicenseStore {
  license: LicenseInfo;
  bannerDismissed: boolean;
  activate: (rawKey: string) => Promise<{ success: boolean; error?: string }>;
  deactivate: () => void;
  dismissBanner: () => void;
  init: () => void;
}

export const useLicenseStore = create<LicenseStore>((set) => ({
  license: EMPTY_LICENSE,
  bannerDismissed: false,

  activate: async (rawKey: string) => {
    const info = await verifyLicenseKey(rawKey);
    if (!info.isLicensed) {
      return { success: false, error: 'Invalid license key. Please check and try again.' };
    }
    saveLicense(info);
    set({ license: info });
    return { success: true };
  },

  deactivate: () => {
    clearLicense();
    set({ license: EMPTY_LICENSE, bannerDismissed: false });
  },

  dismissBanner: () => {
    dismissBanner();
    set({ bannerDismissed: true });
  },

  init: () => {
    void loadLicense().then((license) => {
      const dismissed = isBannerDismissed();
      set({ license, bannerDismissed: dismissed });
    });
  },
}));

/**
 * Convenience hook — returns just the license info.
 */
export function useLicense() {
  return useLicenseStore((s) => s.license);
}

/**
 * Convenience hook — returns true if user has a valid license.
 */
export function useIsLicensed() {
  return useLicenseStore((s) => s.license.isLicensed);
}
