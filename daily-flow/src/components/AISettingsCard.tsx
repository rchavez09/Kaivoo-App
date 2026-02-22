import { Sparkles, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAISettings } from '@/hooks/useAISettings';
import { Skeleton } from '@/components/ui/skeleton';

export default function AISettingsCard() {
  const { aiEnabled, isLoading, toggleAI } = useAISettings();

  if (isLoading) {
    return (
      <div className="widget-card flex items-center gap-4 p-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="w-10 h-6 rounded-full" />
      </div>
    );
  }

  return (
    <div className="widget-card flex items-center gap-4 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        aiEnabled ? 'bg-primary/20' : 'bg-secondary'
      }`}>
        <Sparkles className={`w-5 h-5 ${aiEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-medium text-foreground">AI Features</h3>
        <p className="text-xs text-muted-foreground">
          {aiEnabled 
            ? 'AI Inbox is active on your Today page' 
            : 'Enable to use AI-powered capture and suggestions'
          }
        </p>
      </div>
      <Switch checked={aiEnabled} onCheckedChange={toggleAI} />
    </div>
  );
}
