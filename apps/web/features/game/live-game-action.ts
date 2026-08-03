export type LiveActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

export async function executeLiveAction<T>(
  action: () => Promise<void>,
  refresh: () => Promise<T>,
): Promise<LiveActionResult<T>> {
  try {
    await action();
    return { ok: true, value: await refresh() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error
        ? error.message
        : "That did not work. Please try again.",
    };
  }
}
