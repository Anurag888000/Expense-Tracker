-- Migration: Create recurring_transactions table

CREATE TABLE public.recurring_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255),
    payment_method VARCHAR(255),
    time_of_day VARCHAR(50),
    place VARCHAR(255),
    notes TEXT,
    frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
    next_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recurring transactions" 
ON public.recurring_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transactions" 
ON public.recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions" 
ON public.recurring_transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions" 
ON public.recurring_transactions FOR DELETE USING (auth.uid() = user_id);

-- Create Index for fast lookups by the lazy processor
CREATE INDEX recurring_tx_user_next_date_idx ON public.recurring_transactions(user_id, next_date);
