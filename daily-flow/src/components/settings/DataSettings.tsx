import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Upload, Loader2 } from 'lucide-react';

interface ExportData {
  exportedAt: string;
  version: number;
  tasks: Record<string, unknown>[];
  subtasks: Record<string, unknown>[];
  journalEntries: Record<string, unknown>[];
  captures: Record<string, unknown>[];
  topics: Record<string, unknown>[];
  topicPages: Record<string, unknown>[];
  tags: Record<string, unknown>[];
  meetings: Record<string, unknown>[];
  routineGroups: Record<string, unknown>[];
  routines: Record<string, unknown>[];
  routineCompletions: Record<string, unknown>[];
  widgetSettings: Record<string, unknown>[];
  aiSettings: Record<string, unknown>[];
  profile: Record<string, unknown> | null;
  projects?: Record<string, unknown>[];
  projectNotes?: Record<string, unknown>[];
}

const DataSettings = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);

    try {
      const [
        tasks, subtasks, journals, captures, topics, topicPages,
        tags, meetings, routineGroups, routines, routineCompletions,
        widgetSettings, aiSettings, profile, projects, projectNotes,
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('subtasks').select('*').eq('user_id', user.id),
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('captures').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('user_id', user.id),
        supabase.from('topic_pages').select('*').eq('user_id', user.id),
        supabase.from('tags').select('*').eq('user_id', user.id),
        supabase.from('meetings').select('*').eq('user_id', user.id),
        supabase.from('routine_groups').select('*').eq('user_id', user.id),
        supabase.from('routines').select('*').eq('user_id', user.id),
        supabase.from('routine_completions').select('*').eq('user_id', user.id),
        supabase.from('widget_settings').select('*').eq('user_id', user.id),
        supabase.from('ai_settings').select('*').eq('user_id', user.id),
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('project_notes').select('*').eq('user_id', user.id),
      ]);

      const exportData: ExportData = {
        exportedAt: new Date().toISOString(),
        version: 2,
        tasks: tasks.data || [],
        subtasks: subtasks.data || [],
        journalEntries: journals.data || [],
        captures: captures.data || [],
        topics: topics.data || [],
        topicPages: topicPages.data || [],
        tags: tags.data || [],
        meetings: meetings.data || [],
        routineGroups: routineGroups.data || [],
        routines: routines.data || [],
        routineCompletions: routineCompletions.data || [],
        widgetSettings: widgetSettings.data || [],
        aiSettings: aiSettings.data || [],
        profile: profile.data || null,
        projects: projects.data || [],
        projectNotes: projectNotes.data || [],
      };

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

  const stripIds = (rows: Record<string, unknown>[], userId: string) =>
    rows.map(({ id: _id, user_id: _uid, ...rest }) => ({ ...rest, user_id: userId }));

  const handleImport = async (file: File) => {
    if (!user) return;
    setImporting(true);

    const errors: string[] = [];
    const counts = { topics: 0, tags: 0, projects: 0, projectNotes: 0, tasks: 0, subtasks: 0, journals: 0, captures: 0, meetings: 0, routineGroups: 0, routines: 0, routineCompletions: 0, widgetSettings: 0 };

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.exportedAt) {
        toast.error('Invalid export file');
        setImporting(false);
        return;
      }

      const uid = user.id;

      const taskIdMap = new Map<string, string>();
      const topicIdMap = new Map<string, string>();
      const projectIdMap = new Map<string, string>();
      const routineGroupIdMap = new Map<string, string>();
      const routineIdMap = new Map<string, string>();

      // 1. Profile
      if (data.profile) {
        const { display_name, avatar_url } = data.profile as { display_name?: string; avatar_url?: string };
        const { error } = await supabase.from('profiles').update({ display_name, avatar_url }).eq('user_id', uid);
        if (error) errors.push(`Profile: ${error.message}`);
      }

      // 2. Tags
      if (data.tags?.length) {
        for (const tag of data.tags) {
          const { id: _id, user_id: _uid, ...rest } = tag;
          const { error } = await supabase.from('tags').upsert({ ...rest, user_id: uid } as never, { onConflict: 'user_id,name' });
          if (error) errors.push(`Tag "${(tag.name as string) || 'unknown'}": ${error.message}`);
          else counts.tags++;
        }
      }

      // 3. Topics (parents first, then children)
      if (data.topics?.length) {
        const roots = data.topics.filter(t => !t.parent_id);
        const children = data.topics.filter(t => t.parent_id);

        for (const topic of roots) {
          const oldId = topic.id as string;
          const { id: _id, user_id: _uid, parent_id: _pid, ...rest } = topic;
          const { data: inserted, error } = await supabase.from('topics').insert({ ...rest, user_id: uid } as never).select('id').single();
          if (error) errors.push(`Topic "${(topic.name as string) || 'unknown'}": ${error.message}`);
          else if (inserted) { topicIdMap.set(oldId, inserted.id); counts.topics++; }
        }
        for (const topic of children) {
          const oldId = topic.id as string;
          const { id: _id, user_id: _uid, parent_id: oldParent, ...rest } = topic;
          const newParent = topicIdMap.get(oldParent as string) || null;
          const { data: inserted, error } = await supabase.from('topics').insert({ ...rest, user_id: uid, parent_id: newParent } as never).select('id').single();
          if (error) errors.push(`Topic "${(topic.name as string) || 'unknown'}" (child): ${error.message}`);
          else if (inserted) { topicIdMap.set(oldId, inserted.id); counts.topics++; }
        }
      }

      // 4. Topic pages
      if (data.topicPages?.length) {
        for (const page of data.topicPages) {
          const { id: _id, user_id: _uid, topic_id: oldTopic, ...rest } = page;
          const newTopic = topicIdMap.get(oldTopic as string);
          if (newTopic) {
            const { error } = await supabase.from('topic_pages').insert({ ...rest, user_id: uid, topic_id: newTopic } as never);
            if (error) errors.push(`Topic page "${(page.name as string) || 'unknown'}": ${error.message}`);
          }
        }
      }

      // 5. Projects (before tasks, since tasks reference project_id)
      if (data.projects?.length) {
        for (const project of data.projects) {
          const oldId = project.id as string;
          const { id: _id, user_id: _uid, topic_id: oldTopicId, ...rest } = project;
          const newTopicId = oldTopicId ? topicIdMap.get(oldTopicId as string) || null : null;
          const { data: inserted, error } = await supabase.from('projects').insert({ ...rest, user_id: uid, topic_id: newTopicId } as never).select('id').single();
          if (error) errors.push(`Project "${(project.name as string) || 'unknown'}": ${error.message}`);
          else if (inserted) { projectIdMap.set(oldId, inserted.id); counts.projects++; }
        }
      }

      // 5b. Project notes (after projects, needs projectIdMap)
      if (data.projectNotes?.length) {
        for (const note of data.projectNotes) {
          const { id: _id, user_id: _uid, project_id: oldProjectId, ...rest } = note;
          const newProjectId = oldProjectId ? projectIdMap.get(oldProjectId as string) : undefined;
          if (newProjectId) {
            const { error } = await supabase.from('project_notes').insert({ ...rest, user_id: uid, project_id: newProjectId } as never);
            if (error) errors.push(`Project note: ${error.message}`);
            else counts.projectNotes++;
          }
        }
      }

      // 6. Tasks
      if (data.tasks?.length) {
        for (const task of data.tasks) {
          const oldId = task.id as string;
          const { id: _id, user_id: _uid, project_id: oldProjectId, ...rest } = task;
          const newProjectId = oldProjectId ? projectIdMap.get(oldProjectId as string) || null : null;
          const { data: inserted, error } = await supabase.from('tasks').insert({ ...rest, user_id: uid, project_id: newProjectId } as never).select('id').single();
          if (error) errors.push(`Task "${(task.title as string) || 'unknown'}": ${error.message}`);
          else if (inserted) { taskIdMap.set(oldId, inserted.id); counts.tasks++; }
        }
      }

      // 7. Subtasks
      if (data.subtasks?.length) {
        for (const sub of data.subtasks) {
          const { id: _id, user_id: _uid, task_id: oldTaskId, ...rest } = sub;
          const newTaskId = taskIdMap.get(oldTaskId as string);
          if (newTaskId) {
            const { error } = await supabase.from('subtasks').insert({ ...rest, user_id: uid, task_id: newTaskId } as never);
            if (error) errors.push(`Subtask "${(sub.title as string) || 'unknown'}": ${error.message}`);
            else counts.subtasks++;
          }
        }
      }

      // 8. Journal entries
      if (data.journalEntries?.length) {
        const rows = stripIds(data.journalEntries, uid);
        const { error } = await supabase.from('journal_entries').insert(rows as never);
        if (error) errors.push(`Journal entries: ${error.message}`);
        else counts.journals = rows.length;
      }

      // 9. Captures
      if (data.captures?.length) {
        const rows = stripIds(data.captures, uid);
        const { error } = await supabase.from('captures').insert(rows as never);
        if (error) errors.push(`Captures: ${error.message}`);
        else counts.captures = rows.length;
      }

      // 10. Meetings
      if (data.meetings?.length) {
        const rows = stripIds(data.meetings, uid);
        const { error } = await supabase.from('meetings').insert(rows as never);
        if (error) errors.push(`Meetings: ${error.message}`);
        else counts.meetings = rows.length;
      }

      // 11. Routine groups
      if (data.routineGroups?.length) {
        for (const group of data.routineGroups) {
          const oldId = group.id as string;
          const { id: _id, user_id: _uid, ...rest } = group;
          const { data: inserted, error } = await supabase.from('routine_groups').insert({ ...rest, user_id: uid } as never).select('id').single();
          if (error) errors.push(`Routine group "${(group.name as string) || 'unknown'}": ${error.message}`);
          else if (inserted) { routineGroupIdMap.set(oldId, inserted.id); counts.routineGroups++; }
        }
      }

      // 12. Routines
      if (data.routines?.length) {
        for (const routine of data.routines) {
          const oldId = routine.id as string;
          const { id: _id, user_id: _uid, group_id: oldGroup, ...rest } = routine;
          const newGroup = oldGroup ? routineGroupIdMap.get(oldGroup as string) || null : null;
          const { data: inserted, error } = await supabase.from('routines').insert({ ...rest, user_id: uid, group_id: newGroup } as never).select('id').single();
          if (error) errors.push(`Routine "${(routine.name as string) || 'unknown'}": ${error.message}`);
          else if (inserted) { routineIdMap.set(oldId, inserted.id); counts.routines++; }
        }
      }

      // 13. Routine completions
      if (data.routineCompletions?.length) {
        for (const comp of data.routineCompletions) {
          const { id: _id, user_id: _uid, routine_id: oldRoutine, ...rest } = comp;
          const newRoutine = routineIdMap.get(oldRoutine as string);
          if (newRoutine) {
            const { error } = await supabase.from('routine_completions').insert({ ...rest, user_id: uid, routine_id: newRoutine } as never);
            if (error) errors.push(`Routine completion: ${error.message}`);
            else counts.routineCompletions++;
          }
        }
      }

      // 14. Widget settings
      if (data.widgetSettings?.length) {
        const rows = stripIds(data.widgetSettings, uid);
        const { error } = await supabase.from('widget_settings').insert(rows as never);
        if (error) errors.push(`Widget settings: ${error.message}`);
        else counts.widgetSettings = rows.length;
      }

      // 15. AI settings
      if (data.aiSettings?.length) {
        const rows = stripIds(data.aiSettings, uid);
        const { error } = await supabase.from('ai_settings').insert(rows as never);
        if (error) errors.push(`AI settings: ${error.message}`);
      }

      // Report results
      if (errors.length > 0) {
        console.error('Import errors:', errors);
        const summary = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
        toast.warning(`Imported ${summary || 'nothing'}. ${errors.length} error(s) — check browser console for details.`, { duration: 8000 });
      } else {
        const summary = Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
        toast.success(`Imported: ${summary}. Refresh to see your data.`, { duration: 6000 });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Check the console for details.');
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-lg border border-border space-y-3">
        <div>
          <h3 className="font-medium text-foreground">Export Your Data</h3>
          <p className="text-sm text-muted-foreground">
            Download all your data (tasks, journal, routines, topics, and more) as a JSON file.
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

      <div className="p-4 rounded-lg border border-border space-y-3">
        <div>
          <h3 className="font-medium text-foreground">Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Restore data from a Kaivoo export file. This adds to your existing data (does not overwrite).
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          variant="outline"
        >
          {importing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Import Data
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
