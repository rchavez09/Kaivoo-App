import { useState, useCallback, useEffect, useRef } from 'react';
import { format, isSameDay } from 'date-fns';
import { BookOpen, Hash, FolderOpen, Sparkles, Save, Clock, Loader2, X, FileText, CheckCircle, Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import RichTextEditor from '@/components/journal/RichTextEditor';
import JournalCalendarSidebar from '@/components/journal/JournalCalendarSidebar';
import TopicPagePicker from '@/components/TopicPagePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { supabase } from '@/integrations/supabase/client';
import { JournalEntry } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  const [content, setContent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showTopicPicker, setShowTopicPicker] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [topicPaths, setTopicPaths] = useState<string[]>([]);
  const [extraction, setExtraction] = useState<AIExtraction | null>(null);
  const [approvedItems, setApprovedItems] = useState<Set<number>>(new Set());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const draftKeyRef = useRef(`journal-draft-${format(new Date(), 'yyyy-MM-dd')}`);

  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const existingTags = useKaivooStore(s => s.tags);
  const tasks = useKaivooStore(s => s.tasks);
  const resolveTopicPath = useKaivooStore(s => s.resolveTopicPath);
  const getTopicPath = useKaivooStore(s => s.getTopicPath);
  const { addJournalEntry, updateJournalEntry, addTask, addSubtask, resolveTopicPathAsync } = useKaivooActions();

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKeyRef.current);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setContent(draft.content || '');
        setTags(draft.tags || []);
        setTopicPaths(draft.topicPaths || []);
        setLastSavedAt(draft.savedAt ? new Date(draft.savedAt) : null);
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!isDirty) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      const draft = {
        content,
        tags,
        topicPaths,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(draftKeyRef.current, JSON.stringify(draft));
      setLastSavedAt(new Date());
      setIsDirty(false);
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, tags, topicPaths, isDirty]);

  // Load an existing entry into the editor
  const handleEntrySelect = useCallback((entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setContent(entry.content);
    setTags(entry.tags || []);
    setMoodScore(entry.moodScore);
    // Convert topicIds back to display paths
    const paths = (entry.topicIds || []).map(id => getTopicPath(id)).filter(Boolean);
    setTopicPaths(paths);
    setExtraction(null);
    setApprovedItems(new Set());
    setIsDirty(false);
    setLastSavedAt(null);
  }, [getTopicPath]);

  // Start a new blank entry (clear editor)
  const handleNewEntry = useCallback(() => {
    setEditingEntryId(null);
    setContent('');
    setTags([]);
    setTopicPaths([]);
    setExtraction(null);
    setApprovedItems(new Set());
    setIsDirty(false);
    setLastSavedAt(null);
  }, []);

  const handleContentChange = useCallback((html: string) => {
    setContent(html);
    setIsDirty(true);
  }, []);

  const handleAddTag = () => {
    const tagName = prompt('Enter tag name:');
    if (tagName && tagName.trim()) {
      const normalizedTag = tagName.trim().toLowerCase().replace(/^#/, '');
      if (!tags.includes(normalizedTag)) {
        setTags(prev => [...prev, normalizedTag]);
        setIsDirty(true);
      }
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
    setIsDirty(true);
  };

  const handleTopicSelect = (path: string) => {
    if (!topicPaths.includes(path)) {
      setTopicPaths(prev => [...prev, path]);
      setIsDirty(true);
    }
    setShowTopicPicker(false);
  };

  const handleRemoveTopic = (path: string) => {
    setTopicPaths(prev => prev.filter(p => p !== path));
    setIsDirty(true);
  };

  const saveEntry = async () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }

    setIsSaving(true);
    try {
      // Resolve topic paths to IDs
      const topicIdArrays = await Promise.all(
        topicPaths.map(path => resolveTopicPathAsync(path, true))
      );
      const topicIds = topicIdArrays.filter(Boolean).flat() as string[];

      if (editingEntryId) {
        // Update existing entry
        await updateJournalEntry(editingEntryId, {
          content: content.trim(),
          tags,
          topicIds,
          moodScore,
        });

        toast.success('Entry updated!', {
          description: `Updated at ${format(new Date(), 'h:mm a')}`,
        });

        setIsDirty(false);
        setLastSavedAt(new Date());
      } else {
        // Create new entry
        await addJournalEntry({
          content: content.trim(),
          date: format(selectedDate, 'yyyy-MM-dd'),
          tags,
          topicIds,
          moodScore,
        });

        toast.success('Entry saved!', {
          description: `Saved at ${format(new Date(), 'h:mm a')}`,
        });

        // Clear draft and reset
        localStorage.removeItem(draftKeyRef.current);
        setContent('');
        setTags([]);
        setTopicPaths([]);
        setExtraction(null);
        setApprovedItems(new Set());
        setIsDirty(false);
        setLastSavedAt(null);
        setEditingEntryId(null);
        setMoodScore(undefined);
      }
    } catch (e) {
      console.error('Failed to save entry:', e);
      toast.error('Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const extractWithAI = async () => {
    if (!content.trim()) {
      toast.error('Please write something first');
      return;
    }

    setIsExtracting(true);
    try {
      // Strip HTML for AI processing
      const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      const { data, error } = await supabase.functions.invoke('ai-journal-extract', {
        body: {
          input: plainText,
          topics: topics.map(t => {
            // Get pages for this topic from topicPages
            const pages = topicPages
              .filter(p => p.topicId === t.id)
              .map(p => ({ id: p.id, name: p.name }));
            return {
              id: t.id,
              name: t.name,
              pages,
            };
          }),
          tags: existingTags.map(t => ({ id: t.id, name: t.name })),
          tasks: tasks.filter(t => t.status !== 'done').map(t => ({
            id: t.id,
            title: t.title,
            subtaskCount: t.subtasks?.length || 0,
          })),
          currentDate: format(new Date(), 'yyyy-MM-dd'),
        },
      });

      if (error) throw error;

      if (data.suggestions && data.suggestions.length > 0) {
        setExtraction(data);
        toast.success(`Found ${data.suggestions.length} items to extract`);
      } else {
        toast.info('No actionable items found', {
          description: 'Try adding more specific details to your entry',
        });
      }
    } catch (e) {
      console.error('AI extraction failed:', e);
      toast.error('AI extraction failed', {
        description: 'Please try again',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const approveItem = async (index: number) => {
    if (!extraction) return;
    
    const item = extraction.suggestions[index];
    
    try {
      if (item.type === 'task') {
        const topicIds = item.topicPath 
          ? await resolveTopicPathAsync(item.topicPath.replace(/^\[\[|\]\]$/g, ''), true)
          : [];
        
        await addTask({
          title: item.title!,
          status: 'todo',
          priority: item.priority || 'medium',
          dueDate: item.dueDate || undefined,
          tags: item.tags?.map(t => t.replace(/^#/, '')) || [],
          topicIds: topicIds || [],
          subtasks: [],
        });
        toast.success('Task created', { description: item.title });
      } else if (item.type === 'subtask' && item.parentTaskId) {
        await addSubtask(item.parentTaskId, item.title!);
        toast.success('Subtask added', { description: item.title });
      }
      
      setApprovedItems(prev => new Set(prev).add(index));
    } catch (e) {
      console.error('Failed to approve item:', e);
      toast.error('Failed to create item');
    }
  };

  const topicExists = (path: string) => {
    return resolveTopicPath(path, false) !== null;
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Main editor area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Journal</h1>
                  <p className="text-sm text-muted-foreground">
                    {editingEntryId
                      ? `Editing entry from ${format(selectedDate, 'MMMM d, yyyy')}`
                      : format(selectedDate, 'EEEE, MMMM d, yyyy')
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {editingEntryId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewEntry}
                    className="gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Entry
                  </Button>
                )}
                {lastSavedAt && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {editingEntryId ? 'Saved' : 'Draft saved'} {format(lastSavedAt, 'h:mm a')}
                  </span>
                )}
                {isDirty && (
                  <span className="text-xs text-amber-500">Unsaved changes</span>
                )}
              </div>
            </div>
          </div>

          {/* Editor and actions */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Topic and Tag buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTopicPicker(true)}
                    className="gap-1.5"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Add Topic
                  </Button>
                  {showTopicPicker && (
                    <TopicPagePicker
                      onSelect={handleTopicSelect}
                      onClose={() => setShowTopicPicker(false)}
                      position={{ top: 36, left: 0 }}
                    />
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddTag}
                  className="gap-1.5"
                >
                  <Hash className="w-4 h-4" />
                  Add Tag
                </Button>

                {/* Display selected topics */}
                {topicPaths.map(path => {
                  const exists = topicExists(path);
                  const isPage = path.includes('/');
                  return (
                    <Badge
                      key={path}
                      variant="secondary"
                      className={cn(
                        "gap-1 cursor-pointer group",
                        !exists && "opacity-70"
                      )}
                    >
                      {isPage ? <FileText className="w-3 h-3" /> : <FolderOpen className="w-3 h-3" />}
                      {path}
                      {!exists && <span className="text-[10px]">+</span>}
                      <button
                        onClick={() => handleRemoveTopic(path)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  );
                })}

                {/* Display selected tags */}
                {tags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="gap-1 cursor-pointer group"
                  >
                    <Hash className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              {/* Rich text editor */}
              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Start writing your thoughts, ideas, or reflections..."
              />

              {/* Mood selector */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-muted-foreground">How are you feeling?</span>
                <div className="flex gap-1">
                  {[
                    { score: 5, emoji: '\ud83d\ude0a', label: 'Great' },
                    { score: 4, emoji: '\ud83d\ude42', label: 'Good' },
                    { score: 3, emoji: '\ud83d\ude10', label: 'Okay' },
                    { score: 2, emoji: '\ud83d\ude14', label: 'Low' },
                    { score: 1, emoji: '\ud83d\ude1e', label: 'Rough' },
                  ].map(({ score, emoji, label }) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setMoodScore(moodScore === score ? undefined : score)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-all text-xs',
                        moodScore === score
                          ? 'bg-primary/10 ring-1 ring-primary/30'
                          : 'hover:bg-muted'
                      )}
                      title={label}
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={extractWithAI}
                  disabled={isExtracting || !content.trim()}
                  className="gap-2"
                >
                  {isExtracting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Extract with AI
                </Button>

                <Button
                  onClick={saveEntry}
                  disabled={isSaving || !content.trim()}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingEntryId ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>

              {/* AI Extraction results */}
              {extraction && extraction.suggestions.length > 0 && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">AI Extracted Items</span>
                  </div>
                  
                  <div className="space-y-2">
                    {extraction.suggestions.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border bg-background",
                          approvedItems.has(index) && "opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant={item.type === 'task' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{item.title || item.content}</p>
                            {item.topicPath && (
                              <p className="text-xs text-muted-foreground">{item.topicPath}</p>
                            )}
                            {item.parentTaskTitle && (
                              <p className="text-xs text-muted-foreground">→ {item.parentTaskTitle}</p>
                            )}
                          </div>
                        </div>
                        
                        {!approvedItems.has(index) ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approveItem(index)}
                            className="gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Created
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Calendar sidebar */}
        <JournalCalendarSidebar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            // When navigating to a new date, reset to create mode
            handleNewEntry();
          }}
          onEntrySelect={handleEntrySelect}
          onNewEntry={handleNewEntry}
          activeEntryId={editingEntryId}
        />
      </div>
    </AppLayout>
  );
};

export default JournalPage;
