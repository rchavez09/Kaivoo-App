/**
 * Insights History Modal — Sprint 38 P7 (Sprint 39: migrated to shadcn Dialog)
 *
 * Shows past heartbeat insights with filters and pagination.
 * Web: fetches from Supabase heartbeat_insights table.
 * Desktop: placeholder (SQLite storage is Phase B).
 */

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Insight {
  id: string;
  insight: string;
  is_actionable: boolean;
  created_at: string;
  frequency_setting: string;
  context_snapshot: unknown;
}

type DateFilter = '7d' | '30d' | 'all';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PAGE_SIZE = 20;

export default function InsightsHistoryModal({ open, onOpenChange }: Props) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('7d');
  const [actionableOnly, setActionableOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dateFilter, actionableOnly, page]);

  const fetchInsights = async () => {
    setLoading(true);
    const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

    if (isTauri) {
      setInsights([]);
      setHasMore(false);
      setLoading(false);
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setInsights([]);
        setLoading(false);
        return;
      }

      const query = (supabase as unknown as { from: (table: string) => Record<string, unknown> }).from(
        'heartbeat_insights',
      ) as unknown as {
        select: (cols: string) => unknown;
        eq: (col: string, val: unknown) => unknown;
        gte: (col: string, val: string) => unknown;
        order: (col: string, opts: { ascending: boolean }) => unknown;
        range: (from: number, to: number) => Promise<{ data: Insight[] | null; error: unknown }>;
      };

      let builder = query.select('*') as unknown as {
        eq: (col: string, val: unknown) => unknown;
        gte: (col: string, val: string) => unknown;
        order: (col: string, opts: { ascending: boolean }) => unknown;
        range: (from: number, to: number) => Promise<{ data: Insight[] | null; error: unknown }>;
      };

      if (dateFilter !== 'all') {
        const days = dateFilter === '7d' ? 7 : 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        builder = builder.gte('created_at', since) as typeof builder;
      }

      if (actionableOnly) {
        builder = builder.eq('is_actionable', true) as typeof builder;
      }

      builder = builder.order('created_at', { ascending: false }) as typeof builder;

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const { data, error } = await builder.range(from, to);

      if (error) {
        console.error('[InsightsHistory] Fetch error:', error);
        setInsights([]);
      } else {
        const rows = (data ?? []) as Insight[];
        setInsights(rows.slice(0, PAGE_SIZE));
        setHasMore(rows.length > PAGE_SIZE);
      }
    } catch (e) {
      console.error('[InsightsHistory] Failed to fetch:', e);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Insights History</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <Filter className="h-3 w-3 text-muted-foreground" />
          <div className="flex gap-1">
            {(['7d', '30d', 'all'] as DateFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  setPage(0);
                  setDateFilter(f);
                }}
                className={`rounded-md px-2 py-1 text-xs ${
                  dateFilter === f
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f === '7d' ? '7 days' : f === '30d' ? '30 days' : 'All time'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setPage(0);
              setActionableOnly(!actionableOnly);
            }}
            className={`ml-auto rounded-md px-2 py-1 text-xs ${
              actionableOnly ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Actionable only
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
          ) : insights.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No insights found.</p>
          ) : (
            <div className="space-y-2">
              {insights.map((insight) => (
                <button
                  key={insight.id}
                  type="button"
                  onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                  className="w-full rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary/30"
                >
                  <p className="text-sm text-foreground">{insight.insight}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(insight.created_at).toLocaleString()}
                    {insight.is_actionable && ' · Actionable'}
                  </p>
                  {expandedId === insight.id && insight.context_snapshot && (
                    <pre className="mt-2 max-h-32 overflow-auto rounded bg-muted p-2 text-xs text-muted-foreground">
                      {JSON.stringify(insight.context_snapshot, null, 2)}
                    </pre>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(page > 0 || hasMore) && (
          <div className="flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page + 1}</span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="rounded-md px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
