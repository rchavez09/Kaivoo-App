/**
 * Update Notification — Sprint 25 P13
 *
 * Toast-style notification when an update is available.
 * "Update available (v1.2.0)" with Update / Later actions.
 * Shows download progress during update.
 */

import { Download, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAppUpdater } from '@/hooks/useAppUpdater';
import { useState } from 'react';

export default function UpdateNotification() {
  const { available, version, downloading, progress, error, downloadAndInstall } = useAppUpdater();
  const [dismissed, setDismissed] = useState(false);

  if (!available || dismissed) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40 w-72 rounded-xl border border-border bg-card p-4 shadow-lg">
      {downloading ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Downloading update...
          </div>
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{progress}%</p>
        </div>
      ) : (
        <>
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Update available</p>
              <p className="text-xs text-muted-foreground">Version {version} is ready to install</p>
            </div>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss update notification"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {error && (
            <p className="mb-2 text-xs text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void downloadAndInstall()} className="flex-1">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Update
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Later
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
