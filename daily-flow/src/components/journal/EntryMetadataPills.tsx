import { Hash, FolderOpen, FileText } from 'lucide-react';

const MOODS: Record<number, { emoji: string; label: string }> = {
  5: { emoji: '😊', label: 'Great' },
  4: { emoji: '🙂', label: 'Good' },
  3: { emoji: '😐', label: 'Okay' },
  2: { emoji: '😔', label: 'Low' },
  1: { emoji: '😞', label: 'Rough' },
};

interface EntryMetadataPillsProps {
  topicPath?: string | null;
  tags: string[];
  moodScore?: number;
  maxTags?: number;
}

/** Read-only metadata pills for collapsed summary and other display contexts. */
const EntryMetadataPills = ({ topicPath, tags, moodScore, maxTags = 3 }: EntryMetadataPillsProps) => {
  const mood = moodScore ? MOODS[moodScore] : null;
  const isPage = topicPath?.includes('/');
  const visibleTags = tags.slice(0, maxTags);
  const overflow = tags.length - maxTags;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {topicPath && (
        <span className="topic-chip px-1.5 py-0.5 text-[10px]">
          {isPage ? <FileText className="h-2.5 w-2.5" /> : <FolderOpen className="h-2.5 w-2.5" />}
          {topicPath}
        </span>
      )}
      {visibleTags.map((tag) => (
        <span key={tag} className="tag-chip px-1.5 py-0.5 text-[10px]">
          <Hash className="h-2.5 w-2.5" />
          {tag}
        </span>
      ))}
      {overflow > 0 && <span className="text-[10px] text-muted-foreground">+{overflow}</span>}
      {mood ? (
        <span className="text-sm leading-none" title={mood.label}>
          {mood.emoji}
        </span>
      ) : null}
    </div>
  );
};

export { MOODS };
export default EntryMetadataPills;
