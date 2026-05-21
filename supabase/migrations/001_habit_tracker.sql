-- ============================================================
-- Habit Tracker – Supabase Database Setup
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. PROFILES (one row per auth user) -------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT    NOT NULL DEFAULT 'User',
  avatar_color TEXT    NOT NULL DEFAULT '#9C89B8',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);


-- 2. HABITS ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  description TEXT        NOT NULL DEFAULT '',
  color       TEXT        NOT NULL DEFAULT '#9C89B8',
  icon        TEXT        NOT NULL DEFAULT '✨',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_select"  ON public.habits FOR SELECT  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_insert"  ON public.habits FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update"  ON public.habits FOR UPDATE  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_delete"  ON public.habits FOR DELETE  TO authenticated USING (auth.uid() = user_id);


-- 3. HABIT COMPLETIONS ----------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id       UUID        NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_date DATE        NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completed_date)
);

ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read completions (needed for leaderboard aggregation)
CREATE POLICY "completions_select" ON public.habit_completions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "completions_insert" ON public.habit_completions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "completions_update" ON public.habit_completions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "completions_delete" ON public.habit_completions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 4. HABIT NOTES ----------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_notes (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id  UUID        NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note      TEXT        NOT NULL,
  note_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON public.habit_notes FOR SELECT  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes_insert" ON public.habit_notes FOR INSERT  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_update" ON public.habit_notes FOR UPDATE  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notes_delete" ON public.habit_notes FOR DELETE  TO authenticated USING (auth.uid() = user_id);


-- 5. LEADERBOARD FUNCTION ------------------------------------
-- Returns aggregated stats per user; runs as SECURITY DEFINER
-- so it can access all rows despite per-user RLS policies.
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE (
  user_id             UUID,
  display_name        TEXT,
  avatar_color        TEXT,
  habits_done_today   BIGINT,
  total_habits        BIGINT,
  rings_closed_today  BOOLEAN,
  completion_percentage NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  WITH
  -- Active habit counts per user
  user_habit_counts AS (
    SELECT user_id, COUNT(*) AS total_habits
    FROM   public.habits
    WHERE  is_active = TRUE
    GROUP BY user_id
  ),
  -- Today's completed habit count per user
  today_done AS (
    SELECT user_id, COUNT(DISTINCT habit_id) AS habits_done
    FROM   public.habit_completions
    WHERE  completed_date = CURRENT_DATE
    GROUP BY user_id
  ),
  -- Per-day completion counts for the rolling 30-day window
  daily_counts AS (
    SELECT
      hc.user_id,
      hc.completed_date,
      COUNT(DISTINCT hc.habit_id) AS habits_done,
      uhc.total_habits
    FROM   public.habit_completions hc
    JOIN   user_habit_counts uhc ON uhc.user_id = hc.user_id
    WHERE  hc.completed_date >= CURRENT_DATE - 29
    GROUP BY hc.user_id, hc.completed_date, uhc.total_habits
  ),
  -- 30-day "rings closed" percentage
  thirty_day_stats AS (
    SELECT
      user_id,
      ROUND(
        COUNT(CASE WHEN habits_done >= total_habits THEN 1 END)::NUMERIC / 30 * 100,
        1
      ) AS pct
    FROM  daily_counts
    GROUP BY user_id
  )
  SELECT
    p.id                                                         AS user_id,
    p.display_name,
    p.avatar_color,
    COALESCE(td.habits_done,   0)                                AS habits_done_today,
    COALESCE(uhc.total_habits, 0)                                AS total_habits,
    CASE
      WHEN COALESCE(uhc.total_habits, 0) > 0
       AND COALESCE(td.habits_done, 0) >= uhc.total_habits
      THEN TRUE ELSE FALSE
    END                                                          AS rings_closed_today,
    COALESCE(tds.pct,          0)                                AS completion_percentage
  FROM  public.profiles p
  LEFT JOIN user_habit_counts uhc ON uhc.user_id = p.id
  LEFT JOIN today_done        td  ON td.user_id  = p.id
  LEFT JOIN thirty_day_stats  tds ON tds.user_id = p.id
  WHERE COALESCE(uhc.total_habits, 0) > 0
  ORDER BY rings_closed_today DESC, completion_percentage DESC, habits_done_today DESC;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;
