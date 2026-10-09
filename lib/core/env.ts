/**
 * Every origin this app talks to or identifies itself by — one module, two
 * environments:
 *
 *   `next dev`           -> the NEXT_PUBLIC_LOCAL_* values from `.env`
 *   `next build` / Vercel -> the LIVE links, hardcoded below
 *
 * The local values carry the `NEXT_PUBLIC_` prefix on purpose: they are read
 * from browser code too (session, uploads, categories), and Next.js only
 * inlines `NEXT_PUBLIC_` variables into the client bundle. Being inlined at
 * BUILD time, a changed `.env` only takes effect after restarting `next dev`
 * (or rebuilding).
 *
 * `.env` is gitignored, so a deploy never sees it — production values live
 * here as plain constants and a deploy needs no environment configuration.
 * To point production somewhere else, change `LIVE_*` below (and rebuild).
 */

/** The API server, live. */
export const LIVE_SERVER_URL = "https://trust-pass-server.vercel.app";

/** This app, live. */
export const LIVE_CLIENT_URL = "https://trustpass-client.vercel.app";

/**
 * `NODE_ENV` is inlined by Next.js itself, so this branch is resolved at build
 * time on both the server and in the browser — no runtime check.
 */
const isProduction = process.env.NODE_ENV === "production";

/** The API origin for the current environment. */
export const SERVER_URL = isProduction
  ? LIVE_SERVER_URL
  : process.env.NEXT_PUBLIC_LOCAL_SERVER_URL || "http://localhost:5000";

/**
 * This app's own origin for the current environment. Nothing reads it yet
 * (password-reset uses `window.location.origin`, OAuth callbacks are relative)
 * — it is exported so an absolute client URL never has to be hard-coded again.
 */
export const CLIENT_URL = isProduction
  ? LIVE_CLIENT_URL
  : process.env.NEXT_PUBLIC_LOCAL_CLIENT_URL || "http://localhost:3000";
