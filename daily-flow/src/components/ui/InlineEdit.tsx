import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  as?: 'h1' | 'p';
}

const InlineEdit = ({ value, onSave, placeholder, className, as = 'p' }: InlineEditProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed) {
      onSave(trimmed);
    } else {
      setDraft(value);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleClick = () => {
    if (as !== 'h1') setEditing(true);
  };

  const handleDoubleClick = () => {
    if (as === 'h1') setEditing(true);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        onBlur={save}
        className={cn('w-full border-b border-primary/50 bg-transparent outline-none', className)}
      />
    );
  }

  const isEmpty = !value;
  const Tag = as;

  return (
    <Tag
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditing(true);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${as === 'h1' ? 'name' : 'description'}: ${value || placeholder || ''}`}
      className={cn(
        '-mx-1 cursor-pointer rounded px-1 transition-colors hover:bg-secondary/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        isEmpty && 'italic text-muted-foreground',
        className,
      )}
    >
      {isEmpty ? placeholder || '' : value}
    </Tag>
  );
};

export default InlineEdit;
