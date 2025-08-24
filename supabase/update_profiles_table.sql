-- Update profiles table to include all settings fields
-- Run this script in your Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,

ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',

ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{"shareData": false, "publicProfile": false, "allowAnalytics": true}'::jsonb,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "system", "compactMode": false, "autoSave": true}'::jsonb;

-- Update the trigger to handle the new fields
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
