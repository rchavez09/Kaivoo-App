import { format } from 'date-fns';
import type { AIResponse, LinkCaptureResponse } from './ai-inbox-types';

interface TopicContext {
  id: string;
  name: string;
  pages: { id: string; name: string }[];
}

interface TagContext {
  id: string;
  name: string;
}

interface TaskContext {
  id: string;
  title: string;
  subtaskCount: number;
}

export async function fetchThoughtSuggestions(
  text: string,
  topics: TopicContext[],
  tags: TagContext[],
  tasks: TaskContext[],
  followUp?: { question: string; answer: string },
): Promise<AIResponse> {
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-inbox`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      topics,
      tags,
      tasks,
      currentDate,
      followUp,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process');
  }

  return response.json();
}

export async function fetchLinkCapture(
  url: string,
  instruction: string | undefined,
  topics: TopicContext[],
  tags: TagContext[],
): Promise<LinkCaptureResponse> {
  const currentDate = format(new Date(), 'MMMM d, yyyy');

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-link-capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({
      url,
      instruction,
      topics,
      tags,
      currentDate,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process link');
  }

  return response.json();
}

export function normalizeTopicPath(rawPath: string): string {
  return rawPath.split('/').map(p => p.trim().replace(/\s+/g, ' ')).filter(Boolean).join('/');
}
