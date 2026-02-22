import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface NotificationPrefs {
  taskReminders: boolean;
  dailyBrief: boolean;
  meetingAlerts: boolean;
}

const NotificationSettings = () => {
  const [prefs, setPrefs] = useLocalStorage<NotificationPrefs>('kaivoo-notifications', {
    taskReminders: true,
    dailyBrief: true,
    meetingAlerts: true,
  });

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div>
          <Label htmlFor="taskReminders" className="font-medium">Task Reminders</Label>
          <p className="text-xs text-muted-foreground">Get notified about upcoming due dates</p>
        </div>
        <Switch
          id="taskReminders"
          checked={prefs.taskReminders}
          onCheckedChange={(checked) => updatePref('taskReminders', checked)}
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div>
          <Label htmlFor="dailyBrief" className="font-medium">Daily Brief</Label>
          <p className="text-xs text-muted-foreground">Morning summary of your day</p>
        </div>
        <Switch
          id="dailyBrief"
          checked={prefs.dailyBrief}
          onCheckedChange={(checked) => updatePref('dailyBrief', checked)}
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
        <div>
          <Label htmlFor="meetingAlerts" className="font-medium">Meeting Alerts</Label>
          <p className="text-xs text-muted-foreground">Reminders before meetings start</p>
        </div>
        <Switch
          id="meetingAlerts"
          checked={prefs.meetingAlerts}
          onCheckedChange={(checked) => updatePref('meetingAlerts', checked)}
        />
      </div>

      <p className="text-xs text-muted-foreground pt-2">
        Note: Browser notifications require permission. These settings control in-app notifications.
      </p>
    </div>
  );
};

export default NotificationSettings;
