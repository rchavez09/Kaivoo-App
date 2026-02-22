-- Create AI action log table for trust/audit
CREATE TABLE public.ai_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'task_created', 'capture_created', 'tag_applied', etc.
  action_data JSONB NOT NULL, -- Details of what was created/changed
  source_input TEXT NOT NULL, -- Original user input
  approved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  undone_at TIMESTAMP WITH TIME ZONE, -- NULL if not undone
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_action_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own AI logs" 
ON public.ai_action_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI logs" 
ON public.ai_action_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI logs" 
ON public.ai_action_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI logs" 
ON public.ai_action_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create AI settings table
CREATE TABLE public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  ai_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own AI settings" 
ON public.ai_settings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings" 
ON public.ai_settings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings" 
ON public.ai_settings 
FOR UPDATE 
USING (auth.uid() = user_id);