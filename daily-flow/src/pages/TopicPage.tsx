import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { ChevronLeft, FolderOpen, FileText, Settings2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useKaivooStore } from '@/stores/useKaivooStore';
import TopicCapturesWidget from '@/components/widgets/TopicCapturesWidget';
import TopicTasksWidget from '@/components/widgets/TopicTasksWidget';
import TopicTagsWidget from '@/components/widgets/TopicTagsWidget';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const TopicPage = () => {
  const { topicId, pageId } = useParams();
  const { topics, topicPages, getJournalEntriesByTopic, getCapturesByTopic, getTasksByTopic } = useKaivooStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
        {/* Breadcrumb + Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/topics" className="hover:text-foreground transition-colors">
              Topics
            </Link>
            <ChevronLeft className="w-4 h-4 rotate-180" />
            {isPage && topic && (
              <>
                <Link 
                  to={`/topics/${topic.id}`} 
                  className="hover:text-foreground transition-colors"
                >
                  {topic.name}
                </Link>
                <ChevronLeft className="w-4 h-4 rotate-180" />
              </>
            )}
            <span className="text-foreground">{displayName}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPage ? (
                <FileText className="w-6 h-6 text-info" />
              ) : (
                <FolderOpen className="w-6 h-6 text-primary" />
              )}
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{displayName}</h1>
                {(topic?.description || page?.description) && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {page?.description || topic?.description}
                  </p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2 className="w-4 h-4" />
              Configure
            </Button>
          </div>
        </header>

        {/* Pages Section - only show when viewing a topic (not a page) */}
        {!isPage && pagesInTopic.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Pages</h2>
              <span className="text-xs text-muted-foreground">{pagesInTopic.length} page{pagesInTopic.length !== 1 ? 's' : ''}</span>
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
                          <FileText className="w-4 h-4 text-info flex-shrink-0" />
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
                  <div className="w-44 h-28 rounded-lg border border-dashed border-border bg-muted/30 p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer">
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs">New Page</span>
                  </div>
                </div>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

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
        <div className="space-y-4">
          {/* Mentions Widget - Journal Entries + Captures */}
          <TopicCapturesWidget 
            entries={journalEntries} 
            captures={captures} 
            topicName={displayName}
            selectedTag={selectedTag}
          />

          {/* Tasks Widget */}
          <TopicTasksWidget tasks={tasks} topicName={displayName} />
        </div>
      </div>
    </AppLayout>
  );
};

export default TopicPage;
