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
    <div className="flex items-center gap-1.5 flex-wrap">
      {topicPath && (
        <span className="topic-chip text-[10px] py-0.5 px-1.5">
          {isPage ? <FileText className="w-2.5 h-2.5" /> : <FolderOpen className="w-2.5 h-2.5" />}
          {topicPath}
        </span>
      )}
      {visibleTags.map(tag => (
        <span key={tag} className="tag-chip text-[10px] py-0.5 px-1.5">
          <Hash className="w-2.5 h-2.5" />
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span className="text-[10px] text-muted-foreground">+{overflow}</span>
      )}
      {mood ? (
        <span className="text-sm leading-none" title={mood.label}>{mood.emoji}</span>
      ) : null}
    </div>
  );
};

export { MOODS };
export default EntryMetadataPills;
