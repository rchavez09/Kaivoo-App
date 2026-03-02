import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ChevronLeft, FolderOpen, FileText, Plus, Briefcase, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import InlineEdit from '@/components/ui/InlineEdit';
import EmojiPicker from '@/components/ui/EmojiPicker';
import TopicCapturesWidget from '@/components/widgets/TopicCapturesWidget';
import TopicTasksWidget from '@/components/widgets/TopicTasksWidget';
import TopicTagsWidget from '@/components/widgets/TopicTagsWidget';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const TopicPage = () => {
  const { topicId, pageId } = useParams();
  const topics = useKaivooStore(s => s.topics);
  const topicPages = useKaivooStore(s => s.topicPages);
  const projects = useKaivooStore(s => s.projects);
  const getJournalEntriesByTopic = useKaivooStore(s => s.getJournalEntriesByTopic);
  const getCapturesByTopic = useKaivooStore(s => s.getCapturesByTopic);
  const getTasksByTopic = useKaivooStore(s => s.getTasksByTopic);
  const navigate = useNavigate();
  const { updateTopic, updateTopicPage, addTopicPage, deleteTopicPage } = useKaivooActions();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  // Get the current topic or page
  const topic = topics.find(t => t.id === topicId);
  const page = pageId ? topicPages.find(p => p.id === pageId) : null;

  // Get pages for this topic (sorted by most recent first)
  const pagesInTopic = topicPages
    .filter(p => p.topicId === topicId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Determine which ID to use for content lookup
  const contentId = pageId || topicId || '';
  const displayName = page?.name || topic?.name || 'Unknown';
  const isPage = !!page;

  const journalEntries = getJournalEntriesByTopic(contentId);
  const captures = getCapturesByTopic(contentId);
  const tasks = getTasksByTopic(contentId);

  // Collect all tags used in this topic/page
  const allTags = new Set<string>();
  journalEntries.forEach(e => e.tags.forEach(t => allTags.add(t)));
  captures.forEach(c => c.tags.forEach(t => allTags.add(t)));
  tasks.forEach(t => t.tags.forEach(tag => allTags.add(tag)));

  if (!topic && !page) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="widget-card text-center py-12">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Topic not found</h3>
            <Link to="/topics">
              <Button variant="outline">Back to Topics</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/topics" className="hover:text-foreground transition-colors">
              Topics
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
            {isPage && topic && (
              <>
                <Link
                  to={`/topics/${topic.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {topic.name}
                </Link>
                <ChevronLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
              </>
            )}
            <span className="text-foreground">{displayName}</span>
          </div>

          {/* Sibling page navigation */}
          {isPage && pagesInTopic.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
              {pagesInTopic.map((p) => (
                <Link
                  key={p.id}
                  to={`/topics/${topicId}/pages/${p.id}`}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors',
                    p.id === pageId
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {p.name}
                </Link>
              ))}
            </div>
          )}

          {/* Header with icon + inline editable name/description */}
          <div className="flex items-center gap-3">
            {isPage ? (
              <FileText className="w-6 h-6 text-info-foreground" />
            ) : (
              <EmojiPicker
                value={topic?.icon}
                onChange={(emoji) => topicId && void updateTopic(topicId, { icon: emoji })}
                fallback={<FolderOpen className="w-6 h-6 text-primary" />}
              />
            )}
            <div className="flex-1 min-w-0">
              <InlineEdit
                value={displayName}
                onSave={(name) => {
                  if (isPage && pageId) void updateTopicPage(pageId, { name });
                  else if (topicId) void updateTopic(topicId, { name });
                }}
                as="h1"
                className="text-2xl font-semibold text-foreground"
              />
              <InlineEdit
                value={page?.description || topic?.description || ''}
                onSave={(desc) => {
                  if (isPage && pageId) void updateTopicPage(pageId, { description: desc });
                  else if (topicId) void updateTopic(topicId, { description: desc });
                }}
                placeholder="Add a description..."
                className="text-sm text-muted-foreground"
              />
            </div>
            {isPage && pageId && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                  void deleteTopicPage(pageId);
                  toast.success(`Deleted page "${displayName}"`);
                  navigate(`/topics/${topicId}`);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Pages Section - show when viewing a topic (not a page) */}
        {!isPage && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Pages</h2>
              {pagesInTopic.length > 0 && (
                <span className="text-xs text-muted-foreground">{pagesInTopic.length} page{pagesInTopic.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-3">
                {pagesInTopic.map((p) => {
                  const pageEntries = getJournalEntriesByTopic(p.id);
                  const pageCaptures = getCapturesByTopic(p.id);
                  const pageTasks = getTasksByTopic(p.id);
                  const mentionCount = pageEntries.length + pageCaptures.length;
                  return (
                    <Link
                      key={p.id}
                      to={`/topics/${topicId}/pages/${p.id}`}
                      className="flex-shrink-0 group"
                    >
                      <div className="w-44 h-28 rounded-lg border border-border bg-card p-4 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-info-foreground flex-shrink-0" />
                          <span className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {p.name}
                          </span>
                        </div>
                        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{mentionCount} mention{mentionCount !== 1 ? 's' : ''}</span>
                          <span>{pageTasks.length} task{pageTasks.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
                {/* Create new page card */}
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    aria-label="Create new page"
                    className="w-44 h-28 rounded-lg border border-dashed border-border bg-muted/30 p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    onClick={() => setCreatePageOpen(true)}
                  >
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs">New Page</span>
                  </button>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* Projects Section - only on topic detail */}
        {!isPage && (() => {
          const topicProjects = projects.filter(p => p.topicId === topicId);
          return topicProjects.length > 0 ? (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Projects</h2>
                <span className="text-xs text-muted-foreground">{topicProjects.length} project{topicProjects.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-1">
                {topicProjects.map(project => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-info-foreground" />
                    <span className="text-sm font-medium text-foreground flex-1">{project.name}</span>
                    {project.status && (
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{project.status}</span>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Projects</h2>
              <p className="text-sm text-muted-foreground">No projects under this topic.</p>
            </section>
          );
        })()}

        {/* Tags Widget - moved to top when there are tags */}
        {allTags.size > 0 && (
          <div className="mb-4">
            <TopicTagsWidget
              tags={Array.from(allTags)}
              topicName={displayName}
              entries={journalEntries}
              captures={captures}
              tasks={tasks}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        )}

        {/* Widget Stack - consistent with Today page */}
        <div className="space-y-6">
          {/* Mentions Widget - Journal Entries + Captures */}
          <TopicCapturesWidget
            entries={journalEntries}
            captures={captures}
            topicName={displayName}
            selectedTag={selectedTag}
          />

          {/* Tasks Widget */}
          <TopicTasksWidget
            tasks={tasks}
            topicName={displayName}
            selectedTag={selectedTag}
            topicId={contentId}
          />
        </div>

        {/* Empty state guidance for topics */}
        {!isPage && pagesInTopic.length === 0 && journalEntries.length === 0 && captures.length === 0 && tasks.length === 0 && (
          <div className="widget-card py-12 text-center">
            <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">&ldquo;{displayName}&rdquo; has no content yet.</h3>
            <div className="text-sm text-muted-foreground space-y-1 max-w-sm mx-auto">
              <p>Here&apos;s how to add content to this topic:</p>
              <ul className="text-left space-y-1 mt-2">
                <li>Type <code className="bg-secondary px-1 py-0.5 rounded text-xs">[[{displayName}]]</code> in your journal to link entries here</li>
                <li>Create a task and assign it to this topic</li>
                <li>Add a page to organize sub-topics</li>
              </ul>
            </div>
          </div>
        )}

        {/* Empty state guidance for pages */}
        {isPage && journalEntries.length === 0 && captures.length === 0 && tasks.length === 0 && (
          <div className="widget-card py-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">&ldquo;{displayName}&rdquo; has no content yet.</h3>
            <p className="text-sm text-muted-foreground">
              Type <code className="bg-secondary px-1 py-0.5 rounded text-xs">[[{topic?.name}/{displayName}]]</code> in your journal to link entries here.
            </p>
          </div>
        )}

        {/* Create Page Dialog */}
        <Dialog open={createPageOpen} onOpenChange={setCreatePageOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Page name"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPageName.trim() && topicId) {
                    void addTopicPage({ topicId, name: newPageName.trim() });
                    setNewPageName('');
                    setCreatePageOpen(false);
                  }
                }}
                autoFocus
              />
              <Button
                onClick={() => {
                  if (newPageName.trim() && topicId) {
                    void addTopicPage({ topicId, name: newPageName.trim() });
                    setNewPageName('');
                    setCreatePageOpen(false);
                  }
                }}
                className="w-full"
              >
                Create Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default TopicPage;
