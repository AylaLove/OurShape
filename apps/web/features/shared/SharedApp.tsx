"use client";

import type { GameState } from "@family-game/domain";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GameShell } from "@/features/game/GameShell";
import type { LiveGameConnection } from "@/features/game/use-live-game-actions";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SupabaseGameRepository } from "@/lib/supabase-game-repository";
import {
  CreateHousehold,
  EmailSignIn,
  JoinHousehold,
  SharedStatus,
} from "./SharedOnboarding";
import { SharedControls } from "./SharedControls";
import { humanError, type MembershipRow } from "./shared-types";

type ReadyHousehold = {
  householdId: string;
  memberId: string;
  controllableMemberIds: string[];
  snapshot: GameState;
};

export function SharedApp() {
  const client = useMemo(() => createSupabaseBrowserClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState<ReadyHousehold | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const enterHousehold = useCallback(async (
    supabase: SupabaseClient,
    membership: MembershipRow,
  ) => {
    const { data: availableMembers, error: membersError } = await supabase
      .from("household_members")
      .select("id,household_id,parent_member_id,role,user_id")
      .eq("household_id", membership.household_id)
      .eq("active", true);
    if (membersError) throw new Error(`Could not load household profiles: ${membersError.message}`);

    const controllableMemberIds = (availableMembers as MembershipRow[])
      .filter((member) => (
        member.id === membership.id
        || (member.role === "child" && member.parent_member_id === membership.id)
      ))
      .map((member) => member.id);
    const repository = new SupabaseGameRepository(supabase);
    const snapshot = await repository.loadHouseholdSnapshot(
      membership.household_id,
      membership.id,
    );
    setReady({
      householdId: membership.household_id,
      memberId: membership.id,
      controllableMemberIds,
      snapshot,
    });
  }, []);

  const discoverMembership = useCallback(async (
    supabase: SupabaseClient,
    currentSession: Session,
  ) => {
    const { data, error: membershipError } = await supabase
      .from("household_members")
      .select("id,household_id,parent_member_id,role,user_id")
      .eq("user_id", currentSession.user.id)
      .eq("active", true)
      .maybeSingle();
    if (membershipError) throw new Error(`Could not check household access: ${membershipError.message}`);
    if (data) await enterHousehold(supabase, data as MembershipRow);
  }, [enterHousehold]);

  useEffect(() => {
    if (!client) {
      setError("The shared database connection is not configured for this version.");
      setLoading(false);
      return;
    }
    const supabase = client;

    let active = true;
    async function start() {
      try {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("code");
          window.history.replaceState({}, "", cleanUrl);
        }
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!active) return;
        setSession(data.session);
        if (data.session) await discoverMembership(supabase, data.session);
      } catch (cause) {
        if (active) setError(humanError(cause));
      } finally {
        if (active) setLoading(false);
      }
    }
    void start();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) setReady(null);
    });
    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [client, discoverMembership]);

  if (loading) return <SharedStatus title="Opening your home..." />;
  if (error) return <SharedStatus title="We could not open the shared home" detail={error} />;
  if (!client) return <SharedStatus title="Shared access is not configured" />;
  if (!session) return <EmailSignIn client={client} />;

  if (!ready) {
    const inviteToken = new URL(window.location.href).searchParams.get("invite");
    if (inviteToken) {
      return (
        <JoinHousehold
          client={client}
          token={inviteToken}
          onReady={(membership) => void enterHousehold(client, membership)}
        />
      );
    }
    return (
      <CreateHousehold
        client={client}
        onReady={async (membership, link) => {
          setInviteLink(link);
          await enterHousehold(client, membership);
        }}
      />
    );
  }

  const liveConnection: LiveGameConnection = {
    householdId: ready.householdId,
    initialMemberId: ready.memberId,
    controllableMemberIds: ready.controllableMemberIds,
    repository: new SupabaseGameRepository(client),
  };

  return (
    <GameShell
      initialState={ready.snapshot}
      liveConnection={liveConnection}
      headerControls={<SharedControls
        client={client}
        householdId={ready.householdId}
        inviteLink={inviteLink}
        onInviteLink={setInviteLink}
      />}
    />
  );
}
