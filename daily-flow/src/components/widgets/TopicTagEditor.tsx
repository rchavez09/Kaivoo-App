import { useState, useRef, useEffect, useMemo } from 'react';
import { FolderOpen, FileText, Hash, Plus, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { cn } from '@/lib/utils';

interface TopicTagEditorProps {
  topicPath: string | null;
  tags: string[];
  isNewTopic?: boolean;
  suggestedNewTopics?: string[];
  suggestedNewTags?: string[];
  onTopicChange: (topicPath: string | null, isNew: boolean) => void;
  onTagsChange: (tags: string[], hasNew: boolean) => void;
}

export function TopicTagEditor({
  topicPath,
  tags,
  isNewTopic,
  suggestedNewTopics = [],
  suggestedNewTags = [],
  onTopicChange,
  onTagsChange,
}: TopicTagEditorProps) {
  const topics = useKaivooStore(s => s.topics);
  const getTopicPages = useKaivooStore(s => s.getTopicPages);
  const storeTags = useKaivooStore(s => s.tags);
  const tasks = useKaivooStore(s => s.tasks);
  const [topicOpen, setTopicOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  // Get unique existing tags - memoized to prevent infinite loops
  const existingTags = useMemo(() => {
    const tagSet = new Set<string>();
    storeTags.forEach(t => tagSet.add(t.name.toLowerCase()));
    tasks.forEach(t => t.tags?.forEach(tag => tagSet.add(tag.toLowerCase())));
    return Array.from(tagSet).sort();
  }, [storeTags, tasks]);

  const handleSelectTopic = (path: string, isNew: boolean) => {
    onTopicChange(`[[${path}]]`, isNew);
    setTopicOpen(false);
  };

  const handleCreateNewTopic = () => {
    if (newTopicName.trim()) {
      onTopicChange(`[[${newTopicName.trim()}]]`, true);
      setNewTopicName('');
      setTopicOpen(false);
    }
  };

  const handleAddTag = (tagName: string, isNew: boolean) => {
    const normalized = tagName.toLowerCase().replace(/^#/, '');
    if (normalized && !tags.map(t => t.replace(/^#/, '').toLowerCase()).includes(normalized)) {
      const newTags = [...tags, `#${normalized}`];
      onTagsChange(newTags, isNew || tags.some(t => !existingTags.includes(t.replace(/^#/, '').toLowerCase())));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    onTagsChange(newTags, newTags.some(t => !existingTags.includes(t.replace(/^#/, '').toLowerCase())));
  };

  const handleCreateNewTag = () => {
    if (newTagName.trim()) {
      handleAddTag(newTagName.trim(), true);
      setNewTagName('');
    }
  };

  // Filter out already used tags
  const availableTags = existingTags.filter(
    t => !tags.map(tag => tag.replace(/^#/, '').toLowerCase()).includes(t)
  );

  // Combine suggested new tags that aren't already added
  const availableSuggestedTags = suggestedNewTags.filter(
    t => !tags.map(tag => tag.replace(/^#/, '').toLowerCase()).includes(t.replace(/^#/, '').toLowerCase())
  );

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {/* Topic Picker */}
      <Popover open={topicOpen} onOpenChange={setTopicOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex">
            <Badge 
              variant={topicPath ? "outline" : "secondary"}
              className={cn(
                "text-xs font-mono cursor-pointer hover:bg-muted gap-1",
                topicPath && "border-primary/40"
              )}
            >
              {topicPath ? (
                <>
                  <FolderOpen className="h-3 w-3" />
                  {topicPath.replace(/^\[\[|\]\]$/g, '')}
                  {isNewTopic && <span className="text-primary font-medium">[NEW]</span>}
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  Add topic
                </>
              )}
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Select or create topic:</p>
            
            {/* Suggested new topics from AI */}
            {suggestedNewTopics.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">AI Suggested</p>
                {suggestedNewTopics.map((topic) => (
                  <Button
                    key={`new-${topic}`}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7 text-primary"
                    onClick={() => handleSelectTopic(topic, true)}
                  >
                    <Plus className="h-3 w-3 mr-1.5" />
                    {topic}
                    <Badge variant="outline" className="ml-auto text-[10px] px-1">NEW</Badge>
                  </Button>
                ))}
              </div>
            )}

            {/* Existing topics */}
            <div className="space-y-1 max-h-[200px] overflow-y-auto">
              {topicPath && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-7 text-muted-foreground"
                  onClick={() => {
                    onTopicChange(null, false);
                    setTopicOpen(false);
                  }}
                >
                  <X className="h-3 w-3 mr-1.5" />
                  Remove topic
                </Button>
              )}
              
              {topics.map((topic) => {
                const pages = getTopicPages(topic.id);
                const isExpanded = expandedTopic === topic.id;
                
                return (
                  <div key={topic.id}>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 justify-start text-xs h-7"
                        onClick={() => handleSelectTopic(topic.name, false)}
                      >
                        <FolderOpen className="h-3 w-3 mr-1.5 text-primary" />
                        {topic.name}
                      </Button>
                      {pages.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          aria-label={isExpanded ? `Collapse ${topic.name} pages` : `Expand ${topic.name} pages`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTopic(isExpanded ? null : topic.id);
                          }}
                        >
                          <span className={cn(
                            "text-[10px] text-muted-foreground transition-transform",
                            isExpanded && "rotate-90"
                          )}>▶</span>
                        </Button>
                      )}
                    </div>
                    
                    {isExpanded && pages.length > 0 && (
                      <div className="ml-4 pl-2 border-l border-border/50 space-y-0.5">
                        {pages.map((page) => (
                          <Button
                            key={page.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs h-6"
                            onClick={() => handleSelectTopic(`${topic.name}/${page.name}`, false)}
                          >
                            <FileText className="h-3 w-3 mr-1.5 text-info" />
                            {page.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Create new topic */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex gap-1">
                <Input
                  placeholder="New topic name..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateNewTopic();
                  }}
                  className="h-7 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={handleCreateNewTopic}
                  disabled={!newTopicName.trim()}
                  aria-label="Create new topic"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Existing tags */}
      {tags.map((tag) => {
        const tagName = tag.replace(/^#/, '');
        const isNew = !existingTags.includes(tagName.toLowerCase());
        return (
          <Badge 
            key={tag} 
            variant="secondary" 
            className={cn(
              "text-xs gap-1 group",
              isNew && "border-primary/40 border"
            )}
          >
            <Hash className="h-3 w-3" />
            {tagName}
            {isNew && <span className="text-primary font-medium">[NEW]</span>}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-0.5 opacity-50 hover:opacity-100 group-hover:opacity-100"
              aria-label={`Remove ${tagName} tag`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {/* Add Tag Button */}
      <Popover open={tagOpen} onOpenChange={setTagOpen}>
        <PopoverTrigger asChild>
          <button type="button" className="inline-flex">
            <Badge 
              variant="outline"
              className="text-xs cursor-pointer hover:bg-muted gap-1 border-dashed"
            >
              <Hash className="h-3 w-3" />
              <Plus className="h-3 w-3" />
            </Badge>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Add tags:</p>
            
            {/* AI Suggested new tags */}
            {availableSuggestedTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">AI Suggested</p>
                {availableSuggestedTags.map((tag) => (
                  <Button
                    key={`new-${tag}`}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7 text-primary"
                    onClick={() => {
                      handleAddTag(tag, true);
                      setTagOpen(false);
                    }}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag.replace(/^#/, '')}
                    <Badge variant="outline" className="ml-auto text-[10px] px-1">NEW</Badge>
                  </Button>
                ))}
              </div>
            )}

            {/* Existing tags */}
            {availableTags.length > 0 && (
              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                {availableTags.slice(0, 10).map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => {
                      handleAddTag(tag, false);
                      setTagOpen(false);
                    }}
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            )}

            {/* Create new tag */}
            <div className="pt-2 border-t border-border/50">
              <div className="flex gap-1">
                <Input
                  placeholder="New tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewTag();
                      setTagOpen(false);
                    }
                  }}
                  className="h-7 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    handleCreateNewTag();
                    setTagOpen(false);
                  }}
                  disabled={!newTagName.trim()}
                  aria-label="Create new tag"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
