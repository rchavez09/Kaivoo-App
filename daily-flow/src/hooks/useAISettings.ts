import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useAISettings() {
  const { user } = useAuth();
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('ai_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('Failed to fetch AI settings:', error);
      }

      setAiEnabled(data?.ai_enabled ?? false);
      setIsLoading(false);
    };

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggleAI = useCallback(async () => {
    if (!user) return;

    const newValue = !aiEnabled;
    setAiEnabled(newValue);

    const { error } = await supabase.from('ai_settings').upsert(
      {
        user_id: user.id,
        ai_enabled: newValue,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      },
    );

    if (error) {
      console.error('Failed to update AI settings:', error);
      setAiEnabled(!newValue); // Revert on error
    }
  }, [user, aiEnabled]);

  return { aiEnabled, isLoading, toggleAI };
}
