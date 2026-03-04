import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  FolderOpen,
  Folder,
  Plus,
  ChevronRight,
  ChevronDown,
  FileText,
  MoreHorizontal,
  Search,
  Trash2,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import type { Topic } from '@/types';

const Topics = () => {
  const navigate = useNavigate();
  const topics = useKaivooStore((s) => s.topics);
  const topicPages = useKaivooStore((s) => s.topicPages);
  const getJournalEntriesByTopic = useKaivooStore((s) => s.getJournalEntriesByTopic);
  const getCapturesByTopic = useKaivooStore((s) => s.getCapturesByTopic);
  const getTasksByTopic = useKaivooStore((s) => s.getTasksByTopic);
  const { addTopic, addTopicPage, deleteTopic } = useKaivooActions();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set(['topic-1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicParentId, setNewTopicParentId] = useState<string | undefined>(undefined);
  const [newPageName, setNewPageName] = useState('');
  const [selectedTopicForPage, setSelectedTopicForPage] = useState<string | null>(null);
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [deleteTopicId, setDeleteTopicId] = useState<string | null>(null);
  const deleteTopicName = topics.find((t) => t.id === deleteTopicId)?.name ?? '';

  // Build topic tree: root topics + their children
  const rootTopics = useMemo(() => topics.filter((t) => !t.parentId), [topics]);
  const childTopicsByParent = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const topic of topics) {
      if (topic.parentId) {
        const siblings = map.get(topic.parentId) ?? [];
        siblings.push(topic);
        map.set(topic.parentId, siblings);
      }
    }
    return map;
  }, [topics]);

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleCreateTopic = () => {
    if (newTopicName.trim()) {
      void addTopic({ name: newTopicName.trim(), parentId: newTopicParentId });
      setNewTopicName('');
      setNewTopicParentId(undefined);
      setCreateTopicOpen(false);
    }
  };

  const openCreateSubtopic = (parentId: string) => {
    setNewTopicParentId(parentId);
    setCreateTopicOpen(true);
  };

  const handleCreatePage = () => {
    if (newPageName.trim() && selectedTopicForPage) {
      void addTopicPage({ topicId: selectedTopicForPage, name: newPageName.trim() });
      setNewPageName('');
      setSelectedTopicForPage(null);
      setCreatePageOpen(false);
    }
  };

  const openCreatePageDialog = (topicId: string) => {
    setSelectedTopicForPage(topicId);
    setCreatePageOpen(true);
  };

  // Filter topics — include a root topic if it or any child/page matches
  const searchLower = searchQuery.toLowerCase();
  const topicMatchesSearch = (topic: Topic): boolean => {
    if (topic.name.toLowerCase().includes(searchLower)) return true;
    if (topicPages.some((p) => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower))) return true;
    // Check if any child topic matches
    const children = childTopicsByParent.get(topic.id) ?? [];
    return children.some((child) => topicMatchesSearch(child));
  };

  const filteredRootTopics = searchQuery ? rootTopics.filter(topicMatchesSearch) : rootTopics;

  // Auto-expand topics that have matching children or pages
  useEffect(() => {
    if (!searchQuery) return;
    const toExpand = new Set(expandedTopics);
    topics.forEach((topic) => {
      const hasMatchingPage = topicPages.some(
        (p) => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower),
      );
      const hasMatchingChild = (childTopicsByParent.get(topic.id) ?? []).some((child) =>
        child.name.toLowerCase().includes(searchLower),
      );
      if (hasMatchingPage || hasMatchingChild) toExpand.add(topic.id);
    });
    setExpandedTopics(toExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Render a single topic row (used for both root and nested topics)
  const renderTopic = (topic: Topic, depth: number) => {
    const pages = topicPages.filter((p) => p.topicId === topic.id);
    const children = childTopicsByParent.get(topic.id) ?? [];
    const isExpanded = expandedTopics.has(topic.id);
    const captureCount = getJournalEntriesByTopic(topic.id).length + getCapturesByTopic(topic.id).length;
    const taskCount = getTasksByTopic(topic.id).length;
    const hasExpandable = pages.length > 0 || children.length > 0;

    // Filter children by search
    const visibleChildren = searchQuery ? children.filter(topicMatchesSearch) : children;

    return (
      <div key={topic.id}>
        {/* Topic row */}
        <div
          className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50"
          style={depth > 0 ? { marginLeft: `${depth * 24}px` } : undefined}
        >
          <button
            onClick={() => toggleTopic(topic.id)}
            className="rounded p-1 hover:bg-secondary"
            aria-expanded={isExpanded}
            aria-label={`Toggle ${topic.name}`}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {topic.icon ? (
            <span className="text-base leading-none">{topic.icon}</span>
          ) : depth > 0 ? (
            <Folder className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FolderOpen className="h-4 w-4 text-primary" />
          )}

          <button onClick={() => navigate(`/topics/${topic.id}`)} className="flex-1 text-left">
            <span className="font-medium text-foreground">{topic.name}</span>
            {topic.description && (
              <span className="ml-2 inline-block max-w-[200px] truncate align-bottom text-xs text-muted-foreground">
                {topic.description.length > 50 ? topic.description.slice(0, 50) + '...' : topic.description}
              </span>
            )}
            <span className="ml-2 text-xs text-muted-foreground">
              {captureCount} capture{captureCount !== 1 ? 's' : ''} · {taskCount} task
              {taskCount !== 1 ? 's' : ''}
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                aria-label={`Actions for ${topic.name}`}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openCreateSubtopic(topic.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subtopic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openCreatePageDialog(topic.id)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Page
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/topics/${topic.id}`)}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteTopicId(topic.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Topic
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Nested children: subtopics + pages */}
        {isExpanded && hasExpandable && (
          <div className="border-l border-border" style={{ marginLeft: `${(depth + 1) * 24 + 8}px` }}>
            {/* Child topics */}
            {visibleChildren.map((child) => renderTopic(child, depth + 1))}

            {/* Pages */}
            {pages.map((page) => {
              const pageCaptures = getJournalEntriesByTopic(page.id).length;
              const pageTasks = getTasksByTopic(page.id).length;

              return (
                <button
                  key={page.id}
                  onClick={() => navigate(`/topics/${topic.id}/pages/${page.id}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary/50"
                >
                  <FileText className="h-4 w-4 text-info-foreground" />
                  <span className="text-sm text-foreground">{page.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {pageCaptures} · {pageTasks}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Topics</h1>
            <p className="text-sm text-muted-foreground">
              {topics.length} topic{topics.length !== 1 ? 's' : ''}, {topicPages.length} page
              {topicPages.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Dialog
            open={createTopicOpen}
            onOpenChange={(open) => {
              setCreateTopicOpen(open);
              if (!open) setNewTopicParentId(undefined);
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{newTopicParentId ? 'Create Subtopic' : 'Create New Topic'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {newTopicParentId && (
                  <p className="text-sm text-muted-foreground">
                    Under: {topics.find((t) => t.id === newTopicParentId)?.name}
                  </p>
                )}
                <Input
                  placeholder={newTopicParentId ? 'Subtopic name' : 'Topic name (e.g., NUWAVE, Personal)'}
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
                  autoFocus
                />
                <Button onClick={handleCreateTopic} className="w-full">
                  {newTopicParentId ? 'Create Subtopic' : 'Create Topic'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search topics and pages..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search topics and pages"
          />
        </div>

        {/* Topic Tree */}
        <div className="widget-card">
          {filteredRootTopics.length > 0 ? (
            <div className="space-y-1">{filteredRootTopics.map((topic) => renderTopic(topic, 0))}</div>
          ) : (
            <div className="py-12 text-center">
              <FolderOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                {searchQuery ? 'No topics found' : 'No topics yet'}
              </h3>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first topic to organize your captures and tasks.'}
              </p>
            </div>
          )}
        </div>

        {/* Create Page Dialog */}
        <Dialog open={createPageOpen} onOpenChange={setCreatePageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Page name (e.g., Amani, Strategy)"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
              />
              <Button onClick={handleCreatePage} className="w-full">
                Create Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Topic Confirmation */}
        <AlertDialog
          open={!!deleteTopicId}
          onOpenChange={(open) => {
            if (!open) setDeleteTopicId(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{deleteTopicName}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this topic and all its pages. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deleteTopicId) void deleteTopic(deleteTopicId);
                  setDeleteTopicId(null);
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
};

export default Topics;
