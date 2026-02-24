import { useState, useRef, useEffect } from 'react';
import { Hash, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InlineTagInputProps {
  tags: string[];
  existingTags: Array<{ id: string; name: string }>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}

const InlineTagInput = ({ tags, existingTags, onAddTag, onRemoveTag }: InlineTagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedInput = inputValue.trim().toLowerCase().replace(/^#/, '');

  const suggestions = existingTags
    .filter(t => {
      const name = t.name.toLowerCase();
      return name.includes(normalizedInput) && !tags.includes(name);
    })
    .slice(0, 8);

  const showDropdown = isOpen && normalizedInput.length > 0 && suggestions.length > 0;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (name: string) => {
    const normalized = name.trim().toLowerCase().replace(/^#/, '');
    if (normalized && !tags.includes(normalized)) {
      onAddTag(normalized);
    }
    setInputValue('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showDropdown && suggestions[highlightedIndex]) {
        addTag(suggestions[highlightedIndex].name);
      } else if (normalizedInput) {
        addTag(normalizedInput);
      }
    } else if (e.key === 'ArrowDown' && showDropdown) {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp' && showDropdown) {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
          <Hash className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add tag..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-[80px]"
            aria-label="Add tag"
          />
        </div>

        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 top-full left-0 right-0 mt-1 border border-border rounded-md bg-popover shadow-md overflow-hidden"
          >
            {suggestions.map((tag, i) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => addTag(tag.name)}
                className={cn(
                  'w-full text-left px-3 py-1.5 text-sm transition-colors',
                  i === highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )}
              >
                <span className="text-muted-foreground mr-1">#</span>
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <Badge key={tag} variant="outline" className="gap-1 text-xs group">
              <Hash className="w-3 h-3" />
              {tag}
              <button
                onClick={() => onRemoveTag(tag)}
                className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineTagInput;
