/**
 * Heartbeat Settings (Expanded View) — Sprint 37 P2
 *
 * Full settings UI for configuring proactive AI heartbeat.
 * Frequency options: off, morning, evening, hourly (1-12h), custom cron.
 */

import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getHeartbeatSettings, saveHeartbeatSettings, type HeartbeatSettings } from '@/lib/ai/settings';
import { restartHeartbeat } from '@/lib/heartbeat/heartbeat-service';

export default function HeartbeatSettings() {
  const [settings, setSettings] = useState<HeartbeatSettings>(getHeartbeatSettings());

  // Derive hourly interval from intervalSeconds (for display)
  const hourlyInterval = Math.floor(settings.intervalSeconds / 3600);

  const updateSettings = async (partial: Partial<HeartbeatSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveHeartbeatSettings(updated);
    await restartHeartbeat();
  };

  const handleFrequencyChange = (freq: HeartbeatSettings['frequency']) => {
    let intervalSeconds = settings.intervalSeconds;

    // Set sensible defaults based on frequency
    if (freq === 'morning' || freq === 'evening') {
      intervalSeconds = 24 * 60 * 60; // 24 hours
    } else if (freq === 'hourly') {
      intervalSeconds = 3600; // 1 hour default
    }

    void updateSettings({ frequency: freq, intervalSeconds });
  };

  const handleHourlyIntervalChange = (hours: string) => {
    const intervalSeconds = parseInt(hours, 10) * 3600;
    void updateSettings({ intervalSeconds });
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Proactive Insights</h2>
            <p className="text-sm text-muted-foreground">AI checks your context and surfaces insights</p>
          </div>
        </div>
      </header>

      {/* Enable/Disable */}
      <div className="widget-card flex items-center justify-between p-4">
        <div>
          <Label htmlFor="heartbeat-enabled" className="text-sm font-medium">
            Enable Heartbeat
          </Label>
          <p className="text-xs text-muted-foreground">AI runs in background at scheduled intervals</p>
        </div>
        <Switch id="heartbeat-enabled" checked={settings.enabled} onCheckedChange={(enabled) => void updateSettings({ enabled })} />
      </div>

      {/* Frequency */}
      <div className="widget-card p-4">
        <Label htmlFor="heartbeat-frequency" className="mb-3 block text-sm font-medium">
          Frequency
        </Label>
        <Select value={settings.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger id="heartbeat-frequency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Off</SelectItem>
            <SelectItem value="morning">Morning only (8am)</SelectItem>
            <SelectItem value="evening">Evening only (6pm)</SelectItem>
            <SelectItem value="hourly">Every N hours</SelectItem>
            <SelectItem value="custom">Custom schedule (advanced)</SelectItem>
          </SelectContent>
        </Select>

        {/* Hourly interval selector */}
        {settings.frequency === 'hourly' && (
          <div className="mt-4">
            <Label htmlFor="hourly-interval" className="mb-2 block text-sm">
              Interval (hours)
            </Label>
            <Select value={String(hourlyInterval)} onValueChange={handleHourlyIntervalChange}>
              <SelectTrigger id="hourly-interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Every 1 hour</SelectItem>
                <SelectItem value="2">Every 2 hours</SelectItem>
                <SelectItem value="4">Every 4 hours</SelectItem>
                <SelectItem value="6">Every 6 hours</SelectItem>
                <SelectItem value="12">Every 12 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom cron input */}
        {settings.frequency === 'custom' && (
          <div className="mt-4">
            <Label htmlFor="custom-cron" className="mb-2 block text-sm">
              Cron Expression
            </Label>
            <Input
              id="custom-cron"
              type="text"
              placeholder="0 8 * * *"
              value={settings.customCron || ''}
              onChange={(e) => void updateSettings({ customCron: e.target.value })}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Advanced: Use cron syntax (e.g., "0 8 * * *" for 8am daily)
            </p>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="widget-card flex items-center justify-between p-4">
        <div>
          <Label htmlFor="heartbeat-notifications" className="text-sm font-medium">
            Notifications
          </Label>
          <p className="text-xs text-muted-foreground">Show system notification when insight is found</p>
        </div>
        <Switch
          id="heartbeat-notifications"
          checked={settings.notificationsEnabled}
          onCheckedChange={(enabled) => void updateSettings({ notificationsEnabled: enabled })}
        />
      </div>

      {/* Info box */}
      <div className="rounded-lg bg-secondary/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>How it works:</strong> The heartbeat reads your tasks, calendar, journal, and soul file to identify urgent items,
          scheduling conflicts, patterns, or proactive suggestions. If something actionable is found, you'll receive a notification.
        </p>
      </div>
    </div>
  );
}
