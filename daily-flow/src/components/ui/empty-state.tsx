import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className,
  compact = false 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-4 px-3" : "py-8 px-4",
      className
    )}>
      {Icon && (
        <div className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-3",
          compact ? "w-10 h-10" : "w-12 h-12"
        )}>
          <Icon className={cn(
            "text-muted-foreground",
            compact ? "w-5 h-5" : "w-6 h-6"
          )} />
        </div>
      )}
      <h3 className={cn(
        "font-medium text-foreground",
        compact ? "text-sm" : "text-base"
      )}>
        {title}
      </h3>
      {description && (
        <p className={cn(
          "text-muted-foreground mt-1 max-w-[240px]",
          compact ? "text-xs" : "text-sm"
        )}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-3">
          {action}
        </div>
      )}
    </div>
  );
}
