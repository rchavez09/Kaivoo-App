import { useState } from 'react';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, X, LayoutGrid, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  visible: boolean;
  order: number;
  column?: 'left' | 'right' | 'full';
}

interface SortableWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  onRemove: (id: string) => void;
  isEditing: boolean;
}

const SortableWidget = ({ widget, children, onRemove, isEditing }: SortableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'z-50 opacity-80'
      )}
    >
      {isEditing && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          <Button
            variant="destructive"
            size="icon"
            aria-label="Remove widget"
            className="h-6 w-6 rounded-full shadow-md"
            onClick={() => onRemove(widget.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 cursor-grab active:cursor-grabbing bg-muted rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className={cn('relative rounded-2xl', isEditing && 'ring-2 ring-primary/20')}>
        <GlowingEffect
          spread={40}
          glow={false}
          disabled={false}
          proximity={64}
          inactiveZone={0.1}
          borderWidth={2}
        />
        {children}
      </div>
    </div>
  );
};

interface WidgetPickerProps {
  availableWidgets: { type: string; title: string }[];
  activeWidgets: WidgetConfig[];
  onAdd: (type: string) => void;
}

const WidgetPicker = ({ availableWidgets, activeWidgets, onAdd }: WidgetPickerProps) => {
  const activeTypes = activeWidgets.filter(w => w.visible).map(w => w.type);
  const inactiveWidgets = availableWidgets.filter(w => !activeTypes.includes(w.type));

  if (inactiveWidgets.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 text-center">
        All widgets are active
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      <p className="text-xs text-muted-foreground px-2 pb-2">Add widget</p>
      {inactiveWidgets.map(widget => (
        <Button
          key={widget.type}
          variant="ghost"
          className="w-full justify-start text-sm"
          onClick={() => onAdd(widget.type)}
        >
          <Plus className="h-4 w-4 mr-2" />
          {widget.title}
        </Button>
      ))}
    </div>
  );
};

interface WidgetContainerProps {
  widgets: WidgetConfig[];
  onWidgetsChange: (widgets: WidgetConfig[]) => void;
  availableWidgets: { type: string; title: string }[];
  renderWidget: (widget: WidgetConfig) => React.ReactNode;
  layout: 'vertical' | 'horizontal';
  onLayoutChange: (layout: 'vertical' | 'horizontal') => void;
  customAddAction?: React.ReactNode;
}

const WidgetContainer = ({
  widgets,
  onWidgetsChange,
  availableWidgets,
  renderWidget,
  layout,
  onLayoutChange,
  customAddAction,
}: WidgetContainerProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const visibleWidgets = widgets
    .filter(w => w.visible)
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = visibleWidgets.findIndex(w => w.id === active.id);
      const newIndex = visibleWidgets.findIndex(w => w.id === over.id);
      
      const reordered = arrayMove(visibleWidgets, oldIndex, newIndex);
      
      // Update order values
      const updatedWidgets = widgets.map(w => {
        const newPos = reordered.findIndex(r => r.id === w.id);
        if (newPos !== -1) {
          return { ...w, order: newPos };
        }
        return w;
      });
      
      onWidgetsChange(updatedWidgets);
    }
  };

  const handleAddWidget = (type: string) => {
    const widgetDef = availableWidgets.find(w => w.type === type);
    if (!widgetDef) return;

    const existingWidget = widgets.find(w => w.type === type);
    if (existingWidget) {
      // Just make it visible
      onWidgetsChange(
        widgets.map(w => w.id === existingWidget.id ? { ...w, visible: true } : w)
      );
    } else {
      // Add new widget
      const maxOrder = Math.max(...widgets.map(w => w.order), -1);
      const newWidget: WidgetConfig = {
        id: `widget-${type}-${Date.now()}`,
        type,
        title: widgetDef.title,
        visible: true,
        order: maxOrder + 1,
        column: 'full',
      };
      onWidgetsChange([...widgets, newWidget]);
    }
    setPickerOpen(false);
  };

  const handleRemoveWidget = (id: string) => {
    onWidgetsChange(
      widgets.map(w => w.id === id ? { ...w, visible: false } : w)
    );
  };

  // Split widgets into columns for horizontal layout
  const leftWidgets = visibleWidgets.filter((_, i) => i % 2 === 0);
  const rightWidgets = visibleWidgets.filter((_, i) => i % 2 === 1);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-end gap-2">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={layout === 'vertical' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onLayoutChange('vertical')}
            title="Stack vertically"
            aria-label="Stack vertically"
          >
            <Rows3 className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'horizontal' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => onLayoutChange('horizontal')}
            title="Split horizontally"
            aria-label="Split horizontally"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
        
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <WidgetPicker
              availableWidgets={availableWidgets.filter(w => w.type !== 'new-routine-group')}
              activeWidgets={widgets}
              onAdd={handleAddWidget}
            />
            {customAddAction && (
              <div className="border-t p-2">
                {customAddAction}
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      {/* Widget Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {layout === 'vertical' ? (
          <SortableContext
            items={visibleWidgets.map(w => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {visibleWidgets.map(widget => (
                <SortableWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={handleRemoveWidget}
                  isEditing={isEditing}
                >
                  {renderWidget(widget)}
                </SortableWidget>
              ))}
            </div>
          </SortableContext>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SortableContext
              items={leftWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {leftWidgets.map(widget => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={handleRemoveWidget}
                    isEditing={isEditing}
                  >
                    {renderWidget(widget)}
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
            <SortableContext
              items={rightWidgets.map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {rightWidgets.map(widget => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    onRemove={handleRemoveWidget}
                    isEditing={isEditing}
                  >
                    {renderWidget(widget)}
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </div>
        )}
      </DndContext>

      {visibleWidgets.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">
          <p>No widgets visible. Click "Add" to add widgets.</p>
        </Card>
      )}
    </div>
  );
};

export default WidgetContainer;
