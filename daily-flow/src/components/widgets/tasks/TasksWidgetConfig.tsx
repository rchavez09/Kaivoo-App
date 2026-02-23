import { useState, useCallback, useMemo } from 'react';
import { Settings, GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Plus, Trash2, Clock, Pause, Archive, Flag, AlertTriangle, Calendar, CheckSquare, Folder, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Topic, Tag } from '@/types';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';

// Built-in section types
export type BuiltInSectionId = 'overdue' | 'highPriority' | 'mediumPriority' | 'lowPriority' | 'dueToday' | 'dueThisWeek' | 'doing' | 'blocked' | 'backlog';

// Section can be built-in, topic-based, or tag-based
export type SectionId = BuiltInSectionId | `topic:${string}` | `tag:${string}`;

export interface TasksWidgetSection {
  id: SectionId;
  label: string;
  visible: boolean;
  order: number;
  type: 'builtin' | 'topic' | 'tag';
  topicId?: string; // For topic sections
  tagName?: string; // For tag sections
}

export interface TasksWidgetSettings {
  sections: TasksWidgetSection[];
  hideEmptySections: boolean;
  showCompletedTasks: boolean;
  collapseCompletedByDefault: boolean;
  collapseSectionsByDefault: boolean;
  // Custom task ordering per section (sectionId -> ordered task IDs)
  taskOrder?: Partial<Record<SectionId, string[]>>;
}

// All available built-in sections
export const AVAILABLE_BUILTIN_SECTIONS: { id: BuiltInSectionId; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'dueToday', label: 'Due Today', icon: <CheckSquare className="w-4 h-4" />, description: 'Tasks due today' },
  { id: 'overdue', label: 'Overdue', icon: <AlertTriangle className="w-4 h-4" />, description: 'Past due tasks' },
  { id: 'highPriority', label: 'High Priority', icon: <Flag className="w-4 h-4" />, description: 'High priority tasks' },
  { id: 'mediumPriority', label: 'Medium Priority', icon: <Flag className="w-4 h-4" />, description: 'Medium priority tasks' },
  { id: 'lowPriority', label: 'Low Priority', icon: <Flag className="w-4 h-4" />, description: 'Low priority tasks' },
  { id: 'dueThisWeek', label: 'Due This Week', icon: <Calendar className="w-4 h-4" />, description: 'Tasks due within 7 days' },
  { id: 'doing', label: 'Doing', icon: <Clock className="w-4 h-4" />, description: 'Tasks in progress' },
  { id: 'blocked', label: 'Blocked', icon: <Pause className="w-4 h-4" />, description: 'Blocked tasks' },
  { id: 'backlog', label: 'Backlog', icon: <Archive className="w-4 h-4" />, description: 'Backlog tasks' },
];

const DEFAULT_SECTIONS: TasksWidgetSection[] = [
  { id: 'dueToday', label: 'Due Today', visible: true, order: 0, type: 'builtin' },
  { id: 'overdue', label: 'Overdue', visible: true, order: 1, type: 'builtin' },
  { id: 'highPriority', label: 'High Priority', visible: true, order: 2, type: 'builtin' },
  { id: 'dueThisWeek', label: 'Due This Week', visible: true, order: 3, type: 'builtin' },
];

export const DEFAULT_SETTINGS: TasksWidgetSettings = {
  sections: DEFAULT_SECTIONS,
  hideEmptySections: false,
  showCompletedTasks: true,
  collapseCompletedByDefault: false,
  collapseSectionsByDefault: true,
};

const WIDGET_KEY = 'tasks-widget';

export function useTasksWidgetSettings() {
  const {
    settings: raw,
    loading,
    updateSettings: patchSettings,
    replaceSettings,
  } = useWidgetSettings<TasksWidgetSettings>(WIDGET_KEY, DEFAULT_SETTINGS);

  // Ensure sections array is present (fallback for first-time or corrupted data)
  const settings: TasksWidgetSettings = useMemo(
    () => ({
      ...DEFAULT_SETTINGS,
      ...raw,
      sections: raw.sections?.length ? raw.sections : DEFAULT_SECTIONS,
    }),
    [raw]
  );

  const updateSettings = useCallback(
    (partial: Partial<TasksWidgetSettings>) => {
      patchSettings(partial);
    },
    [patchSettings]
  );

  const updateSection = useCallback(
    (id: SectionId, updates: Partial<TasksWidgetSection>) => {
      const newSections = settings.sections.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      patchSettings({ sections: newSections });
    },
    [settings.sections, patchSettings]
  );

  const addSection = useCallback(
    (section: TasksWidgetSection) => {
      if (settings.sections.some((s) => s.id === section.id)) return;
      const maxOrder = Math.max(...settings.sections.map((s) => s.order), -1);
      patchSettings({
        sections: [...settings.sections, { ...section, order: maxOrder + 1 }],
      });
    },
    [settings.sections, patchSettings]
  );

  const removeSection = useCallback(
    (id: SectionId) => {
      patchSettings({
        sections: settings.sections
          .filter((s) => s.id !== id)
          .map((s, i) => ({ ...s, order: i })),
      });
    },
    [settings.sections, patchSettings]
  );

  const reorderSections = useCallback(
    (fromIndex: number, toIndex: number) => {
      const sorted = [...settings.sections].sort((a, b) => a.order - b.order);
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      patchSettings({
        sections: sorted.map((s, i) => ({ ...s, order: i })),
      });
    },
    [settings.sections, patchSettings]
  );

  const setTaskOrderForSection = useCallback(
    (sectionId: SectionId, taskIds: string[]) => {
      patchSettings({
        taskOrder: {
          ...settings.taskOrder,
          [sectionId]: taskIds,
        },
      });
    },
    [settings.taskOrder, patchSettings]
  );

  return {
    settings,
    loading,
    updateSettings,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    setTaskOrderForSection,
  };
}

interface TasksWidgetConfigDialogProps {
  settings: TasksWidgetSettings;
  topics: Topic[];
  tags: Tag[];
  onUpdateSettings: (settings: Partial<TasksWidgetSettings>) => void;
  onUpdateSection: (id: SectionId, updates: Partial<TasksWidgetSection>) => void;
  onAddSection: (section: TasksWidgetSection) => void;
  onRemoveSection: (id: SectionId) => void;
  onReorderSections: (fromIndex: number, toIndex: number) => void;
}

export function TasksWidgetConfigDialog({
  settings,
  topics,
  tags,
  onUpdateSettings,
  onUpdateSection,
  onAddSection,
  onRemoveSection,
  onReorderSections,
}: TasksWidgetConfigDialogProps) {
  const [open, setOpen] = useState(false);
  const [addType, setAddType] = useState<'builtin' | 'topic' | 'tag'>('builtin');
  const [selectedBuiltin, setSelectedBuiltin] = useState<BuiltInSectionId | ''>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('');

  const sortedSections = [...settings.sections].sort((a, b) => a.order - b.order);

  // Get available built-in sections (not already added)
  const existingSectionIds = new Set(settings.sections.map(s => s.id));
  const availableBuiltins = AVAILABLE_BUILTIN_SECTIONS.filter(s => !existingSectionIds.has(s.id));

  // Get available topics (not already added)
  const availableTopics = topics.filter(t => !existingSectionIds.has(`topic:${t.id}`));

  // Get available tags (not already added)
  const availableTags = tags.filter(t => !existingSectionIds.has(`tag:${t.name}`));

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < sortedSections.length) {
      onReorderSections(index, newIndex);
    }
  };

  const handleAddSection = () => {
    if (addType === 'builtin' && selectedBuiltin) {
      const builtinInfo = AVAILABLE_BUILTIN_SECTIONS.find(s => s.id === selectedBuiltin);
      if (builtinInfo) {
        onAddSection({
          id: selectedBuiltin,
          label: builtinInfo.label,
          visible: true,
          order: 0,
          type: 'builtin',
        });
        setSelectedBuiltin('');
      }
    } else if (addType === 'topic' && selectedTopic) {
      const topic = topics.find(t => t.id === selectedTopic);
      if (topic) {
        onAddSection({
          id: `topic:${topic.id}`,
          label: topic.name,
          visible: true,
          order: 0,
          type: 'topic',
          topicId: topic.id,
        });
        setSelectedTopic('');
      }
    } else if (addType === 'tag' && selectedTag) {
      const tag = tags.find(t => t.name === selectedTag);
      if (tag) {
        onAddSection({
          id: `tag:${tag.name}`,
          label: `#${tag.name}`,
          visible: true,
          order: 0,
          type: 'tag',
          tagName: tag.name,
        });
        setSelectedTag('');
      }
    }
  };

  const getSectionIcon = (section: TasksWidgetSection) => {
    if (section.type === 'topic') {
      return <Folder className="w-4 h-4 text-accent" />;
    }
    if (section.type === 'tag') {
      return <Hash className="w-4 h-4 text-info" />;
    }
    const builtin = AVAILABLE_BUILTIN_SECTIONS.find(s => s.id === section.id);
    return builtin?.icon || <CheckSquare className="w-4 h-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground h-8 px-2"
          title="Customize Tasks Widget"
          aria-label="Customize Tasks Widget"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Customize Tasks Widget</DialogTitle>
          <DialogDescription>
            Add sections for statuses, priorities, or topics. Reorder and configure display options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto flex-1 min-h-0 pr-2">
          {/* Add new section */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
            <Label className="text-sm font-medium">Add Section</Label>
            <div className="flex gap-2">
              <Select value={addType} onValueChange={(v) => setAddType(v as 'builtin' | 'topic' | 'tag')}>
                <SelectTrigger className="w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="builtin">Filter</SelectItem>
                  <SelectItem value="topic">Topic</SelectItem>
                  <SelectItem value="tag">Tag</SelectItem>
                </SelectContent>
              </Select>

              {addType === 'builtin' ? (
                <Select value={selectedBuiltin} onValueChange={(v) => setSelectedBuiltin(v as BuiltInSectionId)}>
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder={availableBuiltins.length === 0 ? "All filters added" : "Select a filter..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBuiltins.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          {s.icon}
                          {s.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : addType === 'topic' ? (
                <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder={availableTopics.length === 0 ? "No topics available" : "Select a topic..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        <span className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder={availableTags.length === 0 ? "No tags available" : "Select a tag..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(t => (
                      <SelectItem key={t.name} value={t.name}>
                        <span className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          #{t.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                size="sm"
                className="h-9 px-3"
                onClick={handleAddSection}
                disabled={(addType === 'builtin' && !selectedBuiltin) || (addType === 'topic' && !selectedTopic) || (addType === 'tag' && !selectedTag)}
                aria-label="Add section"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Sections */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Active Sections</Label>
            <div className="space-y-2">
              {sortedSections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No sections configured</p>
              ) : (
                sortedSections.map((section, index) => (
                  <div
                    key={section.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                      section.visible ? "bg-secondary/30 border-border" : "bg-muted/30 border-transparent"
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getSectionIcon(section)}
                      <span className={cn(
                        "text-sm truncate",
                        !section.visible && "text-muted-foreground"
                      )}>
                        {section.label}
                      </span>
                      {section.type === 'topic' && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          Topic
                        </span>
                      )}
                      {section.type === 'tag' && (
                        <span className="text-[10px] uppercase tracking-wider text-info bg-info/10 px-1.5 py-0.5 rounded">
                          Tag
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        aria-label={`Move ${section.label} up`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sortedSections.length - 1}
                        aria-label={`Move ${section.label} down`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => onUpdateSection(section.id, { visible: !section.visible })}
                        aria-label={section.visible ? `Hide ${section.label}` : `Show ${section.label}`}
                      >
                        {section.visible ? (
                          <Eye className="w-4 h-4 text-primary" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSection(section.id)}
                        aria-label={`Remove ${section.label} section`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Hide empty sections</Label>
                <p className="text-xs text-muted-foreground">
                  Hide sections when they have no tasks
                </p>
              </div>
              <Switch
                checked={settings.hideEmptySections}
                onCheckedChange={(checked) => onUpdateSettings({ hideEmptySections: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Show completed tasks</Label>
                <p className="text-xs text-muted-foreground">
                  Keep completed tasks visible in their sections
                </p>
              </div>
              <Switch
                checked={settings.showCompletedTasks}
                onCheckedChange={(checked) => onUpdateSettings({ showCompletedTasks: checked })}
              />
            </div>

            {settings.showCompletedTasks && (
              <div className="flex items-center justify-between pl-4 border-l-2 border-border">
                <div className="space-y-0.5">
                  <Label className="text-sm">Collapse completed by default</Label>
                  <p className="text-xs text-muted-foreground">
                    Hide completed tasks until you expand
                  </p>
                </div>
                <Switch
                  checked={settings.collapseCompletedByDefault}
                  onCheckedChange={(checked) => onUpdateSettings({ collapseCompletedByDefault: checked })}
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Collapse sections by default</Label>
                <p className="text-xs text-muted-foreground">
                  Start with all sections collapsed
                </p>
              </div>
              <Switch
                checked={settings.collapseSectionsByDefault}
                onCheckedChange={(checked) => onUpdateSettings({ collapseSectionsByDefault: checked })}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
