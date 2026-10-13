const defaultServerUrl =
  process.env.NODE_ENV === "production"
    ? "https://trust-pass-server.vercel.app"
    : "http://localhost:5000";

export const SERVER_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL || defaultServerUrl
).replace(/\/$/, "");
