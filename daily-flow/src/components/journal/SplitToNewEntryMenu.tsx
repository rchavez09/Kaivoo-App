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
      className="h-7 gap-1.5 border border-border/50 text-xs shadow-md"
      onClick={onSplit}
      disabled={disabled}
    >
      <Scissors className="h-3 w-3" />
      Split to New Entry
    </Button>
  );
};

export default SplitToNewEntryMenu;
