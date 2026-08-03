import { describe, expect, it, vi } from "vitest";
import { executeLiveAction } from "./live-game-action";

describe("executeLiveAction", () => {
  it("reports success only after the action and refreshed state both succeed", async () => {
    const refreshedState = { householdId: "home-one" };

    const result = await executeLiveAction(
      vi.fn().mockResolvedValue(undefined),
      vi.fn().mockResolvedValue(refreshedState),
    );

    expect(result).toEqual({ ok: true, value: refreshedState });
  });

  it("does not report success or refresh after the database action fails", async () => {
    const refresh = vi.fn();

    const result = await executeLiveAction(
      vi.fn().mockRejectedValue(new Error("Could not send thanks")),
      refresh,
    );

    expect(result).toEqual({ ok: false, message: "Could not send thanks" });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("does not report success when the refreshed state cannot be confirmed", async () => {
    const result = await executeLiveAction(
      vi.fn().mockResolvedValue(undefined),
      vi.fn().mockRejectedValue(new Error("Could not reload the household")),
    );

    expect(result).toEqual({
      ok: false,
      message: "Could not reload the household",
    });
  });
});
