-- Shared sign-in discovers the authenticated user's household before loading
-- the security-definer household snapshot. RLS still limits every result to
-- households the current user belongs to.
grant select on table public.household_members to authenticated;
