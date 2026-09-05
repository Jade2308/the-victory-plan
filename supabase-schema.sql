-- ============================================================
-- Chiến Thắng — SQL Schema cho Supabase
-- Hướng dẫn: Copy toàn bộ file này vào
--   Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 1. Bảng Cài đặt người dùng
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  theme TEXT DEFAULT 'dark',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng Tiến độ đọc hàng ngày
CREATE TABLE IF NOT EXISTS public.user_progress (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  psalms_proverbs BOOLEAN DEFAULT FALSE,
  new_testament BOOLEAN DEFAULT FALSE,
  old_testament BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_index)
);

-- 3. Bảng Nhật ký Kinh Thánh
CREATE TABLE IF NOT EXISTS public.user_journals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_index INT NOT NULL,
  believe TEXT DEFAULT '',
  stop TEXT DEFAULT '',
  improve TEXT DEFAULT '',
  start TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, day_index)
);

-- 4. Bảng Câu gốc
CREATE TABLE IF NOT EXISTS public.user_verses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng Suy ngẫm hàng tháng
CREATE TABLE IF NOT EXISTS public.user_reflections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  block INT NOT NULL,
  text TEXT DEFAULT '',
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, block)
);

-- ============================================================
-- Row Level Security (RLS) — Mỗi user chỉ truy cập data của mình
-- ============================================================

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reflections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users manage own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own progress"
  ON public.user_progress FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own journals"
  ON public.user_journals FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own verses"
  ON public.user_verses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own reflections"
  ON public.user_reflections FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Indexes để tăng hiệu năng truy vấn
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journals_user_id ON public.user_journals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verses_user_id ON public.user_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_user_id ON public.user_reflections(user_id);
