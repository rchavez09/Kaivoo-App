/**
 * License Banner — Sprint 25 P7
 *
 * Gentle, persistent banner for unlicensed users.
 * Dismissible per-session but returns on restart.
 * Full functionality — no restrictions.
 */

import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLicenseStore } from '@/hooks/useLicense';

export default function LicenseBanner() {
  const isLicensed = useLicenseStore((s) => s.license.isLicensed);
  const bannerDismissed = useLicenseStore((s) => s.bannerDismissed);
  const dismiss = useLicenseStore((s) => s.dismissBanner);
  const navigate = useNavigate();

  if (isLicensed || bannerDismissed) return null;

  return (
    <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 px-4 py-1.5">
      <p className="text-xs text-muted-foreground">
        Enjoying Flow?{' '}
        <button
          onClick={() => navigate('/settings')}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          Enter your license key
        </button>{' '}
        in Settings to remove this message.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss license banner"
        className="ml-4 rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
