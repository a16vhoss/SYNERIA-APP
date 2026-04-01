-- Add active_role column to profiles
ALTER TABLE profiles
  ADD COLUMN active_role TEXT CHECK (active_role IN ('worker', 'employer'));

-- Initialize active_role from existing role values
UPDATE profiles SET active_role = role;

-- Now make it NOT NULL with a default
ALTER TABLE profiles ALTER COLUMN active_role SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN active_role SET DEFAULT 'worker';

-- Update handle_new_user() to set active_role on new signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role TEXT;
    _full_name TEXT;
    _avatar_url TEXT;
    _wallet_id UUID;
BEGIN
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'worker');
    _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    _avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    -- Create profile (now includes active_role)
    INSERT INTO public.profiles (id, email, full_name, role, active_role, avatar_url)
    VALUES (NEW.id, NEW.email, _full_name, _role, _role, _avatar_url);

    -- Create wallet with $50 sign-up bonus
    INSERT INTO public.wallets (user_id, balance, currency)
    VALUES (NEW.id, 50.00, 'USD')
    RETURNING id INTO _wallet_id;

    -- Record welcome bonus transaction
    INSERT INTO public.transactions (user_id, type, amount, currency, description, status)
    VALUES (NEW.id, 'bonus', 50.00, 'USD', 'Welcome bonus - Sign up reward', 'completed');

    -- Welcome notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
        NEW.id,
        'Welcome to Syneria!',
        'Your account has been created. You received a $50 welcome bonus!',
        'success'
    );

    -- If employer, auto-create company
    IF _role = 'employer' THEN
        INSERT INTO public.companies (owner_id, name, logo_letter)
        VALUES (NEW.id, _full_name || '''s Company', UPPER(LEFT(_full_name, 1)));
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
