export const SERVER_URL = (
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://trust-pass-server.vercel.app"
).replace(/\/$/, "");
