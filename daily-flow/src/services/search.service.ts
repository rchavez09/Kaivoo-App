import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  entityType:
    | 'task'
    | 'subtask'
    | 'note'
    | 'project'
    | 'project_note'
    | 'meeting'
    | 'capture'
    | 'topic'
    | 'topic_page'
    | 'habit';
  entityId: string;
  title: string;
  preview: string;
  rank: number;
  metadata: Record<string, unknown>;
}

/** Map entity types to their navigation routes */
function getEntityPath(result: SearchResult): string {
  const meta = result.metadata as Record<string, string | undefined>;
  switch (result.entityType) {
    case 'task':
    case 'subtask':
      return '/projects';
    case 'note':
      return '/notes';
    case 'project':
      return `/projects/${result.entityId}`;
    case 'project_note':
      return meta.projectId ? `/projects/${meta.projectId}` : '/projects';
    case 'meeting':
      return '/calendar';
    case 'capture':
      return '/notes';
    case 'topic':
      return `/topics/${result.entityId}`;
    case 'topic_page':
      return meta.topicId ? `/topics/${meta.topicId}/pages/${result.entityId}` : '/topics';
    case 'habit':
      return '/routines';
    default:
      return '/';
  }
}

/** Strip characters that break PostgreSQL to_tsquery: ()&|!:*\<>' */
function sanitizeSearchQuery(query: string): string {
  return query.replace(/[()&|!:*\\<>']/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function searchAll(query: string, limit = 50): Promise<(SearchResult & { path: string })[]> {
  const sanitized = sanitizeSearchQuery(query.trim());
  if (!sanitized) return [];

  const { data, error } = await supabase.rpc('search_all', {
    search_query: sanitized,
    result_limit: limit,
  });

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return (data ?? []).map(
    (row: {
      entity_type: string;
      entity_id: string;
      title: string;
      preview: string;
      rank: number;
      metadata: Record<string, unknown>;
    }) => {
      const result: SearchResult = {
        entityType: row.entity_type as SearchResult['entityType'],
        entityId: row.entity_id,
        title: row.title,
        preview: row.preview,
        rank: row.rank,
        metadata: row.metadata ?? {},
      };
      return { ...result, path: getEntityPath(result) };
    },
  );
}
