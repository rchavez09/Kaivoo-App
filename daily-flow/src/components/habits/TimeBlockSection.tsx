import { Sun, Cloud, Moon, Clock } from 'lucide-react';
import { TimeBlock } from '@/types';

const BLOCK_CONFIG: Record<TimeBlock, { label: string; Icon: typeof Sun }> = {
  morning: { label: 'Morning', Icon: Sun },
  afternoon: { label: 'Afternoon', Icon: Cloud },
  evening: { label: 'Evening', Icon: Moon },
  anytime: { label: 'Anytime', Icon: Clock },
};

interface TimeBlockSectionProps {
  timeBlock: TimeBlock;
  children: React.ReactNode;
}

const TimeBlockSection = ({ timeBlock, children }: TimeBlockSectionProps) => {
  const { label, Icon } = BLOCK_CONFIG[timeBlock];

  return (
    <div role="group" aria-label={`${label} habits`}>
      <div className="flex items-center gap-3 py-3">
        <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-1 h-px bg-border/50" />
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

export default TimeBlockSection;
