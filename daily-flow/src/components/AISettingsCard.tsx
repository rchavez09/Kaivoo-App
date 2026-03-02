import { Sparkles, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAISettings } from '@/hooks/useAISettings';
import { Skeleton } from '@/components/ui/skeleton';

export default function AISettingsCard() {
  const { aiEnabled, isLoading, toggleAI } = useAISettings();

  if (isLoading) {
    return (
      <div className="widget-card flex items-center gap-4 p-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="widget-card flex items-center gap-4 p-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          aiEnabled ? 'bg-primary/20' : 'bg-secondary'
        }`}
      >
        <Sparkles className={`h-5 w-5 ${aiEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground">AI Features</h3>
        <p className="text-xs text-muted-foreground">
          {aiEnabled ? 'AI Inbox is active on your Today page' : 'Enable to use AI-powered capture and suggestions'}
        </p>
      </div>
      <Switch checked={aiEnabled} onCheckedChange={toggleAI} />
    </div>
  );
}
