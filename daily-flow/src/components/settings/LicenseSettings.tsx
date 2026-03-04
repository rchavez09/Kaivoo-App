/**
 * License Settings — Sprint 25 P7
 *
 * License key activation panel in Settings.
 * Paste key into textarea or import .kaivoo-license file.
 * Shows tier badge + status after activation.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, XCircle, Key, Shield, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLicenseStore } from '@/hooks/useLicense';
import { looksLikeLicenseKey } from '@/lib/license/verify';

export default function LicenseSettings() {
  const license = useLicenseStore((s) => s.license);
  const activate = useLicenseStore((s) => s.activate);
  const deactivate = useLicenseStore((s) => s.deactivate);
  const [keyInput, setKeyInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const handleActivate = async () => {
    setError(null);
    setActivating(true);
    try {
      const result = await activate(keyInput.trim());
      if (result.success) {
        toast.success('License activated!');
        setKeyInput('');
      } else {
        setError(result.error || 'Invalid license key');
      }
    } finally {
      setActivating(false);
    }
  };

  const handleFileImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.kaivoo-license,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      if (looksLikeLicenseKey(text)) {
        setKeyInput(text.trim());
        setError(null);
      } else {
        setError('This file does not contain a valid Kaivoo license key.');
      }
    };
    input.click();
  };

  const handleDeactivate = () => {
    deactivate();
    toast.success('License removed');
    setKeyInput('');
    setError(null);
  };

  if (license.isLicensed) {
    const tierLabel = license.tier === 'founding' ? 'Founding Member' : 'Standard';
    const tierColor = license.tier === 'founding' ? 'text-amber-600' : 'text-primary';

    return (
      <div className="space-y-6">
        {/* Licensed status */}
        <div className="rounded-xl border border-success/30 bg-success/5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <Shield className="h-5 w-5 text-success-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Licensed</p>
              <p className={`text-xs font-medium ${tierColor}`}>{tierLabel}</p>
            </div>
          </div>
          {license.issuedAt && (
            <p className="mt-3 text-xs text-muted-foreground">Issued: {license.issuedAt.toLocaleDateString()}</p>
          )}
        </div>

        {/* Deactivate */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Remove License</p>
          <p className="mb-3 text-xs text-muted-foreground">
            This will remove your license from this device. You can re-activate it anytime with your key.
          </p>
          <Button variant="outline" size="sm" onClick={handleDeactivate}>
            Remove License
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key input */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <label htmlFor="license-key-input" className="text-sm font-medium text-foreground">
            License Key
          </label>
        </div>
        <Textarea
          id="license-key-input"
          value={keyInput}
          onChange={(e) => {
            setKeyInput(e.target.value);
            setError(null);
          }}
          placeholder={`Paste your license key here...\n\n----- BEGIN KAIVOO LICENSE -----\n...\n----- END KAIVOO LICENSE -----`}
          rows={8}
          className="font-mono text-xs"
        />
        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={handleActivate}
            disabled={activating || !keyInput.trim() || !looksLikeLicenseKey(keyInput)}
            size="sm"
          >
            {activating ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            {activating ? 'Activating...' : 'Activate'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleFileImport}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import File
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-dashed border-border p-4">
        <p className="mb-1 text-sm font-medium text-foreground">Don&apos;t have a license?</p>
        <p className="text-xs text-muted-foreground">
          Purchase Kaivoo to receive your license key via email. All features work without a license — this just removes
          the reminder banner.
        </p>
      </div>
    </div>
  );
}
