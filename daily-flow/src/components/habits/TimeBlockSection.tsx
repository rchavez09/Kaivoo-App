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
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
};

export default TimeBlockSection;
