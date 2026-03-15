/**
 * Heartbeat Settings (Expanded View) — Sprint 37 P2
 *
 * Full settings UI for configuring proactive AI heartbeat.
 * Frequency options: off, morning, evening, hourly (1-12h), custom cron.
 */

import { useState } from 'react';
import { Activity } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getHeartbeatSettings, saveHeartbeatSettings, type HeartbeatSettings } from '@/lib/ai/settings';
import { restartHeartbeat } from '@/lib/heartbeat/heartbeat-service';
import { DayOfWeekSelector } from './DayOfWeekSelector';
import { TimePickerList } from './TimePickerList';
import InsightsHistoryModal from './InsightsHistoryModal';

export default function HeartbeatSettings() {
  const [settings, setSettings] = useState<HeartbeatSettings>(getHeartbeatSettings());
  const [showHistory, setShowHistory] = useState(false);

  // Derive hourly interval from intervalSeconds (for display)
  const hourlyInterval = Math.floor(settings.intervalSeconds / 3600);

  // Custom schedule state (P6-P7)
  const [customDays, setCustomDays] = useState<number[]>(settings.customDays || [1, 2, 3, 4, 5]);
  const [customTimes, setCustomTimes] = useState<string[]>(settings.customTimes || ['08:00']);

  const updateSettings = async (partial: Partial<HeartbeatSettings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveHeartbeatSettings(updated);
    await restartHeartbeat();
  };

  const handleFrequencyChange = (freq: HeartbeatSettings['frequency']) => {
    let intervalSeconds = settings.intervalSeconds;

    // Set sensible defaults based on frequency
    if (freq === 'hourly') {
      intervalSeconds = 3600; // 1 hour default
    } else if (freq === 'custom') {
      // Initialize custom schedule with current state
      void updateSettings({
        frequency: freq,
        intervalSeconds,
        customDays,
        customTimes: customTimes.sort(),
      });
      return;
    }

    void updateSettings({ frequency: freq, intervalSeconds });
  };

  const handleHourlyIntervalChange = (hours: string) => {
    const intervalSeconds = parseInt(hours, 10) * 3600;
    void updateSettings({ intervalSeconds });
  };

  const handleCustomDaysChange = (days: number[]) => {
    setCustomDays(days);
    void updateSettings({
      frequency: 'custom',
      customDays: days,
      customTimes: customTimes.sort(),
    });
  };

  const handleCustomTimesChange = (times: string[]) => {
    setCustomTimes(times);
    void updateSettings({
      frequency: 'custom',
      customDays,
      customTimes: times.sort(),
    });
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
        <Switch
          id="heartbeat-enabled"
          checked={settings.enabled}
          onCheckedChange={(enabled) => void updateSettings({ enabled })}
        />
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
            <SelectItem value="hourly">Every N hours</SelectItem>
            <SelectItem value="custom">Custom schedule</SelectItem>
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

        {/* Custom schedule detail panel (P6-P7) */}
        {settings.frequency === 'custom' && (
          <div className="ml-0 mt-4 space-y-4 rounded-lg bg-muted/50 p-4">
            <div>
              <Label className="mb-3 block text-sm font-medium">Run on:</Label>
              <DayOfWeekSelector value={customDays} onChange={handleCustomDaysChange} />
            </div>
            <TimePickerList value={customTimes} onChange={handleCustomTimesChange} maxTimes={3} />
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

      {/* Quiet Hours (Sprint 38 P6) */}
      <div className="widget-card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="quiet-hours-toggle" className="text-sm font-medium">
              Do Not Disturb
            </Label>
            <p className="text-xs text-muted-foreground">Suppress notifications during quiet hours</p>
          </div>
          <Switch
            id="quiet-hours-toggle"
            checked={settings.quietHoursEnabled}
            onCheckedChange={(enabled) => void updateSettings({ quietHoursEnabled: enabled })}
          />
        </div>
        {settings.quietHoursEnabled && (
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label htmlFor="quiet-start" className="mb-1 block text-xs text-muted-foreground">
                Start
              </Label>
              <input
                id="quiet-start"
                type="time"
                value={settings.quietHoursStart ?? '22:00'}
                onChange={(e) => void updateSettings({ quietHoursStart: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            <span className="mt-5 text-muted-foreground">—</span>
            <div className="flex-1">
              <Label htmlFor="quiet-end" className="mb-1 block text-xs text-muted-foreground">
                End
              </Label>
              <input
                id="quiet-end"
                type="time"
                value={settings.quietHoursEnd ?? '07:00'}
                onChange={(e) => void updateSettings({ quietHoursEnd: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Insights History (Sprint 38 P7) */}
      <div className="widget-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Insights History</p>
            <p className="text-xs text-muted-foreground">View past proactive insights</p>
          </div>
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary"
          >
            View History
          </button>
        </div>
      </div>

      {showHistory && <InsightsHistoryModal onClose={() => setShowHistory(false)} />}

      {/* Info box */}
      <div className="rounded-lg bg-secondary/30 p-4">
        <p className="text-xs text-muted-foreground">
          <strong>How it works:</strong> The heartbeat reads your tasks, calendar, journal, and soul file to identify
          urgent items, scheduling conflicts, patterns, or proactive suggestions. If something actionable is found,
          you'll receive a notification.
        </p>
      </div>
    </div>
  );
}
