-- Persist per-user widget settings in the backend

CREATE TABLE IF NOT EXISTS public.widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  widget_key text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, widget_key)
);

ALTER TABLE public.widget_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies: users manage only their own settings
CREATE POLICY "Users can view their own widget settings"
ON public.widget_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget settings"
ON public.widget_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget settings"
ON public.widget_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own widget settings"
ON public.widget_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Helpful index for reads
CREATE INDEX IF NOT EXISTS idx_widget_settings_user_key
  ON public.widget_settings (user_id, widget_key);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_widget_settings_updated_at ON public.widget_settings;
CREATE TRIGGER update_widget_settings_updated_at
BEFORE UPDATE ON public.widget_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();