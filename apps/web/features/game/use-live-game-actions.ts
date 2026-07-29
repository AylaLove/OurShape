"use client";

import type { GameState } from "@family-game/domain";
import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import type { AppScreen } from "@/components/AppNav";
import type { GameRepository } from "@/lib/game-repository";
import type { HomeDinosaurState } from "@/features/companion/companion-state";

export interface LiveGameConnection {
  householdId: string;
  initialMemberId: string;
  controllableMemberIds: string[];
  repository: GameRepository;
}

type Options = {
  close?: boolean;
  moment?: HomeDinosaurState | null;
};

export function useLiveGameActions({
  connection,
  activeMemberId,
  state,
  section,
  setState,
  setSection,
  setActiveMemberId,
  setSelectedQuestId,
  setToast,
  setCompanionMoment,
}: {
  connection?: LiveGameConnection;
  activeMemberId: string;
  state: GameState;
  section: AppScreen;
  setState: Dispatch<SetStateAction<GameState>>;
  setSection: Dispatch<SetStateAction<AppScreen>>;
  setActiveMemberId: Dispatch<SetStateAction<string>>;
  setSelectedQuestId: Dispatch<SetStateAction<string | null>>;
  setToast: Dispatch<SetStateAction<string | null>>;
  setCompanionMoment: Dispatch<SetStateAction<HomeDinosaurState | null>>;
}) {
  const [busy, setBusy] = useState(false);

  async function runLiveAction(
    action: () => Promise<void>,
    successMessage: string,
    options: Options = {},
  ) {
    if (!connection || busy) return;
    setBusy(true);
    try {
      await action();
      setState(await connection.repository.loadHouseholdSnapshot(
        connection.householdId,
        activeMemberId,
      ));
      setToast(successMessage);
      if (options.moment) setCompanionMoment(options.moment);
      if (options.close) setSelectedQuestId(null);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "That did not work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function changeActiveMember(memberId: string) {
    setActiveMemberId(memberId);
    setSelectedQuestId(null);
    const member = state.household.members.find((entry) => entry.id === memberId);
    if (section === "quests" || (member?.role === "child" && section === "family")) {
      setSection("today");
    }
    if (!connection) return;
    setBusy(true);
    try {
      setState(await connection.repository.loadHouseholdSnapshot(
        connection.householdId,
        memberId,
      ));
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not switch profile.");
    } finally {
      setBusy(false);
    }
  }

  return { runLiveAction, changeActiveMember };
}
