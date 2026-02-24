import { useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import { BookOpen, Check, Loader2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import JournalCanvas from '@/components/journal/JournalCanvas';
import JournalCalendarSidebar from '@/components/journal/JournalCalendarSidebar';
import JournalDetailsPanel from '@/components/journal/JournalDetailsPanel';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CanvasSection } from '@/components/journal/JournalCanvas';

interface AIExtraction {
  suggestions: Array<{
    type: 'task' | 'capture' | 'subtask';
    title?: string;
    content?: string;
    dueDate?: string | null;
    priority?: 'low' | 'medium' | 'high';
    topicPath?: string | null;
    tags?: string[];
    parentTaskId?: string;
    parentTaskTitle?: string;
  }>;
}

const JournalPage = () => {
  // --- Core state ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sections, setSections] = useState<CanvasSection[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('idle');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // --- Metadata state ---
  const [tags, setTags] = useState<string[]>([]);
  const [topicPaths, setTopicPaths] = useState<string[]>([]);
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);

  // --- AI extraction state ---
  const [isExtracting, setIsExtracting] = useState(false);
  const [extraction, setExtraction] = useState<AIExtraction | null>(null);
  const [approvedItems, setApprovedItems] = useState<Set<number>>(new Set());

  // --- Store selectors ---
  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const existingTags = useKaivooStore(s => s.tags);
  const tasks = useKaivooStore(s => s.tasks);
  const journalEntries = useKaivooStore(s => s.journalEntries);
  const resolveTopicPath = useKaivooStore(s => s.resolveTopicPath);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);
  const { updateJournalEntry, addTask, addSubtask, resolveTopicPathAsync } = useKaivooActions();

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // --- Load metadata from entries when sections change ---
  const handleSectionsChange = useCallback((newSections: CanvasSection[]) => {
    setSections(newSections);

    // Load aggregated metadata from all entries for this day
    const entries = useKaivooStore.getState().journalEntries.filter(e => e.date === dateStr);
    const allTags = new Set<string>();
    const allTopicIds = new Set<string>();
    let mood: number | undefined;

    entries.forEach(entry => {
      entry.tags?.forEach(t => allTags.add(t));
      entry.topicIds?.forEach(id => allTopicIds.add(id));
      if (entry.moodScore !== undefined && mood === undefined) {
        mood = entry.moodScore;
      }
    });

    setTags(Array.from(allTags));
    const paths = Array.from(allTopicIds)
      .map(id => getTopicPath(id))
      .filter((p): p is string => Boolean(p));
    setTopicPaths(paths);
    setMoodScore(mood);
    setExtraction(null);
    setApprovedItems(new Set());
  }, [dateStr, getTopicPath]);

  // --- Get the latest entry for metadata writes ---
  const latestEntryId = useMemo(() => {
    const entries = journalEntries
      .filter(e => e.date === dateStr)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return entries[0]?.id || null;
  }, [journalEntries, dateStr]);

  // --- Save metadata to latest entry ---
  const saveMetadata = useCallback(async (updates: { tags?: string[]; topicIds?: string[]; moodScore?: number }) => {
    if (!latestEntryId) return;
    try {
      await updateJournalEntry(latestEntryId, updates);
    } catch (e) {
      console.error('[JournalPage] Failed to save metadata:', e);
    }
  }, [latestEntryId, updateJournalEntry]);

  // --- Metadata handlers ---
  const handleAddTag = useCallback((tag: string) => {
    setTags(prev => {
      const next = [...prev, tag];
      void saveMetadata({ tags: next });
      return next;
    });
  }, [saveMetadata]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(prev => {
      const next = prev.filter(t => t !== tag);
      void saveMetadata({ tags: next });
      return next;
    });
  }, [saveMetadata]);

  const handleAddTopic = useCallback(async (path: string) => {
    if (topicPaths.includes(path)) return;
    setTopicPaths(prev => [...prev, path]);

    // Resolve and save
    const resolved = await resolveTopicPathAsync(path, true);
    if (resolved && latestEntryId) {
      const currentEntry = journalEntries.find(e => e.id === latestEntryId);
      const currentIds = currentEntry?.topicIds || [];
      const newIds = [...new Set([...currentIds, ...resolved])];
      await updateJournalEntry(latestEntryId, { topicIds: newIds });
    }
  }, [topicPaths, resolveTopicPathAsync, latestEntryId, journalEntries, updateJournalEntry]);

  const handleRemoveTopic = useCallback(async (path: string) => {
    setTopicPaths(prev => prev.filter(p => p !== path));

    // Resolve the path to get its IDs, then remove from entry
    const resolved = resolveTopicPath(path, false);
    if (resolved && latestEntryId) {
      const currentEntry = journalEntries.find(e => e.id === latestEntryId);
      const currentIds = currentEntry?.topicIds || [];
      const removeSet = new Set(resolved);
      const newIds = currentIds.filter(id => !removeSet.has(id));
      await updateJournalEntry(latestEntryId, { topicIds: newIds });
    }
  }, [resolveTopicPath, latestEntryId, journalEntries, updateJournalEntry]);

  const handleMoodChange = useCallback((score: number | undefined) => {
    setMoodScore(score);
    void saveMetadata({ moodScore: score });
  }, [saveMetadata]);

  const topicExists = useCallback((path: string) => {
    return resolveTopicPath(path, false) !== null;
  }, [resolveTopicPath]);

  // --- AI extraction ---
  const canExtract = sections.length > 0;

  const handleExtract = useCallback(async () => {
    const entries = useKaivooStore.getState().journalEntries.filter(e => e.date === dateStr);
    const allContent = entries.map(e => e.content).join(' ');
    if (!allContent.trim()) {
      toast.error('Please write something first');
      return;
    }

    setIsExtracting(true);
    try {
      const plainText = allContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data, error } = await supabase.functions.invoke<AIExtraction>('ai-journal-extract', {
        body: {
          input: plainText,
          topics: topics.map(t => {
            const pages = topicPages.filter(p => p.topicId === t.id).map(p => ({ id: p.id, name: p.name }));
            return { id: t.id, name: t.name, pages };
          }),
          tags: existingTags.map(t => ({ id: t.id, name: t.name })),
          tasks: tasks.filter(t => t.status !== 'done').map(t => ({
            id: t.id, title: t.title, subtaskCount: t.subtasks?.length || 0,
          })),
          currentDate: format(new Date(), 'yyyy-MM-dd'),
        },
      });

      if (error) throw error;

      if (data && data.suggestions?.length > 0) {
        setExtraction(data);
        toast.success(`Found ${data.suggestions.length} items to extract`);
      } else {
        toast.info('No actionable items found', { description: 'Try adding more details' });
      }
    } catch (e) {
      console.error('AI extraction failed:', e);
      toast.error('AI extraction failed', { description: 'Please try again' });
    } finally {
      setIsExtracting(false);
    }
  }, [dateStr, topics, topicPages, existingTags, tasks]);

  const handleApproveItem = useCallback(async (index: number) => {
    if (!extraction) return;
    const item = extraction.suggestions[index];

    try {
      if (item.type === 'task') {
        const resolved = item.topicPath
          ? await resolveTopicPathAsync(item.topicPath.replace(/^\[\[|\]\]$/g, ''), true)
          : [];
        await addTask({
          title: item.title || '',
          status: 'todo',
          priority: item.priority || 'medium',
          dueDate: item.dueDate || undefined,
          tags: item.tags?.map(t => t.replace(/^#/, '')) || [],
          topicIds: resolved || [],
          subtasks: [],
        });
        toast.success('Task created', { description: item.title });
      } else if (item.type === 'subtask' && item.parentTaskId) {
        await addSubtask(item.parentTaskId, item.title || '');
        toast.success('Subtask added', { description: item.title });
      }
      setApprovedItems(prev => new Set(prev).add(index));
    } catch (e) {
      console.error('Failed to approve item:', e);
      toast.error('Failed to create item');
    }
  }, [extraction, resolveTopicPathAsync, addTask, addSubtask]);

  // --- Section click handler ---
  const handleSectionClick = useCallback((entryId: string) => {
    setActiveSectionId(entryId);
    // The canvas exposes scrollToSection via the editor instance
    const canvasEditor = document.querySelector('.ProseMirror');
    if (canvasEditor) {
      const divider = canvasEditor.querySelector(`[data-entry-id="${entryId}"]`);
      if (divider) {
        divider.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  // --- Date navigation ---
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setActiveSectionId(null);
  }, []);

  // --- Save status display ---
  const statusDisplay = useMemo(() => {
    switch (saveStatus) {
      case 'saved':
        return (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Check className="w-3 h-3" />
            Saved
          </span>
        );
      case 'saving':
        return (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Saving...
          </span>
        );
      case 'unsaved':
        return (
          <span className="text-xs text-amber-500">Unsaved changes</span>
        );
      case 'idle':
      default:
        return null;
    }
  }, [saveStatus]);

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header — date + save status only */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Journal</h1>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>
              {statusDisplay}
            </div>
          </div>

          {/* Canvas — zero friction, just the editor */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <JournalCanvas
                selectedDate={selectedDate}
                onSectionsChange={handleSectionsChange}
                onSaveStatusChange={setSaveStatus}
              />
            </div>
          </div>
        </div>

        {/* Calendar sidebar with section anchors + details panel */}
        <JournalCalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          sections={sections}
          onSectionClick={handleSectionClick}
          activeSectionId={activeSectionId}
        >
          <JournalDetailsPanel
            tags={tags}
            topicPaths={topicPaths}
            moodScore={moodScore}
            existingTags={existingTags}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onAddTopic={(path) => void handleAddTopic(path)}
            onRemoveTopic={(path) => void handleRemoveTopic(path)}
            onMoodChange={handleMoodChange}
            topicExists={topicExists}
            isExtracting={isExtracting}
            extraction={extraction}
            approvedItems={approvedItems}
            onExtract={() => void handleExtract()}
            onApproveItem={(i) => void handleApproveItem(i)}
            canExtract={canExtract}
          />
        </JournalCalendarSidebar>
      </div>
    </AppLayout>
  );
};

export default JournalPage;
