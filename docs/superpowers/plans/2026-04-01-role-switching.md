# Role Switching Bidireccional — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow any user to switch between Worker and Employer portals from the avatar dropdown, without losing data or creating a new account.

**Architecture:** Add an `active_role` column to `profiles` that controls routing and UI. A Server Action toggles it. The dropdown gets a `RoleSwitchButton` component. First-time switches redirect to complete the missing role's profile.

**Tech Stack:** Next.js 16, Supabase (PostgreSQL), React 19, Server Actions, shadcn/ui, Framer Motion, Lucide icons

**Spec:** `docs/superpowers/specs/2026-04-01-role-switching-design.md`

---

### Task 1: Database Migration — Add `active_role` column

**Files:**
- Create: `supabase/migrations/00004_active_role.sql`

This project has no test runner configured. Skip TDD steps for database migrations.

- [ ] **Step 1: Create migration file**

```sql
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
```

- [ ] **Step 2: Run migration in Supabase**

Apply the migration via the Supabase Dashboard SQL editor or CLI:

```bash
# If using Supabase CLI:
npx supabase db push
# Otherwise: paste the SQL into Supabase Dashboard > SQL Editor and run
```

- [ ] **Step 3: Verify migration**

In Supabase Dashboard > Table Editor > profiles, confirm:
- `active_role` column exists
- All existing rows have `active_role` populated (matching their `role` value)

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/00004_active_role.sql
git commit -m "feat: add active_role column to profiles for role switching"
```

---

### Task 2: Server Action — `switchRole`

**Files:**
- Create: `src/lib/actions/role-switch.ts`

- [ ] **Step 1: Create the Server Action file**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function switchRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get current active role
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_role")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const newRole = profile.active_role === "worker" ? "employer" : "worker";

  // Update active_role
  await supabase
    .from("profiles")
    .update({ active_role: newRole })
    .eq("id", user.id);

  // Determine redirect destination
  if (newRole === "employer") {
    // Check if company exists
    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    redirect(company ? "/employer/dashboard" : "/employer/company-profile");
  } else {
    // Check if worker profile is complete
    const { data: workerProfile } = await supabase
      .from("profiles")
      .select("profile_complete")
      .eq("id", user.id)
      .single();

    redirect(workerProfile?.profile_complete ? "/dashboard" : "/profile");
  }
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd syneria && npx tsc --noEmit src/lib/actions/role-switch.ts 2>&1 || true
```

No errors expected (Server Action using same patterns as existing actions like `src/lib/actions/contracts.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/actions/role-switch.ts
git commit -m "feat: add switchRole server action"
```

---

### Task 3: Update `useProfile` hook — read `active_role`

**Files:**
- Modify: `src/hooks/useProfile.ts`

- [ ] **Step 1: Update the SELECT query and interface**

In `src/hooks/useProfile.ts`, make these changes:

1. Add `active_role` to the `UserProfile` interface (line 9, after `role`):

```typescript
interface UserProfile {
  firstName: string;
  lastName: string;
  role: string;
  activeRole: string;
  avatarUrl: string | null;
}
```

2. Update the SELECT query (line 29) to include `active_role`:

```typescript
      .select("full_name, role, active_role, avatar_url")
```

3. Update the profile object creation inside the `if (data)` block (lines 33-39) to include `activeRole`:

```typescript
        if (data) {
          const parts = (data.full_name ?? "Usuario").split(" ");
          setProfile({
            firstName: parts[0] ?? "Usuario",
            lastName: parts.slice(1).join(" ") ?? "",
            role: data.role ?? "worker",
            activeRole: data.active_role ?? data.role ?? "worker",
            avatarUrl: data.avatar_url ?? null,
          });
```

4. Update the fallback block (lines 41-51) similarly:

```typescript
        } else {
          const meta = user.user_metadata;
          const fullName = meta?.full_name ?? user.email?.split("@")[0] ?? "Usuario";
          const parts = fullName.split(" ");
          setProfile({
            firstName: parts[0] ?? "Usuario",
            lastName: parts.slice(1).join(" ") ?? "",
            role: meta?.role ?? "worker",
            activeRole: meta?.role ?? "worker",
            avatarUrl: meta?.avatar_url ?? null,
          });
        }
```

5. Change `roleLabel` (line 71-72) to use `activeRole`:

```typescript
  const roleLabel =
    profile?.activeRole === "employer" ? "Empresa" : "Worker";
```

6. Add `activeRole` to the return object (after line 79):

```typescript
  return {
    profile,
    loading,
    displayName,
    initials,
    roleLabel,
    activeRole: (profile?.activeRole ?? "worker") as "worker" | "employer",
    avatarUrl: profile?.avatarUrl ?? null,
  };
```

- [ ] **Step 2: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProfile.ts
git commit -m "feat: useProfile reads active_role for role switching"
```

---

### Task 4: Create `RoleSwitchButton` component

**Files:**
- Create: `src/components/shared/role-switch-button.tsx`

- [ ] **Step 1: Create the component**

```typescript
"use client";

import { useState } from "react";
import { Building2, User, ArrowLeftRight } from "lucide-react";
import { switchRole } from "@/lib/actions/role-switch";

interface RoleSwitchButtonProps {
  activeRole: "worker" | "employer";
}

export function RoleSwitchButton({ activeRole }: RoleSwitchButtonProps) {
  const [loading, setLoading] = useState(false);

  const isWorker = activeRole === "worker";
  const targetLabel = isWorker ? "Cambiar a Empresa" : "Cambiar a Worker";
  const targetDescription = isWorker
    ? "Publicar vacantes y contratar"
    : "Buscar empleos y aplicar";
  const Icon = isWorker ? Building2 : User;

  async function handleSwitch() {
    setLoading(true);
    await switchRole();
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={loading}
      className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 transition-all ${
        isWorker
          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100"
          : "border-blue-200 bg-gradient-to-r from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100"
      } ${loading ? "opacity-60" : ""}`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-md ${
          isWorker ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {loading ? (
          <ArrowLeftRight className="h-3.5 w-3.5 animate-spin text-white" />
        ) : (
          <Icon className="h-3.5 w-3.5 text-white" />
        )}
      </div>
      <div className="text-left">
        <p
          className={`text-[13px] font-semibold ${
            isWorker ? "text-green-700" : "text-blue-700"
          }`}
        >
          {targetLabel}
        </p>
        <p className="text-[11px] text-muted-foreground">{targetDescription}</p>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/role-switch-button.tsx
git commit -m "feat: add RoleSwitchButton component for role switching"
```

---

### Task 5: Integrate `RoleSwitchButton` into TopBar dropdown

**Files:**
- Modify: `src/components/shared/top-bar.tsx`

- [ ] **Step 1: Add import and prop**

Add to imports (after line 4):

```typescript
import { Building2 } from "lucide-react";
import { RoleSwitchButton } from "@/components/shared/role-switch-button";
```

Add `activeRole` to the `TopBarProps` interface (after `userRole`, around line 37):

```typescript
  /** Active role for switch button */
  activeRole?: "worker" | "employer";
```

Add `activeRole = "worker"` to the destructured props (after `userRole = "Worker"`, around line 62):

```typescript
  activeRole = "worker",
```

- [ ] **Step 2: Add the button inside the dropdown**

In the user avatar dropdown `DropdownMenuContent` (line 211), insert the `RoleSwitchButton` between the user label and the menu items. Replace lines 211-246 with:

```typescript
          <DropdownMenuContent align="end" sideOffset={8} className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="px-1 py-1">
              <RoleSwitchButton activeRole={activeRole} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = profileHref;
              }}
            >
              <User className="mr-2 h-4 w-4" />
              {t("nav.myProfile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = profileHref;
              }}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={async () => {
                await fetch("/api/auth/signout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
```

Note: width changed from `w-48` to `w-56` to accommodate the switch button.

- [ ] **Step 3: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/top-bar.tsx
git commit -m "feat: integrate RoleSwitchButton into TopBar dropdown"
```

---

### Task 6: Pass `activeRole` from layouts to TopBar

**Files:**
- Modify: `src/app/(worker)/layout.tsx`
- Modify: `src/app/(employer)/layout.tsx`

- [ ] **Step 1: Update Worker layout**

In `src/app/(worker)/layout.tsx`, update line 25 to destructure `activeRole`:

```typescript
  const { displayName, initials, roleLabel, activeRole, avatarUrl } = useProfile();
```

Add `activeRole` prop to `TopBar` (after `userRole={roleLabel}`, around line 40):

```typescript
        <TopBar
          mobileMenuTrigger={<WorkerMobileSidebar />}
          userName={displayName}
          userInitials={initials}
          userAvatarUrl={avatarUrl ?? undefined}
          userRole={roleLabel}
          activeRole={activeRole}
          unreadCount={0}
        />
```

- [ ] **Step 2: Update Employer layout**

In `src/app/(employer)/layout.tsx`, update line 25 to destructure `activeRole`:

```typescript
  const { displayName, initials, roleLabel, activeRole, avatarUrl } = useProfile();
```

Add `activeRole` prop to `TopBar` (after `userRole={roleLabel}`, around line 40):

```typescript
        <TopBar
          mobileMenuTrigger={<EmployerMobileSidebar />}
          userName={displayName}
          userInitials={initials}
          userAvatarUrl={avatarUrl ?? undefined}
          userRole={roleLabel}
          activeRole={activeRole}
          profileHref="/employer/profile"
          unreadCount={0}
        />
```

- [ ] **Step 3: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(worker)/layout.tsx src/app/(employer)/layout.tsx
git commit -m "feat: pass activeRole from layouts to TopBar"
```

---

### Task 7: Update Middleware — read `active_role`

**Files:**
- Modify: `src/middleware.ts`

- [ ] **Step 1: Update all role queries in middleware**

There are 3 places in `src/middleware.ts` where `role` is queried from profiles. Update all of them:

1. **Lines 33-39** (public route redirect for authenticated users on `/`):

Replace:
```typescript
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.role === "employer" ? "/employer/dashboard" : "/dashboard";
```

With:
```typescript
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.active_role === "employer" ? "/employer/dashboard" : "/dashboard";
```

2. **Lines 49-56** (auth route redirect for authenticated users):

Replace:
```typescript
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.role === "employer" ? "/employer/dashboard" : "/dashboard";
```

With:
```typescript
      const { data: profile } = await supabase
        .from("profiles")
        .select("active_role")
        .eq("id", user.id)
        .single();
      const dest =
        profile?.active_role === "employer" ? "/employer/dashboard" : "/dashboard";
```

3. **Lines 69-75** (role-based access enforcement):

Replace:
```typescript
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
```

With:
```typescript
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_role")
    .eq("id", user.id)
    .single();

  const role = profile?.active_role;
```

The rest of the middleware (lines 77-88, the redirect logic) uses the `role` variable and needs no changes.

- [ ] **Step 2: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: middleware reads active_role for role-based routing"
```

---

### Task 8: Update Auth flows — read `active_role`

**Files:**
- Modify: `src/hooks/useAuth.ts`
- Modify: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Update `useAuth` sign-in redirect**

In `src/hooks/useAuth.ts`, update the `signInWithEmail` function. Replace lines 39-46:

```typescript
          const { data: profile } = await supabase
            .from("profiles")
            .select("active_role")
            .eq("id", user.id)
            .single();

          const dest =
            profile?.active_role === "employer" ? "/employer/dashboard" : "/dashboard";
```

- [ ] **Step 2: Update auth callback redirect**

In `src/app/auth/callback/route.ts`, update the profile query and redirect logic. Replace lines 19-36:

```typescript
        const { data: profile } = await supabase
          .from("profiles")
          .select("active_role, profile_complete")
          .eq("id", user.id)
          .single();

        if (profile) {
          let redirect: string;

          if (profile.active_role === "employer") {
            redirect = profile.profile_complete
              ? "/employer/dashboard"
              : "/employer/company-profile";
          } else {
            redirect = profile.profile_complete
              ? "/dashboard"
              : "/profile";
          }

          return NextResponse.redirect(new URL(redirect, origin));
        }
```

- [ ] **Step 3: Verify it compiles**

```bash
cd syneria && npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAuth.ts src/app/auth/callback/route.ts
git commit -m "feat: auth flows use active_role for post-login redirects"
```

---

### Task 9: Build and manual verification

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

```bash
cd syneria && npm run build
```

Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 2: Run dev server and test**

```bash
cd syneria && npm run dev
```

Manual test checklist:
1. Log in as a Worker account
2. Click avatar dropdown → verify "Cambiar a Empresa" button appears (green)
3. Click it → should redirect to `/employer/company-profile` (first time)
4. Verify employer sidebar and nav appear
5. Click avatar dropdown → verify "Cambiar a Worker" button appears (blue)
6. Click it → should redirect to `/dashboard`
7. Verify worker sidebar and nav appear
8. Log in as an Employer account and repeat the reverse flow

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete bidirectional role switching between Worker and Employer"
```
