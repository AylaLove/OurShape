import type { HouseholdMember } from "@family-game/domain";
import { ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";

export function ProfileSwitcher({
  members,
  activeMember,
  onChange,
}: {
  members: HouseholdMember[];
  activeMember: HouseholdMember;
  onChange: (memberId: string) => void;
}) {
  return (
    <label className="profile-switcher">
      <span className="sr-only">Playing as</span>
      <span className="profile-switcher__avatar" style={{ "--member-colour": activeMember.colour } as CSSProperties}>{activeMember.initials}</span>
      <select value={activeMember.id} onChange={(event) => onChange(event.target.value)} aria-label="Playing as">
        {members.map((member) => <option key={member.id} value={member.id}>{member.displayName}</option>)}
      </select>
      <ChevronDown size={15} aria-hidden="true" />
    </label>
  );
}
