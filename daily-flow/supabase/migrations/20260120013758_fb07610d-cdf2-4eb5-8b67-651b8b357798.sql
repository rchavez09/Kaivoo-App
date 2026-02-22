-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;

-- Topics policies
CREATE POLICY "Users can view their own topics" ON public.topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON public.topics FOR DELETE USING (auth.uid() = user_id);

-- Create topic_pages table (sub-pages within topics)
CREATE TABLE public.topic_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on topic_pages
ALTER TABLE public.topic_pages ENABLE ROW LEVEL SECURITY;

-- Topic pages policies
CREATE POLICY "Users can view their own topic pages" ON public.topic_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own topic pages" ON public.topic_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topic pages" ON public.topic_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topic pages" ON public.topic_pages FOR DELETE USING (auth.uid() = user_id);

-- Create tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS on tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Tags policies
CREATE POLICY "Users can view their own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tags" ON public.tags FOR DELETE USING (auth.uid() = user_id);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('backlog', 'todo', 'doing', 'blocked', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TEXT,
  start_date TEXT,
  tags TEXT[] DEFAULT '{}',
  topic_ids UUID[] DEFAULT '{}',
  source_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create subtasks table
CREATE TABLE public.subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subtasks
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- Subtasks policies
CREATE POLICY "Users can view their own subtasks" ON public.subtasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subtasks" ON public.subtasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subtasks" ON public.subtasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subtasks" ON public.subtasks FOR DELETE USING (auth.uid() = user_id);

-- Create journal_entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  topic_ids UUID[] DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal entries policies
CREATE POLICY "Users can view their own journal entries" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own journal entries" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own journal entries" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own journal entries" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);

-- Create captures table
CREATE TABLE public.captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'quick' CHECK (source IN ('journal', 'quick', 'task')),
  source_id UUID,
  date TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  topic_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on captures
ALTER TABLE public.captures ENABLE ROW LEVEL SECURITY;

-- Captures policies
CREATE POLICY "Users can view their own captures" ON public.captures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own captures" ON public.captures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own captures" ON public.captures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own captures" ON public.captures FOR DELETE USING (auth.uid() = user_id);

-- Create meetings table
CREATE TABLE public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  description TEXT,
  attendees TEXT[] DEFAULT '{}',
  is_external BOOLEAN NOT NULL DEFAULT false,
  source TEXT DEFAULT 'manual' CHECK (source IN ('google', 'outlook', 'manual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on meetings
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

-- Meetings policies
CREATE POLICY "Users can view their own meetings" ON public.meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON public.meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meetings" ON public.meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meetings FOR DELETE USING (auth.uid() = user_id);

-- Create routines table
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Routines policies
CREATE POLICY "Users can view their own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- Create routine_completions table
CREATE TABLE public.routine_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, routine_id, date)
);

-- Enable RLS on routine_completions
ALTER TABLE public.routine_completions ENABLE ROW LEVEL SECURITY;

-- Routine completions policies
CREATE POLICY "Users can view their own routine completions" ON public.routine_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own routine completions" ON public.routine_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own routine completions" ON public.routine_completions FOR DELETE USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();