import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Loader2 } from 'lucide-react';

const DataSettings = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);

    try {
      // Fetch all user data
      const [tasks, journals, captures, topics, meetings] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('captures').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('meetings').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        tasks: tasks.data || [],
        journalEntries: journals.data || [],
        captures: captures.data || [],
        topics: topics.data || [],
        meetings: meetings.data || [],
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kaivoo-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }

    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-border space-y-3">
        <div>
          <h3 className="font-medium text-foreground">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your tasks, journal entries, topics, and meetings as a JSON file.
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting} variant="outline">
          {exporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </div>

      <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
        <div>
          <h3 className="font-medium text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">
            Account deletion is permanent and cannot be undone.
          </p>
        </div>
        <Button variant="destructive" disabled>
          Delete Account
        </Button>
        <p className="text-xs text-muted-foreground">
          Contact support to delete your account.
        </p>
      </div>
    </div>
  );
};

export default DataSettings;
