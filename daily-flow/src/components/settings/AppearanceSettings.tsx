import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Sun, Monitor, Calendar } from 'lucide-react';
import { useUserPreferences, WeekStartDay } from '@/hooks/useUserPreferences';
import { Separator } from '@/components/ui/separator';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type Theme = 'light' | 'dark' | 'system';

const AppearanceSettings = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('kaivoo-theme', 'system');
  const { preferences, loading, setWeekStartsOn } = useUserPreferences();

  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);

    const root = document.documentElement;

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Section */}
      <div className="space-y-3">
        <Label>Theme</Label>
        <RadioGroup value={theme} onValueChange={(value) => applyTheme(value as Theme)}>
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <Sun className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="light" className="flex-1 cursor-pointer">
              <span className="font-medium">Light</span>
              <p className="text-xs text-muted-foreground">A clean, bright appearance</p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <RadioGroupItem value="dark" id="dark" />
            <Moon className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="dark" className="flex-1 cursor-pointer">
              <span className="font-medium">Dark</span>
              <p className="text-xs text-muted-foreground">Easy on the eyes</p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <RadioGroupItem value="system" id="system" />
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="system" className="flex-1 cursor-pointer">
              <span className="font-medium">System</span>
              <p className="text-xs text-muted-foreground">Match your device settings</p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Week Start Section */}
      <div className="space-y-3">
        <Label>Week Starts On</Label>
        <RadioGroup 
          value={String(preferences.weekStartsOn)} 
          onValueChange={(value) => setWeekStartsOn(Number(value) as WeekStartDay)}
          disabled={loading}
        >
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <RadioGroupItem value="1" id="monday" />
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="monday" className="flex-1 cursor-pointer">
              <span className="font-medium">Monday</span>
              <p className="text-xs text-muted-foreground">Standard work week (Mon - Sun)</p>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer">
            <RadioGroupItem value="0" id="sunday" />
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="sunday" className="flex-1 cursor-pointer">
              <span className="font-medium">Sunday</span>
              <p className="text-xs text-muted-foreground">Traditional calendar week (Sun - Sat)</p>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};

export default AppearanceSettings;
