export const formatError = (
  message: string,
  status: number = 500,
  error: unknown | null = null
) => ({
  message,
  status,
  error,
});

