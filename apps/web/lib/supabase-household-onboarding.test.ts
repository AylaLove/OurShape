import { describe, expect, it, vi } from "vitest";
import { SupabaseHouseholdOnboarding } from "./supabase-household-onboarding";

describe("SupabaseHouseholdOnboarding.createHouseholdSetup", () => {
  it("creates the complete household through one database operation", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [{
        household_id: "household-1",
        member_id: "adult-1",
        child_member_id: "child-1",
        invite_token: "invite-1",
      }],
      error: null,
    });
    const onboarding = new SupabaseHouseholdOnboarding({ rpc } as never);

    await expect(onboarding.createHouseholdSetup({
      homeName: "Our Home",
      timezone: "Africa/Johannesburg",
      ownerName: "Ayla",
      ownerInitials: "A",
      childName: "Sage",
      childInitials: "S",
    })).resolves.toEqual({
      householdId: "household-1",
      memberId: "adult-1",
      childMemberId: "child-1",
      inviteToken: "invite-1",
    });
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("create_household_setup", expect.objectContaining({
      home_name: "Our Home",
      child_name: "Sage",
    }));
  });

  it("reports a failed transaction without returning partial setup data", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { message: "starter quest failed" },
    });
    const onboarding = new SupabaseHouseholdOnboarding({ rpc } as never);

    await expect(onboarding.createHouseholdSetup({
      homeName: "Our Home",
      timezone: "Africa/Johannesburg",
      ownerName: "Ayla",
      ownerInitials: "A",
      childName: "Sage",
      childInitials: "S",
    })).rejects.toThrow("Could not create the home: starter quest failed");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
