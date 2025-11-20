-- Create scores table for leaderboard
CREATE TABLE IF NOT EXISTS public.scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pseudo TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  mode TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scores for leaderboard
CREATE POLICY "Anyone can view scores"
  ON public.scores
  FOR SELECT
  USING (true);

-- Allow anyone to insert their own scores
CREATE POLICY "Anyone can insert scores"
  ON public.scores
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster leaderboard queries
CREATE INDEX idx_scores_leaderboard ON public.scores(score DESC, created_at DESC);