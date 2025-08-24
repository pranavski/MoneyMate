-- Create debts table
CREATE TABLE public.debts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  minimum_payment DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

-- Create policies for debts
CREATE POLICY "Users can view their own debts" 
ON public.debts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" 
ON public.debts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" 
ON public.debts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" 
ON public.debts 
FOR DELETE 
USING (auth.uid() = user_id);
