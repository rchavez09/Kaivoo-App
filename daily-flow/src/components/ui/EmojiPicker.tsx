import { ReactNode, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  fallback: ReactNode;
}

const EMOJI_CATEGORIES = [
  { label: 'Folders', emojis: ['📁', '📂', '📝', '📋', '📌', '🗂️'] },
  { label: 'Work', emojis: ['💼', '💰', '📊', '📈', '🏢'] },
  { label: 'Creative', emojis: ['🎨', '🎵', '🎬', '📸', '🎮'] },
  { label: 'Personal', emojis: ['🏠', '❤️', '🌟', '⭐', '🔥'] },
  { label: 'Nature', emojis: ['🌿', '🌊', '🌸', '🌈', '☀️'] },
  { label: 'Tech', emojis: ['💻', '🔧', '⚙️', '🔬', '🚀'] },
];

const EmojiPicker = ({ value, onChange, fallback }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  const handleRemove = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="-m-1 flex cursor-pointer items-center justify-center rounded-lg p-1 transition-colors hover:bg-secondary/50"
        >
          {value ? <span className="text-2xl leading-none">{value}</span> : fallback}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          {EMOJI_CATEGORIES.map((category) => (
            <div key={category.label}>
              <p className="mb-1 text-xs text-muted-foreground">{category.label}</p>
              <div className="flex flex-wrap gap-1">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelect(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-secondary"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full gap-1.5 text-xs text-muted-foreground"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
              Remove icon
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
