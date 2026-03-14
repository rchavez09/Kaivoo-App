/**
 * Heartbeat Settings Card — Sprint 37 P2
 *
 * UI for configuring proactive AI heartbeat frequency and notifications.
 * Appears in Settings page under AI Features section.
 */

import { Activity, ChevronRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getHeartbeatSettings, saveHeartbeatSettings } from '@/lib/ai/settings';
import { restartHeartbeat } from '@/lib/heartbeat/heartbeat-service';
import { useState, useEffect } from 'react';

interface HeartbeatSettingsCardProps {
  /** Optional: navigate to expanded settings view */
  onExpand?: () => void;
}

export default function HeartbeatSettingsCard({ onExpand }: HeartbeatSettingsCardProps) {
  const [settings, setSettings] = useState(getHeartbeatSettings());

  // Sync settings on mount and when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setSettings(getHeartbeatSettings());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleToggle = async (enabled: boolean) => {
    const updated = { ...settings, enabled };
    setSettings(updated);
    saveHeartbeatSettings(updated);
    await restartHeartbeat();
  };

  const frequencyLabel = {
    off: 'Off',
    morning: 'Morning (8am)',
    evening: 'Evening (6pm)',
    hourly: `Every ${Math.floor(settings.intervalSeconds / 3600)}h`,
    custom: 'Custom schedule',
  }[settings.frequency];

  return (
    <div className="widget-card flex items-center gap-4 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          settings.enabled ? 'bg-primary/20' : 'bg-secondary'
        }`}
      >
        <Activity className={`h-5 w-5 ${settings.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground">Proactive Insights</h3>
        <p className="text-xs text-muted-foreground">
          {settings.enabled ? `Running ${frequencyLabel}` : 'AI checks context and surfaces insights'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={settings.enabled} onCheckedChange={handleToggle} />
        {onExpand && (
          <button
            onClick={onExpand}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-secondary"
            aria-label="Configure heartbeat"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
