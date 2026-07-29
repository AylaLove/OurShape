"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { Check, Copy, LogOut, MoreHorizontal, UserPlus } from "lucide-react";
import { useState } from "react";
import { SupabaseHouseholdOnboarding } from "@/lib/supabase-household-onboarding";
import styles from "./SharedApp.module.css";

export function SharedControls({
  client,
  householdId,
  inviteLink,
  onInviteLink,
}: {
  client: SupabaseClient;
  householdId: string;
  inviteLink: string | null;
  onInviteLink: (value: string) => void;
}) {
  const [open, setOpen] = useState(Boolean(inviteLink));
  const [copied, setCopied] = useState(false);

  async function createInvite() {
    const token = await new SupabaseHouseholdOnboarding(client).createAdultInvite(householdId);
    const url = new URL("/shared/", window.location.origin);
    url.searchParams.set("invite", token);
    onInviteLink(url.toString());
    setOpen(true);
  }

  async function copyInvite() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={styles.controls}>
      <button
        type="button"
        aria-label="Shared household options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={19} />
      </button>
      {open ? (
        <div className={styles.invite}>
          <button type="button" className={styles.close} aria-label="Close invitation" onClick={() => setOpen(false)}>×</button>
          <strong>Shared household</strong>
          <p>{inviteLink ? "The private adult invitation is ready." : "Invite another adult when you are ready."}</p>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void (inviteLink ? copyInvite() : createInvite())}
          >
            {inviteLink
              ? (copied ? <Check size={18} /> : <Copy size={18} />)
              : <UserPlus size={18} />}
            {inviteLink ? (copied ? "Copied" : "Copy invitation link") : "Create invitation link"}
          </button>
          <button type="button" className={styles.menuButton} onClick={() => void client.auth.signOut()}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
