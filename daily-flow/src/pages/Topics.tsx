import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { 
  FolderOpen, Plus, ChevronRight, ChevronDown, FileText,
  MoreHorizontal, Search, Trash2, Pencil
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const addTopic = useKaivooStore(s => s.addTopic);
  const addTopicPage = useKaivooStore(s => s.addTopicPage);
  const getJournalEntriesByTopic = useKaivooStore(s => s.getJournalEntriesByTopic);
  const getCapturesByTopic = useKaivooStore(s => s.getCapturesByTopic);
  const getTasksByTopic = useKaivooStore(s => s.getTasksByTopic);
  const { deleteTopic } = useKaivooActions();
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
      addTopic({ name: newTopicName.trim() });
      setNewTopicName('');
      setCreateTopicOpen(false);
    }
  };

  const handleCreatePage = () => {
    if (newPageName.trim() && selectedTopicForPage) {
      addTopicPage({ topicId: selectedTopicForPage, name: newPageName.trim() });
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
    ? topics.filter(topic => {
        if (topic.name.toLowerCase().includes(searchLower)) return true;
        // Also match if any child page name matches
        return topicPages.some(p => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower));
      })
    : topics;

  // Auto-expand topics that have matching pages
  useEffect(() => {
    if (!searchQuery) return;
    const toExpand = new Set(expandedTopics);
    topics.forEach(topic => {
      const hasMatchingPage = topicPages.some(
        p => p.topicId === topic.id && p.name.toLowerCase().includes(searchLower)
      );
      if (hasMatchingPage) toExpand.add(topic.id);
    });
    setExpandedTopics(toExpand);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-1">Topics</h1>
            <p className="text-sm text-muted-foreground">
              {topics.length} topic{topics.length !== 1 ? 's' : ''}, {topicPages.length} page{topicPages.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <Dialog open={createTopicOpen} onOpenChange={setCreateTopicOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                const pages = topicPages.filter(p => p.topicId === topic.id);
                const isExpanded = expandedTopics.has(topic.id);
                const captureCount = getJournalEntriesByTopic(topic.id).length + getCapturesByTopic(topic.id).length;
                const taskCount = getTasksByTopic(topic.id).length;

                return (
                  <div key={topic.id}>
                    {/* Topic row */}
                    <div className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-lg hover:bg-secondary/50 transition-colors group">
                      <button
                        onClick={() => toggleTopic(topic.id)}
                        className="p-0.5 hover:bg-secondary rounded"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      
                      {topic.icon ? (
                        <span className="text-base leading-none">{topic.icon}</span>
                      ) : (
                        <FolderOpen className="w-4 h-4 text-primary" />
                      )}

                      <button
                        onClick={() => navigate(`/topics/${topic.id}`)}
                        className="flex-1 text-left"
                      >
                        <span className="font-medium text-foreground">{topic.name}</span>
                        {topic.description && (
                          <span className="ml-2 text-xs text-muted-foreground truncate max-w-[200px] inline-block align-bottom">
                            {topic.description.length > 50 ? topic.description.slice(0, 50) + '...' : topic.description}
                          </span>
                        )}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {captureCount} capture{captureCount !== 1 ? 's' : ''} · {taskCount} task{taskCount !== 1 ? 's' : ''}
                        </span>
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openCreatePageDialog(topic.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Page
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigate(`/topics/${topic.id}`);
                          }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              void deleteTopic(topic.id);
                              toast.success(`Deleted topic "${topic.name}"`);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Topic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Nested pages */}
                    {isExpanded && pages.length > 0 && (
                      <div className="ml-6 border-l border-border pl-2 space-y-1">
                        {pages.map((page) => {
                          const pageCaptures = getJournalEntriesByTopic(page.id).length;
                          const pageTasks = getTasksByTopic(page.id).length;
                          
                          return (
                            <button
                              key={page.id}
                              onClick={() => navigate(`/topics/${topic.id}/pages/${page.id}`)}
                              className="flex items-center gap-2 py-2 px-2 w-full text-left rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              <FileText className="w-4 h-4 text-info-foreground" />
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
              <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No topics found' : 'No topics yet'}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
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
