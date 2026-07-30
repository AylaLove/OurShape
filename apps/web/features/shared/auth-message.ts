type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

export function authErrorMessage(error: unknown) {
  const authError = error as AuthErrorLike | null;
  const code = authError?.code?.toLowerCase() ?? "";
  const message = authError?.message?.toLowerCase() ?? "";

  if (
    authError?.status === 429 ||
    code.includes("rate_limit") ||
    message.includes("rate limit")
  ) {
    return "We have sent enough links for now. Please wait an hour, then request one new link.";
  }

  if (message.includes("email address not authorized")) {
    return "This email cannot receive a link yet. Ask the household owner to add it.";
  }

  return "We could not send the link. Please check the email address and try again.";
}
