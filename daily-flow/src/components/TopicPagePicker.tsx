import { useState, useRef, useEffect } from 'react';
import { FolderOpen, FileText, ChevronRight, Plus } from 'lucide-react';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { cn } from '@/lib/utils';

interface TopicPagePickerProps {
  onSelect: (path: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

const TopicPagePicker = ({ onSelect, onClose, position }: TopicPagePickerProps) => {
  const topics = useKaivooStore((s) => s.topics);
  const getTopicPages = useKaivooStore((s) => s.getTopicPages);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [creatingPageFor, setCreatingPageFor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelectTopic = (topicName: string) => {
    onSelect(topicName);
  };

  const handleSelectPage = (topicName: string, pageName: string) => {
    onSelect(`${topicName}/${pageName}`);
  };

  const handleCreatePage = (topicId: string, topicName: string) => {
    if (newPageName.trim()) {
      onSelect(`${topicName}/${newPageName.trim()}`);
      setNewPageName('');
      setCreatingPageFor(null);
    }
  };

  // Filter out Daily Notes from the picker
  const selectableTopics = topics.filter((t) => t.id !== 'topic-daily-notes');

  return (
    <div
      ref={containerRef}
      className="absolute z-50 max-h-[300px] min-w-[220px] animate-fade-in overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
      style={position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="p-1">
        {selectableTopics.map((topic) => {
          const pages = getTopicPages(topic.id);
          const isExpanded = expandedTopic === topic.id;

          return (
            <div key={topic.id}>
              <div className="flex items-center">
                <button
                  onClick={() => handleSelectTopic(topic.name)}
                  className="flex flex-1 items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/70"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-primary" />
                  <span>{topic.name}</span>
                </button>
                {pages.length > 0 && (
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                    className="rounded p-1.5 transition-colors hover:bg-secondary"
                  >
                    <ChevronRight
                      className={cn('h-3 w-3 text-muted-foreground transition-transform', isExpanded && 'rotate-90')}
                    />
                  </button>
                )}
                <button
                  onClick={() => {
                    setExpandedTopic(topic.id);
                    setCreatingPageFor(topic.id);
                  }}
                  className="rounded p-1.5 transition-colors hover:bg-secondary"
                  title="Add page"
                >
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>

              {/* Nested pages */}
              {isExpanded && (
                <div className="ml-4 border-l border-border pl-1">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => handleSelectPage(topic.name, page.name)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary/70"
                    >
                      <FileText className="h-3.5 w-3.5 text-info-foreground" />
                      <span>{page.name}</span>
                    </button>
                  ))}

                  {/* Create new page input */}
                  {creatingPageFor === topic.id && (
                    <div className="flex items-center gap-1 px-2 py-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="New page name..."
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreatePage(topic.id, topic.name);
                          if (e.key === 'Escape') {
                            setCreatingPageFor(null);
                            setNewPageName('');
                          }
                        }}
                        className="flex-1 border-none bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {selectableTopics.length === 0 && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No topics yet. Type a name to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicPagePicker;
