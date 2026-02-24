import { Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SplitToNewEntryMenuProps {
  onSplit: () => void;
  disabled?: boolean;
}

const SplitToNewEntryMenu = ({ onSplit, disabled }: SplitToNewEntryMenuProps) => {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="h-7 text-xs gap-1.5 shadow-md border border-border/50"
      onClick={onSplit}
      disabled={disabled}
    >
      <Scissors className="w-3 h-3" />
      Split to New Entry
    </Button>
  );
};

export default SplitToNewEntryMenu;
