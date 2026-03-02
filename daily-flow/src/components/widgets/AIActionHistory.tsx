import React from 'react';
import { History, ChevronUp, ChevronDown, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LogEntry {
  id: string;
  actionType: string;
  actionData: Record<string, unknown>;
  undoneAt?: string | null;
}

interface AIActionHistoryProps {
  logs: LogEntry[];
  showHistory: boolean;
  onToggleHistory: (open: boolean) => void;
  onUndo: (logId: string) => void;
}

const AIActionHistory = React.memo(function AIActionHistory({
  logs,
  showHistory,
  onToggleHistory,
  onUndo,
}: AIActionHistoryProps) {
  if (logs.length === 0) return null;

  return (
    <Collapsible open={showHistory} onOpenChange={onToggleHistory}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent AI Actions ({logs.length})
          </span>
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2 text-sm">
            <div>
              <span className="font-medium">{log.actionType.replace('_', ' ')}</span>
              <span className="ml-2 text-muted-foreground">
                {(log.actionData as Record<string, string>).title ||
                  (log.actionData as Record<string, string>).content?.substring(0, 30)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUndo(log.id)}
              aria-label={`Undo ${log.actionType.replace('_', ' ')}`}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

export default AIActionHistory;
