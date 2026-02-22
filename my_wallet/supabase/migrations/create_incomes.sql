-- Incomes Table
CREATE TABLE public.incomes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  source TEXT NOT NULL, 
  date DATE NOT NULL,
  time_of_day TEXT NOT NULL, 
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Create Policies (Users read/write only their data)
CREATE POLICY "Users can manage their own incomes" ON public.incomes FOR ALL USING (auth.uid() = user_id);
