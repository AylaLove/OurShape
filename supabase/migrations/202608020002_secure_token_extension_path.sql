-- Supabase installs pgcrypto in the protected extensions schema. Keep the
-- security-definer functions' search paths explicit so token hashing and
-- generation work without exposing an untrusted schema.
alter function public.create_household_invite(uuid, integer)
  set search_path = public, extensions;

alter function public.accept_household_invite(text, text, text, text)
  set search_path = public, extensions;

alter function public.create_child_device_code(uuid, integer)
  set search_path = public, extensions;

alter function public.claim_child_device(text)
  set search_path = public, extensions;
