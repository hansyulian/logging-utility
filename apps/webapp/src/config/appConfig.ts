const env = import.meta.env;
export const appConfig = {
  loggingServer: env.VITE_LOGGING_SERVER,
  serverKey: env.VITE_SERVER_KEY,
};
