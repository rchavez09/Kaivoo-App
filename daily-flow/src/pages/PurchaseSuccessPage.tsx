/**
 * Purchase Success Page — Sprint 25 P8
 *
 * Shown after successful Stripe Checkout.
 * Retrieves the license key via session_id and displays it.
 * User can copy or download the key.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function PurchaseSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID found. Please check your email for your license key.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/license-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ session_id: sessionId }),
      });

      if (!res.ok) {
        // License may not be generated yet (webhook delay)
        if (res.status === 404) {
          setError('Your license is being generated. Please check back in a moment or check your email.');
        } else {
          setError('Failed to retrieve license. Please check your email.');
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      setLicenseKey(data.license_key);
      setTier(data.tier);
    } catch {
      setError('Network error. Please check your email for your license key.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void fetchLicense();
  }, [fetchLicense]);

  const handleCopy = async () => {
    if (!licenseKey) return;
    try {
      await navigator.clipboard.writeText(licenseKey);
      toast.success('License key copied to clipboard');
    } catch {
      toast.error('Failed to copy — please select and copy manually');
    }
  };

  const handleDownload = () => {
    if (!licenseKey) return;
    const blob = new Blob([licenseKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaivoo.kaivoo-license';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tierLabel = tier === 'standard' ? 'Standard' : 'Founding Member';

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success-foreground" />
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-foreground">Thank you!</h1>
          <p className="text-sm text-muted-foreground">Your Kaivoo {tierLabel} license is ready.</p>
        </div>

        {/* License key display */}
        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-border bg-card p-8">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Retrieving your license key...</span>
          </div>
        ) : licenseKey ? (
          <div className="space-y-3">
            <pre className="max-h-48 overflow-auto rounded-xl border border-border bg-card p-4 font-mono text-xs text-foreground">
              {licenseKey}
            </pre>
            <div className="flex gap-2">
              <Button onClick={() => void handleCopy()} className="flex-1">
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy License Key
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="mb-3 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                void fetchLicense();
              }}
            >
              Try Again
            </Button>
          </div>
        ) : null}

        {/* Instructions */}
        <div className="rounded-xl border border-dashed border-border p-4 text-center">
          <p className="mb-2 text-sm font-medium text-foreground">How to activate</p>
          <ol className="space-y-1 text-left text-xs text-muted-foreground">
            <li>1. Open Kaivoo on your computer</li>
            <li>2. Go to Settings → License</li>
            <li>3. Paste your license key or import the downloaded file</li>
            <li>4. Click Activate — done!</li>
          </ol>
        </div>

        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Go to Kaivoo
          </Button>
        </div>
      </div>
    </div>
  );
}
