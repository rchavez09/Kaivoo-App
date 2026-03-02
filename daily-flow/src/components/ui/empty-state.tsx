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

export function EmptyState({ icon: Icon, title, description, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-3 py-4' : 'px-4 py-8',
        className,
      )}
    >
      {Icon && (
        <div
          className={cn(
            'mb-3 flex items-center justify-center rounded-full bg-muted',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}
        >
          <Icon className={cn('text-muted-foreground', compact ? 'h-5 w-5' : 'h-6 w-6')} />
        </div>
      )}
      <h3 className={cn('font-medium text-foreground', compact ? 'text-sm' : 'text-base')}>{title}</h3>
      {description && (
        <p className={cn('mt-1 max-w-[240px] text-muted-foreground', compact ? 'text-xs' : 'text-sm')}>{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
