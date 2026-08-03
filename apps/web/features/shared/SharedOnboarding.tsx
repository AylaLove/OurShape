"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { Mail, UserPlus, Users } from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { SupabaseHouseholdOnboarding } from "@/lib/supabase-household-onboarding";
import { authErrorMessage } from "./auth-message";
import styles from "./SharedApp.module.css";
import {
  humanError,
  memberInitials,
  type MembershipRow,
} from "./shared-types";

function SharedFrame({ children }: { children: ReactNode }) {
  return <main className={styles.frame}><section className={styles.panel}>{children}</section></main>;
}

export function SharedStatus({ title, detail }: { title: string; detail?: string }) {
  return (
    <SharedFrame>
      <div className={styles.pulse} aria-hidden="true" />
      <h1>{title}</h1>
      {detail ? <p className={styles.error}>{detail}</p> : null}
    </SharedFrame>
  );
}

export function EmailSignIn({ client }: { client: SupabaseClient }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const redirectUrl = new URL(window.location.href);
    redirectUrl.searchParams.delete("code");
    const { error: signInError } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectUrl.toString() },
    });
    if (signInError) setError(authErrorMessage(signInError));
    else setSent(true);
    setBusy(false);
  }

  return (
    <SharedFrame>
      <Mail size={32} aria-hidden="true" />
      <p className={styles.eyebrow}>SHARED HOUSEHOLD</p>
      <h1>{sent ? "Check your email" : "Open Our Shape"}</h1>
      <p className={styles.intro}>
        {sent
          ? "Tap the secure link we sent. It will bring you back to your household."
          : "Adults sign in by email. No password to remember."}
      </p>
      {sent ? (
        <button className={styles.secondaryButton} type="button" onClick={() => setSent(false)}>
          Use a different email
        </button>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <label>
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button className={styles.primaryButton} type="submit" disabled={busy}>
            {busy ? "Sending..." : "Email me a sign-in link"}
          </button>
        </form>
      )}
    </SharedFrame>
  );
}

export function CreateHousehold({
  client,
  onReady,
}: {
  client: SupabaseClient;
  onReady: (membership: MembershipRow, inviteLink: string) => Promise<void>;
}) {
  const [homeName, setHomeName] = useState("Our Home");
  const [adultName, setAdultName] = useState("Ayla");
  const [childName, setChildName] = useState("Sage");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const onboarding = new SupabaseHouseholdOnboarding(client);
      const setup = await onboarding.createHouseholdSetup({
        homeName: homeName.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Johannesburg",
        ownerName: adultName.trim(),
        ownerInitials: memberInitials(adultName),
        childName: childName.trim(),
        childInitials: memberInitials(childName),
      });
      const inviteUrl = new URL("/shared/", window.location.origin);
      inviteUrl.searchParams.set("invite", setup.inviteToken);
      await onReady(toMembershipRow(setup), inviteUrl.toString());
    } catch (cause) {
      setError(humanError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SharedFrame>
      <Users size={34} aria-hidden="true" />
      <p className={styles.eyebrow}>FIRST SETUP</p>
      <h1>Create your home</h1>
      <p className={styles.intro}>This creates one private household and one managed child profile.</p>
      <form className={styles.form} onSubmit={submit}>
        <label>Household name<input required value={homeName} onChange={(event) => setHomeName(event.target.value)} /></label>
        <label>Your name<input required value={adultName} onChange={(event) => setAdultName(event.target.value)} /></label>
        <label>Child’s name<input required value={childName} onChange={(event) => setChildName(event.target.value)} /></label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.primaryButton} type="submit" disabled={busy}>
          {busy ? "Creating your home..." : "Create our home"}
        </button>
      </form>
    </SharedFrame>
  );
}

export function JoinHousehold({
  client,
  token,
  onReady,
}: {
  client: SupabaseClient;
  token: string;
  onReady: (membership: MembershipRow) => void;
}) {
  const [name, setName] = useState("Raen");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const membership = await new SupabaseHouseholdOnboarding(client).acceptAdultInvite(
        token,
        name.trim(),
        memberInitials(name),
      );
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("invite");
      window.history.replaceState({}, "", cleanUrl);
      onReady(toMembershipRow(membership));
    } catch (cause) {
      setError(humanError(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SharedFrame>
      <UserPlus size={34} aria-hidden="true" />
      <p className={styles.eyebrow}>HOUSEHOLD INVITATION</p>
      <h1>Join the home</h1>
      <p className={styles.intro}>Your work, thanks, and points will be shared with this household.</p>
      <form className={styles.form} onSubmit={submit}>
        <label>Your name<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.primaryButton} type="submit" disabled={busy}>
          {busy ? "Joining..." : "Join this household"}
        </button>
      </form>
    </SharedFrame>
  );
}

function toMembershipRow(membership: { householdId: string; memberId: string }): MembershipRow {
  return {
    id: membership.memberId,
    household_id: membership.householdId,
    parent_member_id: null,
    role: "adult",
    user_id: null,
  };
}
