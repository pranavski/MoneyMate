-- Create notification_logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  external_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create push_subscriptions table for storing browser push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create notification_templates table for reusable notification content
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  subject TEXT,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default notification templates
INSERT INTO public.notification_templates (name, type, subject, template, variables) VALUES
('budget_alert', 'email', 'Budget Alert - {{category}}', 
'<h2>Budget Alert</h2><p>Hi {{name}},</p><p>You have exceeded your budget for {{category}} by {{amount}}.</p><p>Current spending: ${{current}}<br>Budget limit: ${{limit}}</p><p>Consider reviewing your spending in this category.</p>',
'{"name": "string", "category": "string", "amount": "string", "current": "number", "limit": "number"}'),

('budget_alert', 'sms', 'Budget Alert', 
'MoneyMate: You have exceeded your {{category}} budget by {{amount}}. Current: ${{current}}, Limit: ${{limit}}',
'{"category": "string", "amount": "string", "current": "number", "limit": "number"}'),

('bill_reminder', 'email', 'Bill Reminder - {{bill_name}}', 
'<h2>Bill Reminder</h2><p>Hi {{name}},</p><p>This is a reminder that your {{bill_name}} bill of ${{amount}} is due on {{due_date}}.</p><p>Don''t forget to pay it on time!</p>',
'{"name": "string", "bill_name": "string", "amount": "number", "due_date": "string"}'),

('bill_reminder', 'sms', 'Bill Reminder', 
'MoneyMate: Your {{bill_name}} bill (${{amount}}) is due on {{due_date}}',
'{"bill_name": "string", "amount": "number", "due_date": "string"}'),

('weekly_report', 'email', 'Your Weekly Financial Report', 
'<h2>Weekly Financial Report</h2><p>Hi {{name}},</p><p>Here''s your financial summary for this week:</p><ul><li>Income: ${{income}}</li><li>Expenses: ${{expenses}}</li><li>Net: ${{net}}</li></ul><p>Keep up the great work!</p>',
'{"name": "string", "income": "number", "expenses": "number", "net": "number"}'),

('welcome', 'email', 'Welcome to MoneyMate!', 
'<h2>Welcome to MoneyMate!</h2><p>Hi {{name}},</p><p>Welcome to MoneyMate! We''re excited to help you take control of your finances.</p><p>Get started by adding your first transaction or setting up a budget.</p>',
'{"name": "string"}')
ON CONFLICT (name, type) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notification logs" ON public.notification_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active notification templates" ON public.notification_templates
  FOR SELECT USING (is_active = true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_notification_logs_updated_at
  BEFORE UPDATE ON public.notification_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
