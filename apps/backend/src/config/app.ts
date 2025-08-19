import "dotenv/config";

export const appConfig = {
  serverKey: process.env.SERVER_KEY || "someserverkey",
};
