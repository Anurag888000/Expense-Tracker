-- Add composite indexes for better query performance
-- Run this migration in your Supabase SQL editor

-- Index for income queries filtered by user and date range
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON public.incomes(user_id, date);

-- Index for expense queries filtered by user and date range
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, date);

-- Index for goals queries filtered by user and month
CREATE INDEX IF NOT EXISTS idx_goals_user_month ON public.goals(user_id, month_year);
