import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAdapters } from '@/lib/adapters/provider';
import { exportAll } from '@/lib/vault/export';
import type { DataAdapter } from '@/lib/adapters/types';
import type { TaskStatus, TaskPriority } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, Upload, Loader2, FileText } from 'lucide-react';

/** Convert snake_case key to camelCase */
const toCamel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/** Convert all keys of an object from snake_case to camelCase */
const camelizeKeys = (obj: Record<string, unknown>): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[toCamel(k)] = v;
  return out;
};

/** Detect if export data uses snake_case keys (Supabase export) */
const isSnakeCase = (data: ExportData): boolean => {
  const sample = data.tasks?.[0] || data.topics?.[0] || data.journalEntries?.[0];
  if (!sample) return false;
  return 'created_at' in sample || 'user_id' in sample;
};

/** Normalize a row: camelize if needed, strip id/userId */
const normalize = (row: Record<string, unknown>, snake: boolean): Record<string, unknown> => {
  const obj = snake ? camelizeKeys(row) : { ...row };
  delete obj.id;
  delete obj.userId;
  return obj;
};

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
  const { data: dataAdapter, vault, fileVault, isLocal } = useAdapters();
  const [exporting, setExporting] = useState(false);
  const [exportingMd, setExportingMd] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    if (!user && !isLocal) return;
    setExporting(true);

    try {
      let exportData: ExportData;

      if (dataAdapter) {
        // Adapter-based export — works on both web and desktop
        const [
          tasks,
          subtasks,
          journals,
          captures,
          topics,
          topicPages,
          tags,
          meetings,
          routineGroups,
          routines,
          routineCompletions,
          projects,
          projectNotes,
        ] = await Promise.all([
          dataAdapter.tasks.fetchAll(),
          dataAdapter.subtasks.fetchAll(),
          dataAdapter.journalEntries.fetchAll(),
          dataAdapter.captures.fetchAll(),
          dataAdapter.topics.fetchAll(),
          dataAdapter.topicPages.fetchAll(),
          dataAdapter.tags.fetchAll(),
          dataAdapter.meetings.fetchAll(),
          dataAdapter.routineGroups.fetchAll(),
          dataAdapter.routines.fetchAll(),
          dataAdapter.routineCompletions.fetchAll(),
          dataAdapter.projects.fetchAll(),
          dataAdapter.projectNotes.fetchAll(),
        ]);

        exportData = {
          exportedAt: new Date().toISOString(),
          version: 2,
          tasks: tasks as unknown as Record<string, unknown>[],
          subtasks: subtasks as unknown as Record<string, unknown>[],
          journalEntries: journals as unknown as Record<string, unknown>[],
          captures: captures as unknown as Record<string, unknown>[],
          topics: topics as unknown as Record<string, unknown>[],
          topicPages: topicPages as unknown as Record<string, unknown>[],
          tags: tags as unknown as Record<string, unknown>[],
          meetings: meetings as unknown as Record<string, unknown>[],
          routineGroups: routineGroups as unknown as Record<string, unknown>[],
          routines: routines as unknown as Record<string, unknown>[],
          routineCompletions: routineCompletions as unknown as Record<string, unknown>[],
          widgetSettings: [],
          aiSettings: [],
          profile: null,
          projects: projects as unknown as Record<string, unknown>[],
          projectNotes: projectNotes as unknown as Record<string, unknown>[],
        };
      } else if (user) {
        // Legacy Supabase-only path (fallback)
        const [
          tasks,
          subtasks,
          journals,
          captures,
          topics,
          topicPages,
          tags,
          meetings,
          routineGroups,
          routines,
          routineCompletions,
          widgetSettings,
          aiSettings,
          profile,
          projects,
          projectNotes,
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

        exportData = {
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
      } else {
        toast.error('Not signed in');
        setExporting(false);
        return;
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flow-export-${new Date().toISOString().split('T')[0]}.json`;
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

  /** Export all data as Obsidian-compatible markdown files (downloaded as .zip on web). */
  const handleMarkdownExport = async () => {
    // Use fileVault (LocalVaultAdapter) on desktop for filesystem writes, fall back to vault on web
    const exportVault = fileVault ?? vault;
    if (!dataAdapter || !exportVault) return;
    setExportingMd(true);

    try {
      const [journals, captures, topics, topicPages] = await Promise.all([
        dataAdapter.journalEntries.fetchAll(),
        dataAdapter.captures.fetchAll(),
        dataAdapter.topics.fetchAll(),
        dataAdapter.topicPages.fetchAll(),
      ]);

      const result = await exportAll({ journals, captures, topics, topicPages }, exportVault);

      if (result.errors.length > 0) {
        console.error('Markdown export errors:', result.errors);
        toast.warning(
          `Exported ${result.exported} files with ${result.errors.length} error(s) — check console for details.`,
          { duration: 6000 },
        );
      } else {
        const pathHint = exportVault.root ? ` → ${exportVault.root}` : '';
        toast.success(`Exported ${result.exported} markdown files to vault${pathHint}`, { duration: 8000 });
      }
    } catch (error) {
      console.error('Markdown export error:', error);
      toast.error('Failed to export markdown');
    }

    setExportingMd(false);
  };

  const stripIds = (rows: Record<string, unknown>[], userId: string) =>
    rows.map(({ id: _id, user_id: _uid, ...rest }) => ({ ...rest, user_id: userId }));

  /** Adapter-based import — works on both web (Supabase adapter) and desktop (local SQLite). */
  const handleAdapterImport = async (data: ExportData, adapter: DataAdapter) => {
    const errors: string[] = [];
    const counts: Record<string, number> = {};
    const inc = (key: string) => {
      counts[key] = (counts[key] || 0) + 1;
    };

    const snake = isSnakeCase(data);
    /** Normalize a row and return it with its original id */
    const prep = (row: Record<string, unknown>) => {
      const oldId = (row.id ?? row.Id) as string;
      const norm = normalize(row, snake);
      return { oldId, norm };
    };

    const topicIdMap = new Map<string, string>();
    const projectIdMap = new Map<string, string>();
    const taskIdMap = new Map<string, string>();
    const routineGroupIdMap = new Map<string, string>();
    const routineIdMap = new Map<string, string>();

    try {
      // 1. Tags
      if (data.tags?.length) {
        for (const row of data.tags) {
          try {
            const { norm } = prep(row);
            await adapter.tags.create({ name: norm.name as string, color: norm.color as string | undefined });
            inc('tags');
          } catch (e) {
            errors.push(`Tag "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 2. Topics (roots first, then children)
      if (data.topics?.length) {
        const parentKey = snake ? 'parent_id' : 'parentId';
        const roots = data.topics.filter((t) => !t[parentKey]);
        const children = data.topics.filter((t) => t[parentKey]);

        for (const row of roots) {
          try {
            const { oldId, norm } = prep(row);
            const created = await adapter.topics.create({
              name: norm.name as string,
              description: norm.description as string | undefined,
              content: norm.content as string | undefined,
              icon: norm.icon as string | undefined,
            });
            topicIdMap.set(oldId, created.id);
            inc('topics');
          } catch (e) {
            errors.push(`Topic "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
        for (const row of children) {
          try {
            const { oldId, norm } = prep(row);
            const oldParent = norm.parentId as string;
            const created = await adapter.topics.create({
              name: norm.name as string,
              description: norm.description as string | undefined,
              content: norm.content as string | undefined,
              icon: norm.icon as string | undefined,
              parentId: topicIdMap.get(oldParent) ?? oldParent,
            });
            topicIdMap.set(oldId, created.id);
            inc('topics');
          } catch (e) {
            errors.push(`Topic "${(row.name as string) || '?'}" (child): ${String(e)}`);
          }
        }
      }

      // 3. Topic pages
      if (data.topicPages?.length) {
        for (const row of data.topicPages) {
          try {
            const { norm } = prep(row);
            const oldTopic = norm.topicId as string;
            const newTopic = topicIdMap.get(oldTopic) ?? oldTopic;
            await adapter.topicPages.create({
              topicId: newTopic,
              name: norm.name as string,
              description: norm.description as string | undefined,
              content: norm.content as string | undefined,
            });
            inc('topicPages');
          } catch (e) {
            errors.push(`Topic page "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 4. Projects
      if (data.projects?.length) {
        for (const row of data.projects) {
          try {
            const { oldId, norm } = prep(row);
            const oldTopic = norm.topicId as string | undefined;
            const created = await adapter.projects.create({
              name: norm.name as string,
              description: norm.description as string | undefined,
              topicId: oldTopic ? (topicIdMap.get(oldTopic) ?? oldTopic) : undefined,
              status: (norm.status as 'active' | 'completed' | 'archived') || 'active',
              color: norm.color as string | undefined,
              icon: norm.icon as string | undefined,
              startDate: norm.startDate as string | undefined,
              endDate: norm.endDate as string | undefined,
            });
            projectIdMap.set(oldId, created.id);
            inc('projects');
          } catch (e) {
            errors.push(`Project "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 5. Project notes
      if (data.projectNotes?.length) {
        for (const row of data.projectNotes) {
          try {
            const { norm } = prep(row);
            const oldProject = norm.projectId as string;
            const newProject = projectIdMap.get(oldProject) ?? oldProject;
            await adapter.projectNotes.create({
              projectId: newProject,
              content: norm.content as string,
            });
            inc('projectNotes');
          } catch (e) {
            errors.push(`Project note: ${String(e)}`);
          }
        }
      }

      // 6. Tasks
      if (data.tasks?.length) {
        for (const row of data.tasks) {
          try {
            const { oldId, norm } = prep(row);
            const oldProject = norm.projectId as string | undefined;
            const created = await adapter.tasks.create({
              title: norm.title as string,
              description: norm.description as string | undefined,
              status: (norm.status as TaskStatus) || 'todo',
              priority: (norm.priority as TaskPriority) || 'medium',
              dueDate: norm.dueDate as string | undefined,
              startDate: norm.startDate as string | undefined,
              tags: (norm.tags as string[]) || [],
              topicIds: ((norm.topicIds as string[]) || []).map((id) => topicIdMap.get(id) ?? id),
              projectId: oldProject ? (projectIdMap.get(oldProject) ?? oldProject) : undefined,
              sourceLink: norm.sourceLink as string | undefined,
            });
            taskIdMap.set(oldId, created.id);
            inc('tasks');
          } catch (e) {
            errors.push(`Task "${(row.title as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 7. Subtasks
      if (data.subtasks?.length) {
        for (const row of data.subtasks) {
          try {
            const { norm } = prep(row);
            const oldTask = norm.taskId as string;
            const newTask = taskIdMap.get(oldTask) ?? oldTask;
            await adapter.subtasks.create({
              taskId: newTask,
              title: norm.title as string,
            });
            inc('subtasks');
          } catch (e) {
            errors.push(`Subtask "${(row.title as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 8. Journal entries
      if (data.journalEntries?.length) {
        for (const row of data.journalEntries) {
          try {
            const { norm } = prep(row);
            await adapter.journalEntries.create({
              date: norm.date as string,
              content: norm.content as string,
              tags: (norm.tags as string[]) || [],
              topicIds: ((norm.topicIds as string[]) || []).map((id) => topicIdMap.get(id) ?? id),
              moodScore: norm.moodScore as number | undefined,
              label: norm.label as string | undefined,
            });
            inc('journals');
          } catch (e) {
            errors.push(`Journal entry: ${String(e)}`);
          }
        }
      }

      // 9. Captures
      if (data.captures?.length) {
        for (const row of data.captures) {
          try {
            const { norm } = prep(row);
            await adapter.captures.create({
              content: norm.content as string,
              source: (norm.source as 'journal' | 'quick' | 'task' | 'video') || 'quick',
              date: norm.date as string,
              tags: (norm.tags as string[]) || [],
              topicIds: ((norm.topicIds as string[]) || []).map((id) => topicIdMap.get(id) ?? id),
            });
            inc('captures');
          } catch (e) {
            errors.push(`Capture: ${String(e)}`);
          }
        }
      }

      // 10. Meetings
      if (data.meetings?.length) {
        for (const row of data.meetings) {
          try {
            const { norm } = prep(row);
            await adapter.meetings.create({
              title: norm.title as string,
              startTime: new Date(norm.startTime as string),
              endTime: new Date(norm.endTime as string),
              location: norm.location as string | undefined,
              description: norm.description as string | undefined,
              attendees: norm.attendees as string[] | undefined,
              isExternal: (norm.isExternal as boolean) ?? false,
              source: norm.source as 'google' | 'outlook' | 'manual' | undefined,
            });
            inc('meetings');
          } catch (e) {
            errors.push(`Meeting "${(row.title as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 11. Routine groups
      if (data.routineGroups?.length) {
        for (const row of data.routineGroups) {
          try {
            const { oldId, norm } = prep(row);
            const created = await adapter.routineGroups.create({
              name: norm.name as string,
              icon: norm.icon as string | undefined,
              color: norm.color as string | undefined,
              order: norm.order as number | undefined,
            });
            routineGroupIdMap.set(oldId, created.id);
            inc('routineGroups');
          } catch (e) {
            errors.push(`Routine group "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 12. Routines
      if (data.routines?.length) {
        for (const row of data.routines) {
          try {
            const { oldId, norm } = prep(row);
            const oldGroup = norm.groupId as string | undefined;
            const created = await adapter.routines.create({
              name: norm.name as string,
              icon: norm.icon as string | undefined,
              order: norm.order as number | undefined,
              groupId: oldGroup ? (routineGroupIdMap.get(oldGroup) ?? oldGroup) : undefined,
            });
            routineIdMap.set(oldId, created.id);
            inc('routines');
          } catch (e) {
            errors.push(`Routine "${(row.name as string) || '?'}": ${String(e)}`);
          }
        }
      }

      // 13. Routine completions (adapter uses toggle, not create)
      if (data.routineCompletions?.length) {
        for (const row of data.routineCompletions) {
          try {
            const { norm } = prep(row);
            const oldRoutine = norm.routineId as string;
            const newRoutine = routineIdMap.get(oldRoutine) ?? oldRoutine;
            const date = norm.date as string;
            if (newRoutine && date) {
              await adapter.routineCompletions.toggle(newRoutine, date, true);
              inc('routineCompletions');
            }
          } catch (e) {
            errors.push(`Routine completion: ${String(e)}`);
          }
        }
      }
    } catch (error) {
      errors.push(`Fatal: ${String(error)}`);
    }

    return { errors, counts };
  };

  const handleImport = async (file: File) => {
    if (!user && !dataAdapter) return;

    // Dedup warning: check if user already has data
    if (dataAdapter) {
      try {
        const existing = await dataAdapter.tasks.fetchAll();
        if (existing.length > 0) {
          const confirmed = window.confirm(
            'You already have data in Flow. Importing will ADD to your existing data (duplicates are possible).\n\nContinue?',
          );
          if (!confirmed) {
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
          }
        }
      } catch {
        // If check fails, proceed anyway
      }
    }

    setImporting(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;

      if (!data.exportedAt) {
        toast.error('Invalid export file');
        setImporting(false);
        return;
      }

      let errors: string[];
      let counts: Record<string, number>;

      if (dataAdapter) {
        // Adapter-based import — works on both web and desktop
        const result = await handleAdapterImport(data, dataAdapter);
        errors = result.errors;
        counts = result.counts;
      } else if (user) {
        // Legacy Supabase-only import path
        const result = await handleSupabaseImport(data, user.id);
        errors = result.errors;
        counts = result.counts;
      } else {
        toast.error('No data adapter available');
        setImporting(false);
        return;
      }

      // Report results
      const summary = Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ');

      if (errors.length > 0) {
        console.error('Import errors:', errors);
        toast.warning(
          `Imported ${summary || 'nothing'}. ${errors.length} error(s) — check browser console for details.`,
          { duration: 8000 },
        );
      } else {
        toast.success(`Imported: ${summary}. Reloading...`, { duration: 3000 });
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import data. Check the console for details.');
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** Legacy Supabase-only import path (web, when adapter isn't available as fallback). */
  const handleSupabaseImport = async (data: ExportData, uid: string) => {
    const errors: string[] = [];
    const counts: Record<string, number> = {};
    const inc = (key: string) => {
      counts[key] = (counts[key] || 0) + 1;
    };

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
        const { error } = await supabase
          .from('tags')
          .upsert({ ...rest, user_id: uid } as never, { onConflict: 'user_id,name' });
        if (error) errors.push(`Tag "${(tag.name as string) || 'unknown'}": ${error.message}`);
        else inc('tags');
      }
    }

    // 3. Topics (parents first, then children)
    if (data.topics?.length) {
      const roots = data.topics.filter((t) => !t.parent_id);
      const children = data.topics.filter((t) => t.parent_id);

      for (const topic of roots) {
        const oldId = topic.id as string;
        const { id: _id, user_id: _uid, parent_id: _pid, ...rest } = topic;
        const { data: inserted, error } = await supabase
          .from('topics')
          .insert({ ...rest, user_id: uid } as never)
          .select('id')
          .single();
        if (error) errors.push(`Topic "${(topic.name as string) || 'unknown'}": ${error.message}`);
        else if (inserted) {
          topicIdMap.set(oldId, inserted.id);
          inc('topics');
        }
      }
      for (const topic of children) {
        const oldId = topic.id as string;
        const { id: _id, user_id: _uid, parent_id: oldParent, ...rest } = topic;
        const newParent = topicIdMap.get(oldParent as string) || null;
        const { data: inserted, error } = await supabase
          .from('topics')
          .insert({ ...rest, user_id: uid, parent_id: newParent } as never)
          .select('id')
          .single();
        if (error) errors.push(`Topic "${(topic.name as string) || 'unknown'}" (child): ${error.message}`);
        else if (inserted) {
          topicIdMap.set(oldId, inserted.id);
          inc('topics');
        }
      }
    }

    // 4. Topic pages
    if (data.topicPages?.length) {
      for (const page of data.topicPages) {
        const { id: _id, user_id: _uid, topic_id: oldTopic, ...rest } = page;
        const newTopic = topicIdMap.get(oldTopic as string);
        if (newTopic) {
          const { error } = await supabase
            .from('topic_pages')
            .insert({ ...rest, user_id: uid, topic_id: newTopic } as never);
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
        const { data: inserted, error } = await supabase
          .from('projects')
          .insert({ ...rest, user_id: uid, topic_id: newTopicId } as never)
          .select('id')
          .single();
        if (error) errors.push(`Project "${(project.name as string) || 'unknown'}": ${error.message}`);
        else if (inserted) {
          projectIdMap.set(oldId, inserted.id);
          inc('projects');
        }
      }
    }

    // 5b. Project notes (after projects, needs projectIdMap)
    if (data.projectNotes?.length) {
      for (const note of data.projectNotes) {
        const { id: _id, user_id: _uid, project_id: oldProjectId, ...rest } = note;
        const newProjectId = oldProjectId ? projectIdMap.get(oldProjectId as string) : undefined;
        if (newProjectId) {
          const { error } = await supabase
            .from('project_notes')
            .insert({ ...rest, user_id: uid, project_id: newProjectId } as never);
          if (error) errors.push(`Project note: ${error.message}`);
          else inc('projectNotes');
        }
      }
    }

    // 6. Tasks
    if (data.tasks?.length) {
      for (const task of data.tasks) {
        const oldId = task.id as string;
        const { id: _id, user_id: _uid, project_id: oldProjectId, ...rest } = task;
        const newProjectId = oldProjectId ? projectIdMap.get(oldProjectId as string) || null : null;
        const { data: inserted, error } = await supabase
          .from('tasks')
          .insert({ ...rest, user_id: uid, project_id: newProjectId } as never)
          .select('id')
          .single();
        if (error) errors.push(`Task "${(task.title as string) || 'unknown'}": ${error.message}`);
        else if (inserted) {
          taskIdMap.set(oldId, inserted.id);
          inc('tasks');
        }
      }
    }

    // 7. Subtasks
    if (data.subtasks?.length) {
      for (const sub of data.subtasks) {
        const { id: _id, user_id: _uid, task_id: oldTaskId, ...rest } = sub;
        const newTaskId = taskIdMap.get(oldTaskId as string);
        if (newTaskId) {
          const { error } = await supabase
            .from('subtasks')
            .insert({ ...rest, user_id: uid, task_id: newTaskId } as never);
          if (error) errors.push(`Subtask "${(sub.title as string) || 'unknown'}": ${error.message}`);
          else inc('subtasks');
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
        const { data: inserted, error } = await supabase
          .from('routine_groups')
          .insert({ ...rest, user_id: uid } as never)
          .select('id')
          .single();
        if (error) errors.push(`Routine group "${(group.name as string) || 'unknown'}": ${error.message}`);
        else if (inserted) {
          routineGroupIdMap.set(oldId, inserted.id);
          inc('routineGroups');
        }
      }
    }

    // 12. Routines
    if (data.routines?.length) {
      for (const routine of data.routines) {
        const oldId = routine.id as string;
        const { id: _id, user_id: _uid, group_id: oldGroup, ...rest } = routine;
        const newGroup = oldGroup ? routineGroupIdMap.get(oldGroup as string) || null : null;
        const { data: inserted, error } = await supabase
          .from('routines')
          .insert({ ...rest, user_id: uid, group_id: newGroup } as never)
          .select('id')
          .single();
        if (error) errors.push(`Routine "${(routine.name as string) || 'unknown'}": ${error.message}`);
        else if (inserted) {
          routineIdMap.set(oldId, inserted.id);
          inc('routines');
        }
      }
    }

    // 13. Routine completions
    if (data.routineCompletions?.length) {
      for (const comp of data.routineCompletions) {
        const { id: _id, user_id: _uid, routine_id: oldRoutine, ...rest } = comp;
        const newRoutine = routineIdMap.get(oldRoutine as string);
        if (newRoutine) {
          const { error } = await supabase
            .from('routine_completions')
            .insert({ ...rest, user_id: uid, routine_id: newRoutine } as never);
          if (error) errors.push(`Routine completion: ${error.message}`);
          else inc('routineCompletions');
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

    return { errors, counts };
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-lg border border-border p-4">
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

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div>
          <h3 className="font-medium text-foreground">Export to Markdown</h3>
          <p className="text-sm text-muted-foreground">
            Export journals, captures, and topics as Obsidian-compatible markdown files with YAML frontmatter.
          </p>
        </div>
        <Button onClick={handleMarkdownExport} disabled={exportingMd || !dataAdapter || !(fileVault ?? vault)} variant="outline">
          {exportingMd ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Export Markdown
            </>
          )}
        </Button>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-4">
        <div>
          <h3 className="font-medium text-foreground">Import Data</h3>
          <p className="text-sm text-muted-foreground">
            Restore data from a Flow export file. This adds to your existing data (does not overwrite).
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
        <Button onClick={() => fileInputRef.current?.click()} disabled={importing} variant="outline">
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

      <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div>
          <h3 className="font-medium text-destructive">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">Account deletion is permanent and cannot be undone.</p>
        </div>
        <Button variant="destructive" disabled>
          Delete Account
        </Button>
        <p className="text-xs text-muted-foreground">Contact support to delete your account.</p>
      </div>
    </div>
  );
};

export default DataSettings;
