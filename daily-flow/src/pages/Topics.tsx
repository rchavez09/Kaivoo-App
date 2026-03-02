import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import {
  FolderOpen,
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

import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { toast } from 'sonner';

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
  const [newPageName, setNewPageName] = useState('');
  const [selectedTopicForPage, setSelectedTopicForPage] = useState<string | null>(null);
  const [createTopicOpen, setCreateTopicOpen] = useState(false);
  const [createPageOpen, setCreatePageOpen] = useState(false);

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
      void addTopic({ name: newTopicName.trim() });
      setNewTopicName('');
      setCreateTopicOpen(false);
    }
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

  // Filter topics based on search (includes page name matching)
  const searchLower = searchQuery.toLowerCase();
  const filteredTopics = searchQuery
    ? topics.filter((topic) => {
        if (topic.name.toLowerCase().includes(searchLower)) return true;
        // Also match if any child page name matches
        return topicPages.some((p) => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower));
      })
    : topics;

  // Auto-expand topics that have matching pages
  useEffect(() => {
    if (!searchQuery) return;
    const toExpand = new Set(expandedTopics);
    topics.forEach((topic) => {
      const hasMatchingPage = topicPages.some(
        (p) => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower),
      );
      if (hasMatchingPage) toExpand.add(topic.id);
    });
    setExpandedTopics(toExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

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

          <Dialog open={createTopicOpen} onOpenChange={setCreateTopicOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Topic name (e.g., NUWAVE, Personal)"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
                  autoFocus
                />
                <Button onClick={handleCreateTopic} className="w-full">
                  Create Topic
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
          />
        </div>

        {/* Topic Tree */}
        <div className="widget-card">
          {filteredTopics.length > 0 ? (
            <div className="space-y-1">
              {filteredTopics.map((topic) => {
                const pages = topicPages.filter((p) => p.topicId === topic.id);
                const isExpanded = expandedTopics.has(topic.id);
                const captureCount = getJournalEntriesByTopic(topic.id).length + getCapturesByTopic(topic.id).length;
                const taskCount = getTasksByTopic(topic.id).length;

                return (
                  <div key={topic.id}>
                    {/* Topic row */}
                    <div className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50">
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
                          <DropdownMenuItem onClick={() => openCreatePageDialog(topic.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Page
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              navigate(`/topics/${topic.id}`);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (window.confirm(`Delete "${topic.name}" and all its pages? This cannot be undone.`)) {
                                void deleteTopic(topic.id);
                              }
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Topic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Nested pages */}
                    {isExpanded && pages.length > 0 && (
                      <div className="ml-6 space-y-1 border-l border-border pl-2">
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
              })}
            </div>
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
      </div>
    </AppLayout>
  );
};

export default Topics;
