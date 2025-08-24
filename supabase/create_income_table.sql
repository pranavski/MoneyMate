-- Create income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for income
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Create policies for income
CREATE POLICY "Users can view their own income" 
ON public.income 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own income" 
ON public.income 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income" 
ON public.income 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income" 
ON public.income 
FOR DELETE 
USING (auth.uid() = user_id);
