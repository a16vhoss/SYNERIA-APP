-- Add settings column to profiles for user preferences (language, notifications, etc.)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"language":"es","notifJobs":true,"notifApplications":true,"frequency":"semanal"}';
