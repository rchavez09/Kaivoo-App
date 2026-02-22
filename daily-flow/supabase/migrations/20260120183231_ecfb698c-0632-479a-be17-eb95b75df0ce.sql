-- Add tags column to subtasks table for subtask tagging functionality
ALTER TABLE public.subtasks 
ADD COLUMN tags text[] DEFAULT '{}'::text[];