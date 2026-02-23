import { useState, useCallback } from 'react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useAIActionLog } from '@/hooks/useAIActionLog';
import { toast } from 'sonner';
import type { Suggestion, Clarification, LinkNote, LinkTask, LinkCaptureResponse } from './ai-inbox-types';
import { detectUrl } from './ai-inbox-types';
import { fetchThoughtSuggestions, fetchLinkCapture, normalizeTopicPath } from './ai-inbox-api';

export function useAIInboxState() {
  const [activeTab, setActiveTab] = useState<'thought' | 'link'>('thought');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [clarification, setClarification] = useState<Clarification | null>(null);
  const [pendingInput, setPendingInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  // Link capture state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkInstruction, setLinkInstruction] = useState('');
  const [needsManualInput, setNeedsManualInput] = useState(false);
  const [manualContent, setManualContent] = useState('');
  const [linkResult, setLinkResult] = useState<LinkCaptureResponse | null>(null);
  const [editedNote, setEditedNote] = useState<LinkNote | null>(null);
  const [linkTasks, setLinkTasks] = useState<LinkTask[]>([]);

  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const tags = useKaivooStore(s => s.tags);
  const tasks = useKaivooStore(s => s.tasks);
  const { addTask, addCapture, addSubtask, resolveTopicPathAsync } = useKaivooActions();
  const { logs, undoAction, logAction } = useAIActionLog();

  const buildTopicContext = useCallback(() =>
    topics.map(t => ({
      id: t.id, name: t.name,
      pages: topicPages.filter(p => p.topicId === t.id).map(p => ({ id: p.id, name: p.name })),
    })),
  [topics, topicPages]);

  const buildTagContext = useCallback(() =>
    tags.map(t => ({ id: t.id, name: t.name })),
  [tags]);

  const processInput = useCallback(async (text: string, followUp?: { question: string; answer: string }) => {
    setIsProcessing(true);
    try {
      const taskContext = tasks
        .filter(t => t.status !== 'done')
        .map(t => ({ id: t.id, title: t.title, subtaskCount: t.subtasks?.length || 0 }));

      const data = await fetchThoughtSuggestions(text, buildTopicContext(), buildTagContext(), taskContext, followUp);

      if (data.clarification) {
        setClarification(data.clarification);
        setPendingInput(text);
        setSuggestions([]);
      } else if (data.suggestions?.length) {
        setSuggestions(data.suggestions.map(s => ({ ...s, selected: true })));
        setClarification(null);
        setPendingInput('');
      } else {
        toast.info('No actionable items found in your input');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error('Failed to process with AI. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [tasks, buildTopicContext, buildTagContext]);

  const processLinkUrl = useCallback(async (url: string, instruction: string) => {
    setIsProcessing(true);
    setLinkResult(null);
    setEditedNote(null);
    setLinkTasks([]);

    try {
      const data = await fetchLinkCapture(url, instruction || undefined, buildTopicContext(), buildTagContext());

      if (data.needsSetup) {
        toast.error('Please connect Firecrawl in Settings to use Link Capture.');
        return;
      }
      if (data.needsManualInput) {
        setNeedsManualInput(true);
        toast.info(data.message || 'Could not access page. Please paste content manually.');
      } else if (data.note) {
        setLinkResult(data);
        setEditedNote(data.note);
        setLinkTasks(data.tasks?.map(t => ({ ...t, selected: true })) || []);
        setNeedsManualInput(false);
        toast.success('Link processed! Review the results below.');
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Link processing error:', error);
      toast.error('Failed to process link. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [buildTopicContext, buildTagContext]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isProcessing) return;
    const detected = detectUrl(input.trim());
    if (detected) {
      setActiveTab('link');
      setLinkUrl(detected.url);
      setLinkInstruction(detected.instruction);
      processLinkUrl(detected.url, detected.instruction);
    } else {
      processInput(input.trim());
    }
  }, [input, isProcessing, processInput, processLinkUrl]);

  const handleLinkSubmit = useCallback(() => {
    if (!linkUrl.trim() || isProcessing) return;
    processLinkUrl(linkUrl.trim(), linkInstruction.trim());
  }, [linkUrl, linkInstruction, isProcessing, processLinkUrl]);

  const handleClarificationChoice = useCallback((choice: string) => {
    if (!clarification || !pendingInput) return;
    processInput(pendingInput, { question: clarification.question, answer: choice });
    setClarification(null);
  }, [clarification, pendingInput, processInput]);

  const toggleSuggestion = useCallback((index: number) => {
    setSuggestions(prev => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s));
  }, []);

  const updateSuggestion = useCallback((index: number, updates: Record<string, unknown>) => {
    setSuggestions(prev => prev.map((s, i) => i !== index ? s : { ...s, ...updates } as Suggestion));
  }, []);

  const toggleLinkTask = useCallback((index: number) => {
    setLinkTasks(prev => prev.map((t, i) => i === index ? { ...t, selected: !t.selected } : t));
  }, []);

  const handleApprove = useCallback(async () => {
    const selected = suggestions.filter(s => s.selected);
    if (!selected.length) { toast.info('No items selected'); return; }

    setIsProcessing(true);
    const createdItems: string[] = [];

    try {
      const topicPathCache = new Map<string, string[]>();
      const uniquePaths = new Set<string>();
      for (const s of selected) {
        if (s.type !== 'subtask' && s.topicPath)
          uniquePaths.add(normalizeTopicPath(s.topicPath.replace(/^\[\[|\]\]$/g, '')));
      }
      for (const path of uniquePaths) {
        const resolved = await resolveTopicPathAsync(path, true);
        if (resolved) topicPathCache.set(path, resolved);
      }

      for (const s of selected) {
        if (s.type === 'subtask') {
          await addSubtask(s.parentTaskId, s.title);
          await logAction('subtask_created', { parentTaskId: s.parentTaskId, parentTaskTitle: s.parentTaskTitle, title: s.title }, input);
          createdItems.push(`Subtask: ${s.title}`);
        } else if (s.type === 'task') {
          const topicIds = s.topicPath ? topicPathCache.get(normalizeTopicPath(s.topicPath.replace(/^\[\[|\]\]$/g, ''))) || [] : [];
          const tagNames = s.tags.map(t => t.replace(/^#/, ''));
          const task = await addTask({ title: s.title, status: 'todo', priority: s.priority, dueDate: s.dueDate || undefined, tags: tagNames, topicIds, subtasks: [] });
          if (task) {
            await logAction('task_created', { taskId: task.id, title: task.title, topicIds, tags: tagNames }, input);
            createdItems.push(`Task: ${s.title}`);
          }
        } else if (s.type === 'capture') {
          const topicIds = s.topicPath ? topicPathCache.get(normalizeTopicPath(s.topicPath.replace(/^\[\[|\]\]$/g, ''))) || [] : [];
          const tagNames = s.tags.map(t => t.replace(/^#/, ''));
          const capture = await addCapture({ content: s.content, source: 'quick', date: new Date().toISOString().split('T')[0], tags: tagNames, topicIds });
          if (capture) {
            await logAction('capture_created', { captureId: capture.id, content: s.content.substring(0, 100), topicIds, tags: tagNames }, input);
            createdItems.push(`Note: ${s.content.substring(0, 40)}...`);
          }
        }
      }

      toast.success(`Created ${createdItems.length} item(s)`);
      setSuggestions([]);
      setInput('');
    } catch (error) {
      console.error('Failed to create items:', error);
      toast.error('Failed to create some items');
    } finally {
      setIsProcessing(false);
    }
  }, [suggestions, input, addTask, addCapture, addSubtask, resolveTopicPathAsync, logAction]);

  const handleApproveLinkCapture = useCallback(async () => {
    if (!editedNote) { toast.info('No note to save'); return; }
    setIsProcessing(true);
    const createdItems: string[] = [];

    try {
      let topicIds: string[] = [];
      if (editedNote.topicPath) {
        const resolved = await resolveTopicPathAsync(editedNote.topicPath.replace(/^\[\[|\]\]$/g, ''), true);
        if (resolved) topicIds = resolved;
      }
      const tagNames = editedNote.tags.map(t => t.replace(/^#/, ''));
      const noteContent = `# ${editedNote.title}\n\n${editedNote.content}\n\n---\n*Source: ${editedNote.sourceUrl}*`;

      const capture = await addCapture({ content: noteContent, source: 'quick', date: new Date().toISOString().split('T')[0], tags: tagNames, topicIds });
      if (capture) {
        await logAction('capture_created', { captureId: capture.id, content: editedNote.title, topicIds, tags: tagNames, sourceUrl: editedNote.sourceUrl }, `Link: ${linkUrl}`);
        createdItems.push(`Note: ${editedNote.title}`);
      }

      for (const task of linkTasks.filter(t => t.selected)) {
        let taskTopicIds: string[] = [];
        if (task.topicPath) {
          const resolved = await resolveTopicPathAsync(task.topicPath.replace(/^\[\[|\]\]$/g, ''), true);
          if (resolved) taskTopicIds = resolved;
        }
        const created = await addTask({ title: task.title, status: 'todo', priority: task.priority, topicIds: taskTopicIds, tags: [], subtasks: [] });
        if (created) {
          await logAction('task_created', { taskId: created.id, title: created.title, topicIds: taskTopicIds }, `Link: ${linkUrl}`);
          createdItems.push(`Task: ${task.title}`);
        }
      }

      toast.success(`Created ${createdItems.length} item(s) from link`);
      setLinkUrl(''); setLinkInstruction(''); setManualContent('');
      setNeedsManualInput(false); setLinkResult(null); setEditedNote(null);
      setLinkTasks([]); setActiveTab('thought');
    } catch (error) {
      console.error('Failed to save link capture:', error);
      toast.error('Failed to save some items');
    } finally {
      setIsProcessing(false);
    }
  }, [editedNote, linkTasks, linkUrl, addCapture, addTask, resolveTopicPathAsync, logAction]);

  const handleCancel = useCallback(() => {
    setSuggestions([]); setClarification(null); setPendingInput('');
  }, []);

  const handleCancelLink = useCallback(() => {
    setLinkUrl(''); setLinkInstruction(''); setManualContent('');
    setNeedsManualInput(false); setLinkResult(null); setEditedNote(null); setLinkTasks([]);
  }, []);

  return {
    activeTab, setActiveTab,
    input, setInput, isProcessing, suggestions, clarification,
    linkUrl, setLinkUrl, linkInstruction, setLinkInstruction,
    needsManualInput, manualContent, setManualContent,
    linkResult, editedNote, setEditedNote, linkTasks,
    showHistory, setShowHistory,
    recentLogs: logs.filter(l => !l.undoneAt).slice(0, 5),
    undoAction,
    handleSubmit, handleLinkSubmit, handleClarificationChoice,
    toggleSuggestion, updateSuggestion, toggleLinkTask,
    handleApprove, handleApproveLinkCapture,
    handleCancel, handleCancelLink,
  };
}
