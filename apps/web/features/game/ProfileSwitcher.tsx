import type { HouseholdMember } from "@family-game/domain";
import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";

export function ProfileSwitcher({
  members,
  activeMember,
  onChange,
  compact = false,
  points,
}: {
  members: HouseholdMember[];
  activeMember: HouseholdMember;
  onChange: (memberId: string) => void;
  compact?: boolean;
  points?: number;
}) {
  return (
    <label className={compact ? "profile-switcher profile-switcher--compact" : "profile-switcher"} aria-label={compact && points !== undefined ? `${activeMember.displayName}, ${points} ${activeMember.pointLabel}` : undefined}>
      <span className="sr-only">Playing as</span>
      <span className="profile-switcher__avatar" style={{ "--member-colour": activeMember.colour } as CSSProperties}>{activeMember.initials}</span>
      {compact && points !== undefined ? <span className="profile-switcher__points" aria-hidden="true">{points}</span> : null}
      <select value={activeMember.id} onChange={(event) => onChange(event.target.value)} aria-label="Playing as">
        {members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
      </select>
      <ChevronDown size={15} aria-hidden="true" />
    </label>
  );
}
