export interface TaskSuggestion {
  type: 'task';
  title: string;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  topicPath: string | null;
  tags: string[];
  isNewTopic?: boolean;
  isNewTag?: boolean;
  suggestedNewTopics?: string[];
  suggestedNewTags?: string[];
  selected?: boolean;
}

export interface SubtaskSuggestion {
  type: 'subtask';
  title: string;
  parentTaskId: string;
  parentTaskTitle: string;
  selected?: boolean;
}

export interface CaptureSuggestion {
  type: 'capture';
  content: string;
  topicPath: string | null;
  tags: string[];
  isNewTopic?: boolean;
  isNewTag?: boolean;
  suggestedNewTopics?: string[];
  suggestedNewTags?: string[];
  selected?: boolean;
  sourceUrl?: string;
}

export type Suggestion = TaskSuggestion | SubtaskSuggestion | CaptureSuggestion;

export interface Clarification {
  question: string;
  choices: string[];
}

export interface AIResponse {
  suggestions: Suggestion[];
  clarification: Clarification | null;
  error?: string;
}

export interface LinkNote {
  title: string;
  content: string;
  topicPath: string | null;
  tags: string[];
  isNewTopic?: boolean;
  isNewTag?: boolean;
  sourceUrl: string;
}

export interface LinkTask {
  title: string;
  priority: 'low' | 'medium' | 'high';
  topicPath: string | null;
  selected?: boolean;
}

export interface LinkCaptureResponse {
  note?: LinkNote;
  tasks?: LinkTask[];
  pageTitle?: string;
  contentType?: string;
  sourceUrl?: string;
  needsManualInput?: boolean;
  needsSetup?: boolean;
  message?: string;
  error?: string;
}

/** Detect if input contains a URL (any website) */
export function detectUrl(text: string): { url: string; instruction: string } | null {
  const urlPattern = /(https?:\/\/[^\s]+)/i;
  const match = text.match(urlPattern);

  if (match) {
    const url = match[1];
    const instruction = text.replace(url, '').trim();
    return { url, instruction };
  }
  return null;
}
