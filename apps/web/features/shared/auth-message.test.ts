import { describe, expect, it } from "vitest";
import { authErrorMessage } from "./auth-message";

describe("authErrorMessage", () => {
  it("turns rate limits into a useful retry instruction", () => {
    expect(
      authErrorMessage({
        code: "over_email_send_rate_limit",
        message: "email rate limit exceeded",
        status: 429,
      }),
    ).toBe(
      "We have sent enough links for now. Please wait an hour, then request one new link.",
    );
  });

  it("explains when the built-in sender has not authorized an address", () => {
    expect(
      authErrorMessage({ message: "Email address not authorized" }),
    ).toBe(
      "This email cannot receive a link yet. Ask the household owner to add it.",
    );
  });

  it("does not expose unexpected technical errors", () => {
    expect(authErrorMessage(new Error("Unexpected provider failure"))).toBe(
      "We could not send the link. Please check the email address and try again.",
    );
  });
});
