-- ============================================================================
-- SYNERIA - Global Talent Platform
-- Initial Database Schema Migration
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- profiles
-- --------------------------------------------------------------------------
CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email           TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL CHECK (role IN ('worker', 'employer')),
    avatar_url      TEXT,
    phone           TEXT,
    country         TEXT,
    city            TEXT,
    bio             TEXT CHECK (char_length(bio) <= 500),
    date_of_birth   DATE,
    skills          TEXT[] DEFAULT '{}',
    languages       JSONB DEFAULT '[]',
    experience_years INTEGER DEFAULT 0,
    education       JSONB DEFAULT '[]',
    certifications  TEXT[] DEFAULT '{}',
    availability    TEXT DEFAULT 'immediate',
    desired_salary  NUMERIC,
    passport_verified BOOLEAN DEFAULT false,
    profile_complete  BOOLEAN DEFAULT false,
    rating          NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    jobs_completed  INTEGER DEFAULT 0,
    documents       JSONB DEFAULT '{}',
    desired_countries TEXT[] DEFAULT '{}',
    desired_sectors   TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- companies
-- --------------------------------------------------------------------------
CREATE TABLE companies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID UNIQUE REFERENCES auth.users ON DELETE CASCADE,
    name            TEXT NOT NULL,
    logo_letter     TEXT DEFAULT 'C',
    logo_gradient   TEXT,
    description     TEXT,
    sector          TEXT,
    country         TEXT,
    city            TEXT,
    website         TEXT,
    employees_count INTEGER DEFAULT 0,
    rating          NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    verified        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- jobs
-- --------------------------------------------------------------------------
CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    company_id      UUID REFERENCES companies ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    responsibilities TEXT[] DEFAULT '{}',
    requirements    TEXT[] DEFAULT '{}',
    benefits        TEXT[] DEFAULT '{}',
    sector          TEXT,
    country         TEXT,
    city            TEXT,
    salary_min      NUMERIC CHECK (salary_min >= 0),
    salary_max      NUMERIC CHECK (salary_max >= 0),
    salary_currency TEXT DEFAULT 'USD',
    salary_display  TEXT,
    job_type        TEXT CHECK (job_type IN ('full_time', 'part_time', 'contract', 'seasonal')),
    visa_sponsorship BOOLEAN DEFAULT false,
    housing_included BOOLEAN DEFAULT false,
    urgent          BOOLEAN DEFAULT false,
    status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
    start_date      DATE,
    duration        TEXT,
    experience_required TEXT,
    languages_required TEXT[] DEFAULT '{}',
    applicants_count INTEGER DEFAULT 0,
    views_count     INTEGER DEFAULT 0,
    tags            TEXT[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT jobs_salary_range CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

-- --------------------------------------------------------------------------
-- applications
-- --------------------------------------------------------------------------
CREATE TABLE applications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID NOT NULL REFERENCES jobs ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    cover_letter        TEXT,
    motivation          TEXT,
    availability        DATE,
    cv_url              TEXT,
    status              TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'interview', 'accepted', 'rejected')),
    notes               TEXT,
    interview_date      TIMESTAMPTZ,
    interview_link      TEXT,
    interview_notes     TEXT,
    interview_feedback  TEXT,
    interview_confirmed BOOLEAN DEFAULT NULL,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now(),

    UNIQUE (job_id, user_id)
);

-- --------------------------------------------------------------------------
-- wallets
-- --------------------------------------------------------------------------
CREATE TABLE wallets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID UNIQUE NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    balance     NUMERIC DEFAULT 0 CHECK (balance >= 0),
    currency    TEXT DEFAULT 'USD',
    card_last_four TEXT DEFAULT '4829',
    card_expiry TEXT DEFAULT '12/28',
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- contracts (forward-declared for transactions FK)
-- --------------------------------------------------------------------------
CREATE TABLE contracts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id               UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    employer_id             UUID NOT NULL REFERENCES auth.users,
    company_id              UUID REFERENCES companies ON DELETE SET NULL,
    employer_name           TEXT,
    application_id          UUID REFERENCES applications,
    job_id                  UUID REFERENCES jobs,
    parent_contract_id      UUID REFERENCES contracts,
    position                TEXT NOT NULL,
    country                 TEXT,
    city                    TEXT,
    salary                  NUMERIC,
    salary_currency         TEXT DEFAULT 'USD',
    salary_display          TEXT,
    start_date              DATE,
    end_date                DATE,
    terms                   TEXT,
    terms_structured        JSONB DEFAULT '{}',
    benefits                TEXT[] DEFAULT '{}',
    work_schedule           TEXT,
    visa_sponsorship        BOOLEAN DEFAULT false,
    visa_details            TEXT,
    status                  TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'activo', 'completado', 'expirado', 'cancelado', 'cancelacion_solicitada', 'en_disputa')),
    blockchain_hash         TEXT,
    worker_signature_data   TEXT,
    signed_at               TIMESTAMPTZ,
    cancellation_requested_by UUID REFERENCES auth.users,
    cancellation_reason     TEXT,
    cancellation_date       TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    completed_by            UUID REFERENCES auth.users,
    last_payment_date       TIMESTAMPTZ,
    total_paid              NUMERIC DEFAULT 0,
    created_at              TIMESTAMPTZ DEFAULT now(),
    updated_at              TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- transactions
-- --------------------------------------------------------------------------
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('income', 'remittance', 'swap', 'bonus', 'withdrawal', 'deposit', 'payment_sent', 'payment_received')),
    amount          NUMERIC NOT NULL CHECK (amount > 0),
    currency        TEXT DEFAULT 'USD',
    description     TEXT,
    recipient_name  TEXT,
    recipient_country TEXT,
    local_amount    NUMERIC,
    local_currency  TEXT,
    fee             NUMERIC DEFAULT 0 CHECK (fee >= 0),
    status          TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    reference       TEXT,
    contract_id     UUID REFERENCES contracts,
    counterparty_id UUID REFERENCES auth.users,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- contract_events
-- --------------------------------------------------------------------------
CREATE TABLE contract_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts ON DELETE CASCADE,
    actor_id    UUID NOT NULL REFERENCES auth.users,
    event_type  TEXT NOT NULL CHECK (event_type IN ('created', 'signed', 'completed', 'cancelled', 'cancellation_requested', 'cancellation_accepted', 'cancellation_disputed', 'renewed', 'pdf_generated', 'payment_sent')),
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- notifications
-- --------------------------------------------------------------------------
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    title       TEXT NOT NULL,
    message     TEXT,
    type        TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'job', 'application', 'payment', 'contract')),
    link        TEXT,
    read        BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- messages
-- --------------------------------------------------------------------------
CREATE TABLE messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id   UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    content     TEXT NOT NULL,
    read        BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- saved_jobs
-- --------------------------------------------------------------------------
CREATE TABLE saved_jobs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    job_id      UUID NOT NULL REFERENCES jobs ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now(),

    UNIQUE (user_id, job_id)
);

-- --------------------------------------------------------------------------
-- connections
-- --------------------------------------------------------------------------
CREATE TABLE connections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    addressee_id    UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    connection_type TEXT NOT NULL CHECK (connection_type IN ('worked_together', 'manual_connection')),
    status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    contract_id     UUID REFERENCES contracts,
    company_id      UUID REFERENCES companies,
    message         TEXT,
    connected_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT no_self_connection CHECK (requester_id != addressee_id),
    CONSTRAINT unique_connection_pair UNIQUE (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
);

-- --------------------------------------------------------------------------
-- endorsements
-- --------------------------------------------------------------------------
CREATE TABLE endorsements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endorser_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    endorsed_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    skill           TEXT NOT NULL,
    comment         TEXT CHECK (char_length(comment) <= 200),
    connection_id   UUID NOT NULL REFERENCES connections ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT no_self_endorsement CHECK (endorser_id != endorsed_id),
    UNIQUE (endorser_id, endorsed_id, skill)
);

-- --------------------------------------------------------------------------
-- reviews
-- --------------------------------------------------------------------------
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    company_id  UUID REFERENCES companies ON DELETE CASCADE,
    rating      SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT CHECK (char_length(comment) <= 500),
    tags        TEXT[] DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),

    UNIQUE (reviewer_id, contract_id),
    CONSTRAINT no_self_review CHECK (reviewer_id != reviewee_id)
);

-- --------------------------------------------------------------------------
-- network_activity
-- --------------------------------------------------------------------------
CREATE TABLE network_activity (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
    activity_type   TEXT NOT NULL CHECK (activity_type IN ('new_job_posted', 'new_certification', 'contract_completed', 'new_connection', 'profile_updated', 'endorsement_received')),
    reference_type  TEXT,
    reference_id    UUID,
    summary_data    JSONB NOT NULL DEFAULT '{}',
    visibility      TEXT NOT NULL DEFAULT 'connections' CHECK (visibility IN ('connections', 'public')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    expires_at      TIMESTAMPTZ DEFAULT (now() + interval '90 days')
);


-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_role ON profiles (role);
CREATE INDEX idx_profiles_country ON profiles (country);
CREATE INDEX idx_profiles_skills ON profiles USING GIN (skills);
CREATE INDEX idx_profiles_desired_countries ON profiles USING GIN (desired_countries);
CREATE INDEX idx_profiles_desired_sectors ON profiles USING GIN (desired_sectors);
CREATE INDEX idx_profiles_certifications ON profiles USING GIN (certifications);
CREATE INDEX idx_profiles_rating ON profiles (rating DESC);

-- companies
CREATE INDEX idx_companies_owner ON companies (owner_id);
CREATE INDEX idx_companies_sector ON companies (sector);
CREATE INDEX idx_companies_country ON companies (country);

-- jobs
CREATE INDEX idx_jobs_employer ON jobs (employer_id);
CREATE INDEX idx_jobs_company ON jobs (company_id);
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_sector ON jobs (sector);
CREATE INDEX idx_jobs_country ON jobs (country);
CREATE INDEX idx_jobs_type ON jobs (job_type);
CREATE INDEX idx_jobs_tags ON jobs USING GIN (tags);
CREATE INDEX idx_jobs_requirements ON jobs USING GIN (requirements);
CREATE INDEX idx_jobs_languages_required ON jobs USING GIN (languages_required);
CREATE INDEX idx_jobs_active ON jobs (created_at DESC) WHERE status = 'active';
CREATE INDEX idx_jobs_urgent_active ON jobs (created_at DESC) WHERE status = 'active' AND urgent = true;
CREATE INDEX idx_jobs_salary ON jobs (salary_min, salary_max) WHERE status = 'active';

-- applications
CREATE INDEX idx_applications_job ON applications (job_id);
CREATE INDEX idx_applications_user ON applications (user_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_job_status ON applications (job_id, status);

-- wallets
CREATE INDEX idx_wallets_user ON wallets (user_id);

-- transactions
CREATE INDEX idx_transactions_user ON transactions (user_id);
CREATE INDEX idx_transactions_type ON transactions (user_id, type);
CREATE INDEX idx_transactions_contract ON transactions (contract_id);
CREATE INDEX idx_transactions_created ON transactions (user_id, created_at DESC);

-- contracts
CREATE INDEX idx_contracts_worker ON contracts (worker_id);
CREATE INDEX idx_contracts_employer ON contracts (employer_id);
CREATE INDEX idx_contracts_company ON contracts (company_id);
CREATE INDEX idx_contracts_status ON contracts (status);
CREATE INDEX idx_contracts_job ON contracts (job_id);
CREATE INDEX idx_contracts_application ON contracts (application_id);
CREATE INDEX idx_contracts_active ON contracts (end_date) WHERE status = 'activo';

-- contract_events
CREATE INDEX idx_contract_events_contract ON contract_events (contract_id);
CREATE INDEX idx_contract_events_actor ON contract_events (actor_id);

-- notifications
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE read = false;

-- messages
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_receiver ON messages (receiver_id);
CREATE INDEX idx_messages_conversation ON messages (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC);
CREATE INDEX idx_messages_unread ON messages (receiver_id, created_at DESC) WHERE read = false;

-- saved_jobs
CREATE INDEX idx_saved_jobs_user ON saved_jobs (user_id);
CREATE INDEX idx_saved_jobs_job ON saved_jobs (job_id);

-- connections
CREATE INDEX idx_connections_requester ON connections (requester_id);
CREATE INDEX idx_connections_addressee ON connections (addressee_id);
CREATE INDEX idx_connections_status ON connections (status);
CREATE INDEX idx_connections_accepted ON connections (requester_id, addressee_id) WHERE status = 'accepted';

-- endorsements
CREATE INDEX idx_endorsements_endorsed ON endorsements (endorsed_id);
CREATE INDEX idx_endorsements_endorser ON endorsements (endorser_id);
CREATE INDEX idx_endorsements_skill ON endorsements (endorsed_id, skill);
CREATE INDEX idx_endorsements_connection ON endorsements (connection_id);

-- reviews
CREATE INDEX idx_reviews_contract ON reviews (contract_id);
CREATE INDEX idx_reviews_reviewee ON reviews (reviewee_id);
CREATE INDEX idx_reviews_reviewer ON reviews (reviewer_id);
CREATE INDEX idx_reviews_company ON reviews (company_id);

-- network_activity
CREATE INDEX idx_network_activity_actor ON network_activity (actor_id);
CREATE INDEX idx_network_activity_type ON network_activity (activity_type);
CREATE INDEX idx_network_activity_created ON network_activity (created_at DESC);
CREATE INDEX idx_network_activity_active ON network_activity (actor_id, created_at DESC) WHERE expires_at > now();


-- ============================================================================
-- 4. FUNCTIONS AND TRIGGERS
-- ============================================================================

-- --------------------------------------------------------------------------
-- update_updated_at() - generic trigger function
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables that have that column
CREATE TRIGGER trg_profiles_updated_at      BEFORE UPDATE ON profiles      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_companies_updated_at     BEFORE UPDATE ON companies     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated_at          BEFORE UPDATE ON jobs          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_applications_updated_at  BEFORE UPDATE ON applications  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_wallets_updated_at       BEFORE UPDATE ON wallets       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contracts_updated_at     BEFORE UPDATE ON contracts     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_connections_updated_at   BEFORE UPDATE ON connections   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_endorsements_updated_at  BEFORE UPDATE ON endorsements  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- --------------------------------------------------------------------------
-- handle_new_user() - triggered on auth.users INSERT
-- Creates profile, wallet ($50 bonus), welcome transaction, welcome
-- notification, and company (if employer).
-- --------------------------------------------------------------------------
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

    -- Create profile
    INSERT INTO public.profiles (id, email, full_name, role, avatar_url)
    VALUES (NEW.id, NEW.email, _full_name, _role, _avatar_url);

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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();


-- --------------------------------------------------------------------------
-- delete_own_account() - RPC for users to delete themselves
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION delete_own_account()
RETURNS VOID AS $$
BEGIN
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- handle_new_review() - BEFORE INSERT on reviews
-- Validates reviewer is party to contract, auto-sets reviewee_id and company_id
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_review()
RETURNS TRIGGER AS $$
DECLARE
    _contract RECORD;
BEGIN
    -- Fetch the contract
    SELECT worker_id, employer_id, company_id, status
    INTO _contract
    FROM contracts
    WHERE id = NEW.contract_id;

    IF _contract IS NULL THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;

    -- Contract must be completed
    IF _contract.status != 'completado' THEN
        RAISE EXCEPTION 'Can only review completed contracts';
    END IF;

    -- Reviewer must be a party
    IF NEW.reviewer_id != _contract.worker_id AND NEW.reviewer_id != _contract.employer_id THEN
        RAISE EXCEPTION 'Reviewer must be a party to the contract';
    END IF;

    -- Auto-set reviewee_id to the other party
    IF NEW.reviewer_id = _contract.worker_id THEN
        NEW.reviewee_id := _contract.employer_id;
    ELSE
        NEW.reviewee_id := _contract.worker_id;
    END IF;

    -- Auto-set company_id
    NEW.company_id := _contract.company_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_new_review
    BEFORE INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_review();


-- --------------------------------------------------------------------------
-- update_ratings_on_review() - AFTER INSERT on reviews
-- Recalculates AVG rating on profiles and companies
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_ratings_on_review()
RETURNS TRIGGER AS $$
DECLARE
    _avg_rating NUMERIC;
BEGIN
    -- Update profile rating for the reviewee
    SELECT COALESCE(AVG(rating), 0)
    INTO _avg_rating
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id;

    UPDATE profiles
    SET rating = ROUND(_avg_rating, 2)
    WHERE id = NEW.reviewee_id;

    -- Update company rating if applicable
    IF NEW.company_id IS NOT NULL THEN
        SELECT COALESCE(AVG(rating), 0)
        INTO _avg_rating
        FROM reviews
        WHERE company_id = NEW.company_id;

        UPDATE companies
        SET rating = ROUND(_avg_rating, 2)
        WHERE id = NEW.company_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ratings_on_review
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_ratings_on_review();


-- --------------------------------------------------------------------------
-- handle_contract_completed() - AFTER UPDATE on contracts
-- When status becomes 'completado': auto-connect, activity, notify, increment
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_contract_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completado' AND OLD.status != 'completado' THEN
        -- Auto-connect worker and employer if not already connected
        INSERT INTO connections (requester_id, addressee_id, connection_type, status, contract_id, company_id, connected_at)
        VALUES (NEW.employer_id, NEW.worker_id, 'worked_together', 'accepted', NEW.id, NEW.company_id, now())
        ON CONFLICT ON CONSTRAINT unique_connection_pair DO NOTHING;

        -- Create network activity
        INSERT INTO network_activity (actor_id, activity_type, reference_type, reference_id, summary_data, visibility)
        VALUES
            (NEW.worker_id, 'contract_completed', 'contract', NEW.id,
             jsonb_build_object('position', NEW.position, 'company_id', NEW.company_id), 'connections'),
            (NEW.employer_id, 'contract_completed', 'contract', NEW.id,
             jsonb_build_object('position', NEW.position, 'worker_id', NEW.worker_id), 'connections');

        -- Notify worker
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.worker_id,
            'Contract Completed',
            'Your contract for "' || NEW.position || '" has been marked as completed.',
            'contract',
            '/contracts/' || NEW.id
        );

        -- Notify employer
        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            NEW.employer_id,
            'Contract Completed',
            'The contract for "' || NEW.position || '" has been completed.',
            'contract',
            '/contracts/' || NEW.id
        );

        -- Increment jobs_completed for worker
        UPDATE profiles
        SET jobs_completed = jobs_completed + 1
        WHERE id = NEW.worker_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_contract_completed
    AFTER UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION handle_contract_completed();


-- --------------------------------------------------------------------------
-- handle_job_activity() - AFTER INSERT/UPDATE on jobs when active
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_job_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status != 'active') THEN
        INSERT INTO network_activity (actor_id, activity_type, reference_type, reference_id, summary_data, visibility)
        VALUES (
            NEW.employer_id,
            'new_job_posted',
            'job',
            NEW.id,
            jsonb_build_object('title', NEW.title, 'country', NEW.country, 'sector', NEW.sector),
            'public'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_job_activity
    AFTER INSERT OR UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION handle_job_activity();


-- --------------------------------------------------------------------------
-- transfer_payment() - Atomic payment between employer and worker
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION transfer_payment(
    p_employer_id UUID,
    p_worker_id UUID,
    p_contract_id UUID,
    p_amount NUMERIC,
    p_currency TEXT DEFAULT 'USD',
    p_description TEXT DEFAULT 'Contract payment',
    p_fee NUMERIC DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
    _employer_balance NUMERIC;
    _tx_id UUID;
BEGIN
    -- Lock both wallets in consistent order to prevent deadlocks
    PERFORM 1 FROM wallets WHERE user_id = LEAST(p_employer_id, p_worker_id) FOR UPDATE;
    PERFORM 1 FROM wallets WHERE user_id = GREATEST(p_employer_id, p_worker_id) FOR UPDATE;

    -- Check employer balance
    SELECT balance INTO _employer_balance FROM wallets WHERE user_id = p_employer_id;
    IF _employer_balance IS NULL THEN
        RAISE EXCEPTION 'Employer wallet not found';
    END IF;
    IF _employer_balance < (p_amount + p_fee) THEN
        RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', _employer_balance, (p_amount + p_fee);
    END IF;

    -- Debit employer
    UPDATE wallets SET balance = balance - (p_amount + p_fee) WHERE user_id = p_employer_id;

    -- Credit worker
    UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_worker_id;

    -- Record employer transaction (payment sent)
    INSERT INTO transactions (user_id, type, amount, currency, description, fee, status, contract_id, counterparty_id)
    VALUES (p_employer_id, 'payment_sent', p_amount, p_currency, p_description, p_fee, 'completed', p_contract_id, p_worker_id);

    -- Record worker transaction (payment received)
    INSERT INTO transactions (user_id, type, amount, currency, description, fee, status, contract_id, counterparty_id)
    VALUES (p_worker_id, 'payment_received', p_amount, p_currency, p_description, 0, 'completed', p_contract_id, p_employer_id)
    RETURNING id INTO _tx_id;

    -- Update contract payment tracking
    UPDATE contracts
    SET last_payment_date = now(),
        total_paid = total_paid + p_amount
    WHERE id = p_contract_id;

    -- Record contract event
    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (p_contract_id, p_employer_id, 'payment_sent',
            jsonb_build_object('amount', p_amount, 'currency', p_currency, 'fee', p_fee));

    -- Notify worker
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        p_worker_id,
        'Payment Received',
        'You received ' || p_currency || ' ' || p_amount || ' for "' || p_description || '".',
        'payment',
        '/wallet'
    );

    RETURN _tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- deposit_to_wallet() - Add funds to a wallet
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION deposit_to_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_currency TEXT DEFAULT 'USD'
)
RETURNS UUID AS $$
DECLARE
    _tx_id UUID;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Deposit amount must be positive';
    END IF;

    UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_user_id;

    INSERT INTO transactions (user_id, type, amount, currency, description, status)
    VALUES (p_user_id, 'deposit', p_amount, p_currency, 'Wallet deposit', 'completed')
    RETURNING id INTO _tx_id;

    RETURN _tx_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- schedule_interview() - Employer schedules interview for an application
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION schedule_interview(
    p_application_id UUID,
    p_employer_id UUID,
    p_date TIMESTAMPTZ,
    p_link TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    _app RECORD;
BEGIN
    SELECT a.*, j.employer_id AS job_employer_id, j.title AS job_title
    INTO _app
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;

    IF _app IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    IF _app.job_employer_id != p_employer_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    UPDATE applications
    SET status = 'interview',
        interview_date = p_date,
        interview_link = p_link,
        interview_notes = p_notes,
        interview_confirmed = NULL
    WHERE id = p_application_id;

    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _app.user_id,
        'Interview Scheduled',
        'You have an interview for "' || _app.job_title || '" on ' || to_char(p_date, 'Mon DD, YYYY HH24:MI') || '.',
        'application',
        '/applications/' || p_application_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- respond_to_interview() - Worker confirms or declines interview
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION respond_to_interview(
    p_application_id UUID,
    p_worker_id UUID,
    p_confirmed BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    _app RECORD;
BEGIN
    SELECT a.*, j.employer_id AS job_employer_id, j.title AS job_title
    INTO _app
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id AND a.user_id = p_worker_id;

    IF _app IS NULL THEN
        RAISE EXCEPTION 'Application not found or not yours';
    END IF;

    UPDATE applications
    SET interview_confirmed = p_confirmed
    WHERE id = p_application_id;

    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _app.job_employer_id,
        CASE WHEN p_confirmed THEN 'Interview Confirmed' ELSE 'Interview Declined' END,
        'Candidate has ' || CASE WHEN p_confirmed THEN 'confirmed' ELSE 'declined' END ||
        ' the interview for "' || _app.job_title || '".',
        'application',
        '/employer/applications/' || p_application_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- sign_contract() - Worker signs contract, generates blockchain hash
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sign_contract(
    p_contract_id UUID,
    p_signature_data TEXT
)
RETURNS VOID AS $$
DECLARE
    _contract RECORD;
    _hash TEXT;
BEGIN
    SELECT * INTO _contract FROM contracts WHERE id = p_contract_id;

    IF _contract IS NULL THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;

    IF _contract.worker_id != auth.uid() THEN
        RAISE EXCEPTION 'Only the worker can sign this contract';
    END IF;

    IF _contract.status != 'pendiente' THEN
        RAISE EXCEPTION 'Contract is not pending signature';
    END IF;

    -- Generate SHA-256 hash from contract data + signature
    _hash := encode(
        digest(
            _contract.id::TEXT || _contract.worker_id::TEXT || _contract.employer_id::TEXT ||
            _contract.position || COALESCE(_contract.salary::TEXT, '') || p_signature_data || now()::TEXT,
            'sha256'
        ),
        'hex'
    );

    UPDATE contracts
    SET status = 'activo',
        worker_signature_data = p_signature_data,
        signed_at = now(),
        blockchain_hash = _hash
    WHERE id = p_contract_id;

    -- Record event
    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (p_contract_id, auth.uid(), 'signed',
            jsonb_build_object('hash', _hash, 'signed_at', now()));

    -- Notify employer
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _contract.employer_id,
        'Contract Signed',
        'The contract for "' || _contract.position || '" has been signed and is now active.',
        'contract',
        '/contracts/' || p_contract_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- create_contract() - Employer creates contract from accepted application
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_contract(
    p_application_id UUID,
    p_position TEXT,
    p_salary NUMERIC DEFAULT NULL,
    p_salary_currency TEXT DEFAULT 'USD',
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_terms TEXT DEFAULT NULL,
    p_terms_structured JSONB DEFAULT '{}',
    p_benefits TEXT[] DEFAULT '{}',
    p_work_schedule TEXT DEFAULT NULL,
    p_visa_sponsorship BOOLEAN DEFAULT false,
    p_visa_details TEXT DEFAULT NULL,
    p_country TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    _app RECORD;
    _company RECORD;
    _contract_id UUID;
    _employer_name TEXT;
    _salary_display TEXT;
BEGIN
    -- Fetch application with job info
    SELECT a.*, j.employer_id AS job_employer_id, j.company_id AS job_company_id, j.title AS job_title
    INTO _app
    FROM applications a
    JOIN jobs j ON j.id = a.job_id
    WHERE a.id = p_application_id;

    IF _app IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;

    IF _app.job_employer_id != auth.uid() THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF _app.status != 'accepted' THEN
        RAISE EXCEPTION 'Application must be accepted first';
    END IF;

    -- Get employer name
    SELECT full_name INTO _employer_name FROM profiles WHERE id = auth.uid();

    -- Get company info
    SELECT * INTO _company FROM companies WHERE id = _app.job_company_id;

    -- Build salary display
    IF p_salary IS NOT NULL THEN
        _salary_display := p_salary_currency || ' ' || p_salary || '/month';
    END IF;

    INSERT INTO contracts (
        worker_id, employer_id, company_id, employer_name, application_id, job_id,
        position, country, city, salary, salary_currency, salary_display,
        start_date, end_date, terms, terms_structured, benefits, work_schedule,
        visa_sponsorship, visa_details
    ) VALUES (
        _app.user_id, auth.uid(), _app.job_company_id, _employer_name, p_application_id, _app.job_id,
        p_position, COALESCE(p_country, _company.country), COALESCE(p_city, _company.city),
        p_salary, p_salary_currency, _salary_display,
        p_start_date, p_end_date, p_terms, p_terms_structured, p_benefits, p_work_schedule,
        p_visa_sponsorship, p_visa_details
    )
    RETURNING id INTO _contract_id;

    -- Record event
    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (_contract_id, auth.uid(), 'created',
            jsonb_build_object('position', p_position, 'from_application', p_application_id));

    -- Notify worker
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _app.user_id,
        'New Contract',
        'You have received a contract offer for "' || p_position || '". Please review and sign.',
        'contract',
        '/contracts/' || _contract_id
    );

    RETURN _contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- request_contract_cancellation() - Either party requests cancellation
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION request_contract_cancellation(
    p_contract_id UUID,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    _contract RECORD;
    _other_party UUID;
BEGIN
    SELECT * INTO _contract FROM contracts WHERE id = p_contract_id;

    IF _contract IS NULL THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;

    IF auth.uid() != _contract.worker_id AND auth.uid() != _contract.employer_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF _contract.status NOT IN ('activo', 'pendiente') THEN
        RAISE EXCEPTION 'Contract cannot be cancelled in its current state';
    END IF;

    UPDATE contracts
    SET status = 'cancelacion_solicitada',
        cancellation_requested_by = auth.uid(),
        cancellation_reason = p_reason,
        cancellation_date = now()
    WHERE id = p_contract_id;

    -- Determine the other party
    IF auth.uid() = _contract.worker_id THEN
        _other_party := _contract.employer_id;
    ELSE
        _other_party := _contract.worker_id;
    END IF;

    -- Record event
    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (p_contract_id, auth.uid(), 'cancellation_requested',
            jsonb_build_object('reason', p_reason));

    -- Notify other party
    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _other_party,
        'Cancellation Requested',
        'A cancellation has been requested for the contract "' || _contract.position || '".',
        'contract',
        '/contracts/' || p_contract_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- respond_to_cancellation() - Other party accepts or disputes
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION respond_to_cancellation(
    p_contract_id UUID,
    p_accept BOOLEAN
)
RETURNS VOID AS $$
DECLARE
    _contract RECORD;
    _requester UUID;
BEGIN
    SELECT * INTO _contract FROM contracts WHERE id = p_contract_id;

    IF _contract IS NULL THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;

    IF _contract.status != 'cancelacion_solicitada' THEN
        RAISE EXCEPTION 'No pending cancellation request';
    END IF;

    -- The responder must be the other party (not the requester)
    IF auth.uid() = _contract.cancellation_requested_by THEN
        RAISE EXCEPTION 'You cannot respond to your own cancellation request';
    END IF;

    IF auth.uid() != _contract.worker_id AND auth.uid() != _contract.employer_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    _requester := _contract.cancellation_requested_by;

    IF p_accept THEN
        UPDATE contracts
        SET status = 'cancelado'
        WHERE id = p_contract_id;

        INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
        VALUES (p_contract_id, auth.uid(), 'cancellation_accepted', '{}');

        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            _requester,
            'Cancellation Accepted',
            'The cancellation for "' || _contract.position || '" has been accepted.',
            'contract',
            '/contracts/' || p_contract_id
        );
    ELSE
        UPDATE contracts
        SET status = 'en_disputa'
        WHERE id = p_contract_id;

        INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
        VALUES (p_contract_id, auth.uid(), 'cancellation_disputed', '{}');

        INSERT INTO notifications (user_id, title, message, type, link)
        VALUES (
            _requester,
            'Cancellation Disputed',
            'The cancellation for "' || _contract.position || '" has been disputed.',
            'contract',
            '/contracts/' || p_contract_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- complete_contract() - Manual completion by employer
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION complete_contract(
    p_contract_id UUID
)
RETURNS VOID AS $$
DECLARE
    _contract RECORD;
BEGIN
    SELECT * INTO _contract FROM contracts WHERE id = p_contract_id;

    IF _contract IS NULL THEN
        RAISE EXCEPTION 'Contract not found';
    END IF;

    IF auth.uid() != _contract.employer_id THEN
        RAISE EXCEPTION 'Only the employer can complete this contract';
    END IF;

    IF _contract.status != 'activo' THEN
        RAISE EXCEPTION 'Only active contracts can be completed';
    END IF;

    UPDATE contracts
    SET status = 'completado',
        completed_at = now(),
        completed_by = auth.uid()
    WHERE id = p_contract_id;

    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (p_contract_id, auth.uid(), 'completed', '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- renew_contract() - Employer creates new contract linked to parent
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION renew_contract(
    p_parent_contract_id UUID,
    p_position TEXT DEFAULT NULL,
    p_salary NUMERIC DEFAULT NULL,
    p_salary_currency TEXT DEFAULT 'USD',
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_terms TEXT DEFAULT NULL,
    p_terms_structured JSONB DEFAULT '{}',
    p_benefits TEXT[] DEFAULT '{}',
    p_work_schedule TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    _parent RECORD;
    _contract_id UUID;
    _salary_display TEXT;
BEGIN
    SELECT * INTO _parent FROM contracts WHERE id = p_parent_contract_id;

    IF _parent IS NULL THEN
        RAISE EXCEPTION 'Parent contract not found';
    END IF;

    IF auth.uid() != _parent.employer_id THEN
        RAISE EXCEPTION 'Only the employer can renew this contract';
    END IF;

    IF _parent.status NOT IN ('completado', 'activo', 'expirado') THEN
        RAISE EXCEPTION 'Contract cannot be renewed in its current state';
    END IF;

    IF COALESCE(p_salary, _parent.salary) IS NOT NULL THEN
        _salary_display := COALESCE(p_salary_currency, _parent.salary_currency, 'USD') || ' ' ||
                           COALESCE(p_salary, _parent.salary) || '/month';
    END IF;

    INSERT INTO contracts (
        worker_id, employer_id, company_id, employer_name, job_id, parent_contract_id,
        position, country, city, salary, salary_currency, salary_display,
        start_date, end_date, terms, terms_structured, benefits, work_schedule,
        visa_sponsorship, visa_details
    ) VALUES (
        _parent.worker_id, _parent.employer_id, _parent.company_id, _parent.employer_name, _parent.job_id,
        p_parent_contract_id,
        COALESCE(p_position, _parent.position),
        _parent.country, _parent.city,
        COALESCE(p_salary, _parent.salary),
        COALESCE(p_salary_currency, _parent.salary_currency),
        _salary_display,
        p_start_date, p_end_date,
        COALESCE(p_terms, _parent.terms),
        COALESCE(p_terms_structured, _parent.terms_structured),
        COALESCE(p_benefits, _parent.benefits),
        COALESCE(p_work_schedule, _parent.work_schedule),
        _parent.visa_sponsorship, _parent.visa_details
    )
    RETURNING id INTO _contract_id;

    INSERT INTO contract_events (contract_id, actor_id, event_type, metadata)
    VALUES (_contract_id, auth.uid(), 'renewed',
            jsonb_build_object('parent_contract_id', p_parent_contract_id));

    INSERT INTO notifications (user_id, title, message, type, link)
    VALUES (
        _parent.worker_id,
        'Contract Renewal',
        'Your contract for "' || COALESCE(p_position, _parent.position) || '" has been renewed. Please review and sign.',
        'contract',
        '/contracts/' || _contract_id
    );

    RETURN _contract_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- auto_complete_expired_contracts() - Cron function
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auto_complete_expired_contracts()
RETURNS INTEGER AS $$
DECLARE
    _count INTEGER;
BEGIN
    WITH expired AS (
        UPDATE contracts
        SET status = 'expirado',
            completed_at = now()
        WHERE status = 'activo'
          AND end_date IS NOT NULL
          AND end_date < CURRENT_DATE
        RETURNING id, worker_id, employer_id, position
    )
    SELECT count(*) INTO _count FROM expired;

    -- Create notifications for expired contracts
    INSERT INTO notifications (user_id, title, message, type, link)
    SELECT worker_id, 'Contract Expired',
           'Your contract for "' || position || '" has expired.',
           'contract', '/contracts/' || id
    FROM contracts
    WHERE status = 'expirado' AND completed_at::DATE = CURRENT_DATE;

    INSERT INTO notifications (user_id, title, message, type, link)
    SELECT employer_id, 'Contract Expired',
           'The contract for "' || position || '" has expired.',
           'contract', '/contracts/' || id
    FROM contracts
    WHERE status = 'expirado' AND completed_at::DATE = CURRENT_DATE;

    RETURN _count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --------------------------------------------------------------------------
-- get_mutual_connections_count() - RPC for network
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_mutual_connections_count(
    p_user_a UUID,
    p_user_b UUID
)
RETURNS INTEGER AS $$
DECLARE
    _count INTEGER;
BEGIN
    SELECT COUNT(*) INTO _count
    FROM (
        -- Connections of user A
        SELECT CASE WHEN requester_id = p_user_a THEN addressee_id ELSE requester_id END AS connected_user
        FROM connections
        WHERE status = 'accepted'
          AND (requester_id = p_user_a OR addressee_id = p_user_a)
    ) a
    INNER JOIN (
        -- Connections of user B
        SELECT CASE WHEN requester_id = p_user_b THEN addressee_id ELSE requester_id END AS connected_user
        FROM connections
        WHERE status = 'accepted'
          AND (requester_id = p_user_b OR addressee_id = p_user_b)
    ) b ON a.connected_user = b.connected_user;

    RETURN _count;
END;
$$ LANGUAGE plpgsql STABLE;


-- --------------------------------------------------------------------------
-- get_suggested_connections() - RPC for discover tab
-- Returns users who share connections with the caller but are not yet connected
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_suggested_connections(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    country TEXT,
    role TEXT,
    mutual_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH my_connections AS (
        SELECT CASE WHEN requester_id = p_user_id THEN addressee_id ELSE requester_id END AS cid
        FROM connections
        WHERE status = 'accepted'
          AND (requester_id = p_user_id OR addressee_id = p_user_id)
    ),
    friends_of_friends AS (
        SELECT
            CASE WHEN c.requester_id = mc.cid THEN c.addressee_id ELSE c.requester_id END AS fof_id
        FROM connections c
        JOIN my_connections mc ON (c.requester_id = mc.cid OR c.addressee_id = mc.cid)
        WHERE c.status = 'accepted'
          AND CASE WHEN c.requester_id = mc.cid THEN c.addressee_id ELSE c.requester_id END != p_user_id
          AND CASE WHEN c.requester_id = mc.cid THEN c.addressee_id ELSE c.requester_id END NOT IN (SELECT cid FROM my_connections)
    )
    SELECT
        p.id AS user_id,
        p.full_name,
        p.avatar_url,
        p.country,
        p.role,
        COUNT(*) AS mutual_count
    FROM friends_of_friends fof
    JOIN profiles p ON p.id = fof.fof_id
    GROUP BY p.id, p.full_name, p.avatar_url, p.country, p.role
    ORDER BY mutual_count DESC, p.full_name
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;


-- ============================================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_activity ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- profiles RLS
-- --------------------------------------------------------------------------
CREATE POLICY profiles_select ON profiles
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY profiles_update ON profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------------
-- companies RLS
-- --------------------------------------------------------------------------
CREATE POLICY companies_select ON companies
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY companies_insert ON companies
    FOR INSERT TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY companies_update ON companies
    FOR UPDATE TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY companies_delete ON companies
    FOR DELETE TO authenticated
    USING (owner_id = auth.uid());

-- --------------------------------------------------------------------------
-- jobs RLS
-- --------------------------------------------------------------------------
CREATE POLICY jobs_select ON jobs
    FOR SELECT TO authenticated
    USING (
        status = 'active'
        OR employer_id = auth.uid()
    );

CREATE POLICY jobs_insert ON jobs
    FOR INSERT TO authenticated
    WITH CHECK (employer_id = auth.uid());

CREATE POLICY jobs_update ON jobs
    FOR UPDATE TO authenticated
    USING (employer_id = auth.uid())
    WITH CHECK (employer_id = auth.uid());

CREATE POLICY jobs_delete ON jobs
    FOR DELETE TO authenticated
    USING (employer_id = auth.uid());

-- --------------------------------------------------------------------------
-- applications RLS
-- --------------------------------------------------------------------------
CREATE POLICY applications_select ON applications
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid())
    );

CREATE POLICY applications_insert ON applications
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY applications_update ON applications
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        OR job_id IN (SELECT id FROM jobs WHERE employer_id = auth.uid())
    );

-- --------------------------------------------------------------------------
-- wallets RLS
-- --------------------------------------------------------------------------
CREATE POLICY wallets_select ON wallets
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY wallets_update ON wallets
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- transactions RLS
-- --------------------------------------------------------------------------
CREATE POLICY transactions_select ON transactions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY transactions_insert ON transactions
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND type NOT IN ('payment_sent', 'payment_received')
    );

-- --------------------------------------------------------------------------
-- contracts RLS
-- --------------------------------------------------------------------------
CREATE POLICY contracts_select ON contracts
    FOR SELECT TO authenticated
    USING (
        worker_id = auth.uid()
        OR employer_id = auth.uid()
    );

CREATE POLICY contracts_insert ON contracts
    FOR INSERT TO authenticated
    WITH CHECK (employer_id = auth.uid());

-- Updates go through RPC functions (SECURITY DEFINER)
-- No direct UPDATE policy needed beyond the RPCs

-- --------------------------------------------------------------------------
-- contract_events RLS
-- --------------------------------------------------------------------------
CREATE POLICY contract_events_select ON contract_events
    FOR SELECT TO authenticated
    USING (
        contract_id IN (
            SELECT id FROM contracts
            WHERE worker_id = auth.uid() OR employer_id = auth.uid()
        )
    );

CREATE POLICY contract_events_insert ON contract_events
    FOR INSERT TO authenticated
    WITH CHECK (actor_id = auth.uid());

-- --------------------------------------------------------------------------
-- notifications RLS
-- --------------------------------------------------------------------------
CREATE POLICY notifications_select ON notifications
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY notifications_update ON notifications
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY notifications_delete ON notifications
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- messages RLS
-- --------------------------------------------------------------------------
CREATE POLICY messages_select ON messages
    FOR SELECT TO authenticated
    USING (
        sender_id = auth.uid()
        OR receiver_id = auth.uid()
    );

CREATE POLICY messages_insert ON messages
    FOR INSERT TO authenticated
    WITH CHECK (sender_id = auth.uid());

CREATE POLICY messages_update ON messages
    FOR UPDATE TO authenticated
    USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

-- --------------------------------------------------------------------------
-- saved_jobs RLS
-- --------------------------------------------------------------------------
CREATE POLICY saved_jobs_select ON saved_jobs
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY saved_jobs_insert ON saved_jobs
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_jobs_delete ON saved_jobs
    FOR DELETE TO authenticated
    USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- connections RLS
-- --------------------------------------------------------------------------
CREATE POLICY connections_select_parties ON connections
    FOR SELECT TO authenticated
    USING (
        requester_id = auth.uid()
        OR addressee_id = auth.uid()
    );

CREATE POLICY connections_select_accepted_public ON connections
    FOR SELECT TO authenticated
    USING (status = 'accepted');

CREATE POLICY connections_insert ON connections
    FOR INSERT TO authenticated
    WITH CHECK (
        requester_id = auth.uid()
        AND connection_type = 'manual_connection'
    );

CREATE POLICY connections_update ON connections
    FOR UPDATE TO authenticated
    USING (
        addressee_id = auth.uid()
        AND status = 'pending'
    );

CREATE POLICY connections_delete ON connections
    FOR DELETE TO authenticated
    USING (
        requester_id = auth.uid()
        OR addressee_id = auth.uid()
    );

-- --------------------------------------------------------------------------
-- endorsements RLS
-- --------------------------------------------------------------------------
CREATE POLICY endorsements_select ON endorsements
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY endorsements_insert ON endorsements
    FOR INSERT TO authenticated
    WITH CHECK (
        endorser_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM connections
            WHERE status = 'accepted'
              AND (
                  (requester_id = auth.uid() AND addressee_id = endorsed_id)
                  OR (addressee_id = auth.uid() AND requester_id = endorsed_id)
              )
        )
    );

CREATE POLICY endorsements_update ON endorsements
    FOR UPDATE TO authenticated
    USING (endorser_id = auth.uid())
    WITH CHECK (endorser_id = auth.uid());

CREATE POLICY endorsements_delete ON endorsements
    FOR DELETE TO authenticated
    USING (
        endorser_id = auth.uid()
        OR endorsed_id = auth.uid()
    );

-- --------------------------------------------------------------------------
-- reviews RLS
-- --------------------------------------------------------------------------
CREATE POLICY reviews_select ON reviews
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY reviews_insert ON reviews
    FOR INSERT TO authenticated
    WITH CHECK (reviewer_id = auth.uid());

-- No UPDATE or DELETE for reviews

-- --------------------------------------------------------------------------
-- network_activity RLS
-- --------------------------------------------------------------------------
CREATE POLICY network_activity_select ON network_activity
    FOR SELECT TO authenticated
    USING (
        actor_id = auth.uid()
        OR visibility = 'public'
        OR (
            visibility = 'connections'
            AND EXISTS (
                SELECT 1 FROM connections
                WHERE status = 'accepted'
                  AND (
                      (requester_id = auth.uid() AND addressee_id = actor_id)
                      OR (addressee_id = auth.uid() AND requester_id = actor_id)
                  )
            )
        )
    );

-- No INSERT, UPDATE, DELETE for network_activity from clients (managed by triggers/functions)


-- ============================================================================
-- 6. REALTIME
-- ============================================================================

-- Enable realtime for messages and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;


-- ============================================================================
-- 7. STORAGE BUCKETS (comments - require Supabase Dashboard or API)
-- ============================================================================

-- Storage buckets must be created via Supabase Dashboard or management API:
--
-- BUCKET: avatars
--   - Public: true
--   - Max file size: 2MB (2097152 bytes)
--   - Allowed MIME types: image/jpeg, image/png, image/gif, image/webp
--   - Policy: authenticated users can upload to their own folder (uid/)
--   - Policy: anyone can read (public bucket)
--
-- BUCKET: documents
--   - Public: false
--   - Max file size: 10MB (10485760 bytes)
--   - Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp
--   - Policy: authenticated users can upload to their own folder (uid/)
--   - Policy: only owner can read their own files
--
-- BUCKET: cvs
--   - Public: false
--   - Max file size: 5MB (5242880 bytes)
--   - Allowed MIME types: application/pdf
--   - Policy: authenticated users can upload to their own folder (uid/)
--   - Policy: owner can read own files
--   - Policy: employers can read CVs of applicants to their jobs


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
