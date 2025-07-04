-- =================================================================================================
-- Model Configs Table Schema and Policy
-- =================================================================================================

-- 1. 确保 model_configs 表结构正确（基于现有表结构）
DO $$ 
BEGIN
  -- Check if table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'model_configs'
  ) THEN
    -- Create table if it doesn't exist
    CREATE TABLE public.model_configs (
      id uuid not null default gen_random_uuid(),
      created_at timestamp with time zone not null default now(),
      user_id uuid null,
      name text null,
      model_id text null, -- 'doubao', 'tongyi', etc.
      enabled boolean null,
      test_status int null, -- 0: not tested, 1: testing, 2: tested failed, 3: tested passed
      last_tested_at timestamp with time zone null,
      config_json json null,

      constraint model_configs_pkey primary key (id),
      constraint model_configs_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete cascade,
      constraint model_configs_user_id_model_id_unique unique (user_id, model_id)
    ) TABLESPACE pg_default;
  END IF;
END $$;

-- 2. Enable RLS and create policy if not exists
ALTER TABLE public.model_configs ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'model_configs'
    AND policyname = 'Allow users to access their own data'
  ) THEN
    -- Create policy if it doesn't exist
    CREATE POLICY "Allow users to access their own data" ON public.model_configs
    TO public
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. Create Index and Composite Index
CREATE INDEX IF NOT EXISTS idx_model_configs_user_id ON public.model_configs (user_id);
CREATE INDEX IF NOT EXISTS idx_model_configs_user_id_model_id ON public.model_configs (user_id, model_id);
