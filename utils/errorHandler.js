export const formatError = (message, status = 500, error = null) => ({
  message,
  status,
  error,
});
