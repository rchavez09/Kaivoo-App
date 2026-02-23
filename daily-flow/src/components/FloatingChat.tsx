import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useKaivooActions } from '@/hooks/useKaivooActions';
import { useKaivooStore } from '@/stores/useKaivooStore';
import { formatStorageDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const URL_REGEX = /https?:\/\/[^\s]+/i;

function parseCommand(input: string): { type: string; payload: string } | null {
  const lower = input.toLowerCase().trim();

  // Task creation
  if (lower.startsWith('remind me to ') || lower.startsWith('add task ')) {
    const payload = lower.startsWith('remind me to ')
      ? input.slice('remind me to '.length).trim()
      : input.slice('add task '.length).trim();
    return { type: 'create_task', payload };
  }

  // Routine completion
  if (lower.startsWith('mark ') && lower.includes(' done')) {
    const routineName = input.slice(5, lower.lastIndexOf(' done')).trim();
    return { type: 'complete_routine', payload: routineName };
  }

  // Mood setting
  if (lower.startsWith('set mood to ') || lower.startsWith('mood ')) {
    const moodStr = lower.startsWith('set mood to ')
      ? lower.slice('set mood to '.length).trim()
      : lower.slice('mood '.length).trim();
    return { type: 'set_mood', payload: moodStr };
  }

  // URL detection
  if (URL_REGEX.test(input)) {
    return { type: 'save_link', payload: input };
  }

  return null;
}

const MOOD_MAP: Record<string, number> = {
  great: 5, amazing: 5, fantastic: 5, awesome: 5, excellent: 5,
  good: 4, nice: 4, fine: 4, happy: 4,
  okay: 3, ok: 3, alright: 3, meh: 3,
  low: 2, bad: 2, sad: 2, down: 2,
  rough: 1, terrible: 1, awful: 1, horrible: 1,
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask, addCapture, addJournalEntry, toggleRoutineCompletion } = useKaivooActions();
  const routines = useKaivooStore(s => s.routines);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, text }]);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    addMessage('user', text);

    const command = parseCommand(text);

    try {
      if (command?.type === 'create_task') {
        await addTask({
          title: command.payload,
          status: 'todo',
          priority: 'medium',
          dueDate: 'Today',
          tags: [],
          topicIds: [],
          subtasks: [],
        });
        addMessage('assistant', `Done \u2014 created task "${command.payload}" for today.`);
      } else if (command?.type === 'complete_routine') {
        const match = routines.find(
          r => r.name.toLowerCase() === command.payload.toLowerCase()
        ) || routines.find(
          r => r.name.toLowerCase().includes(command.payload.toLowerCase())
        );

        if (match) {
          const dateStr = formatStorageDate(new Date());
          toggleRoutineCompletion(match.id, dateStr);
          addMessage('assistant', `Marked "${match.name}" as done.`);
        } else {
          addMessage('assistant', `Couldn't find a routine matching "${command.payload}". Your routines: ${routines.map(r => r.name).join(', ')}`);
        }
      } else if (command?.type === 'set_mood') {
        const score = MOOD_MAP[command.payload.toLowerCase()];
        if (score) {
          const dateStr = formatStorageDate(new Date());
          await addJournalEntry({
            date: dateStr,
            content: '',
            tags: ['mood'],
            topicIds: [],
            moodScore: score,
          });
          addMessage('assistant', `Mood set to ${command.payload}.`);
        } else {
          addMessage('assistant', `I didn't recognize that mood. Try: great, good, okay, low, or rough.`);
        }
      } else if (command?.type === 'save_link') {
        const urlMatch = text.match(URL_REGEX);
        await addCapture({
          content: text,
          source: 'quick',
          date: formatStorageDate(new Date()),
          tags: urlMatch ? ['link'] : [],
          topicIds: [],
        });
        addMessage('assistant', 'Saved as a capture.');
      } else {
        // Unrecognized input -> save as capture
        await addCapture({
          content: text,
          source: 'quick',
          date: formatStorageDate(new Date()),
          tags: [],
          topicIds: [],
        });
        addMessage('assistant', 'Saved as a capture. You can process it later.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      addMessage('assistant', msg);
      toast.error(msg);
    }
  }, [input, addMessage, addTask, addCapture, addJournalEntry, toggleRoutineCompletion, routines]);

  return (
    <>
      {/* Chat drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 max-h-[420px] bg-card border border-border rounded-2xl shadow-lg flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
            <span className="text-sm font-medium text-foreground">Kaivoo Chat</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[200px]">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                  Try: "Remind me to review PR" or "Mark meditation done"
                </p>
              </div>
            )}
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'text-sm px-3 py-2 rounded-xl max-w-[85%]',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-secondary text-foreground'
                )}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Quick thought or action..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="h-9 text-sm"
              />
              <Button size="sm" onClick={handleSend} className="h-9 px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-50',
          isOpen
            ? 'bg-primary text-primary-foreground scale-90'
            : 'bg-primary text-primary-foreground hover:scale-105'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <MessageCircle className="w-5 h-5" />
      </button>
    </>
  );
};

export default FloatingChat;
