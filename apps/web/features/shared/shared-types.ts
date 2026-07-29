export type MembershipRow = {
  id: string;
  household_id: string;
  parent_member_id: string | null;
  role: "adult" | "child";
  user_id: string | null;
};

export function memberInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export function humanError(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
