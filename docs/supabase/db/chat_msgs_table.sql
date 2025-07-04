-- =================================================================================================
-- Chat Messages Table Schema and Policy
-- =================================================================================================

-- 1. 确保 chat_msgs 表结构正确（基于现有表结构）
DO $$ 
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'chat_msgs'
  ) THEN
    -- Create table if it doesn't exist
    CREATE TABLE public.chat_msgs (
      id uuid not null default gen_random_uuid(),
      created_at timestamp with time zone not null default now(),
      messages json null default '{}'::json,
      user_id uuid null,
      title text null,
      archived boolean not null default false,

      constraint chat_msgs_pkey primary key (id),
      constraint chat_msgs_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade
    ) TABLESPACE pg_default;
  END IF;
END $$;

-- 2. Enable RLS and create policy if not exists
ALTER TABLE public.chat_msgs ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'chat_msgs'
    AND policyname = 'Allow users to access their own data'
  ) THEN
    -- Create policy if it doesn't exist
    CREATE POLICY "Allow users to access their own data" ON public.chat_msgs
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Create Index and Composite Index
CREATE INDEX IF NOT EXISTS idx_chat_msgs_user_id ON public.chat_msgs (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_msgs_user_id_archived ON public.chat_msgs (user_id, archived);
