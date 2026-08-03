import type { SupabaseClient } from "@supabase/supabase-js";

type MembershipResult = {
  householdId: string;
  memberId: string;
};

type HouseholdSetupResult = MembershipResult & {
  childMemberId: string;
  inviteToken: string;
};

function fail(context: string, error: { message: string } | null): void {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function membership(data: unknown): MembershipResult {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error("Membership setup returned no result.");
  const result = row as { household_id?: string; member_id?: string };
  if (!result.household_id || !result.member_id) throw new Error("Membership setup returned an invalid result.");
  return { householdId: result.household_id, memberId: result.member_id };
}

function householdSetup(data: unknown): HouseholdSetupResult {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") throw new Error("Household setup returned no result.");
  const result = row as {
    household_id?: string;
    member_id?: string;
    child_member_id?: string;
    invite_token?: string;
  };
  if (!result.household_id || !result.member_id || !result.child_member_id || !result.invite_token) {
    throw new Error("Household setup returned an invalid result.");
  }
  return {
    householdId: result.household_id,
    memberId: result.member_id,
    childMemberId: result.child_member_id,
    inviteToken: result.invite_token,
  };
}

export class SupabaseHouseholdOnboarding {
  constructor(private readonly client: SupabaseClient) {}

  async createHouseholdSetup(input: {
    homeName: string;
    timezone: string;
    ownerName: string;
    ownerInitials: string;
    childName: string;
    childInitials: string;
    ownerColour?: string;
    childColour?: string;
  }): Promise<HouseholdSetupResult> {
    const { data, error } = await this.client.rpc("create_household_setup", {
      home_name: input.homeName,
      home_timezone: input.timezone,
      owner_name: input.ownerName,
      owner_initials: input.ownerInitials,
      child_name: input.childName,
      child_initials: input.childInitials,
      owner_colour: input.ownerColour ?? "#ef6d5b",
      child_colour: input.childColour ?? "#e2aa37",
    });
    fail("Could not create the home", error);
    return householdSetup(data);
  }

  async createHousehold(
    homeName: string,
    timezone: string,
    ownerName: string,
    ownerInitials: string,
    ownerColour = "#ef6d5b",
  ): Promise<MembershipResult> {
    const { data, error } = await this.client.rpc("create_household_with_owner", {
      home_name: homeName,
      home_timezone: timezone,
      owner_name: ownerName,
      owner_initials: ownerInitials,
      owner_colour: ownerColour,
    });
    fail("Could not create the household", error);
    return membership(data);
  }

  async addManagedChild(
    householdId: string,
    childName: string,
    childInitials: string,
    childColour = "#e2aa37",
  ): Promise<string> {
    const { data, error } = await this.client.rpc("add_managed_child", {
      target_household: householdId,
      child_name: childName,
      child_initials: childInitials,
      child_colour: childColour,
    });
    fail("Could not add the child profile", error);
    if (typeof data !== "string") throw new Error("Child profile setup returned an invalid result.");
    return data;
  }

  async createAdultInvite(householdId: string, validHours = 72): Promise<string> {
    const { data, error } = await this.client.rpc("create_household_invite", {
      target_household: householdId,
      valid_hours: validHours,
    });
    fail("Could not create the household invitation", error);
    if (typeof data !== "string") throw new Error("The household invitation was invalid.");
    return data;
  }

  async acceptAdultInvite(
    token: string,
    name: string,
    initials: string,
    colour = "#3c7f9d",
  ): Promise<MembershipResult> {
    const { data, error } = await this.client.rpc("accept_household_invite", {
      invite_token: token,
      adult_name: name,
      adult_initials: initials,
      adult_colour: colour,
    });
    fail("Could not join the household", error);
    return membership(data);
  }

  async createChildDeviceCode(childMemberId: string, validMinutes = 10): Promise<string> {
    const { data, error } = await this.client.rpc("create_child_device_code", {
      target_child: childMemberId,
      valid_minutes: validMinutes,
    });
    fail("Could not create the child device code", error);
    if (typeof data !== "string") throw new Error("The child device code was invalid.");
    return data;
  }

  async claimChildDevice(code: string): Promise<MembershipResult> {
    const { data, error } = await this.client.rpc("claim_child_device", {
      device_code: code,
    });
    fail("Could not connect the child device", error);
    return membership(data);
  }

  async revokeChildDevice(accessId: string): Promise<void> {
    const { error } = await this.client.rpc("revoke_child_device", {
      target_access: accessId,
    });
    fail("Could not disconnect the child device", error);
  }
}
