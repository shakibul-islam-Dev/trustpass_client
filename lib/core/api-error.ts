
const INTERNAL_MARKERS =
  /prisma|invocation|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|postgres|postgresql|mysql|sqlite|node_modules|\/api\/|\/src\/|\.ts:\d+|\.js:\d+|\.tsx:\d+|Error:|TypeError:|ReferenceError:|SyntaxError:|stack|SELECT\s|INSERT\s|UPDATE\s|DELETE\s|Cannot read|Cannot access|undefined|null|NaN|timeout|socket|ECONNRESET|at\s+[A-Za-z_$][\w$]*\s*\(|getaddrinfo|query_engine|adapter|unexpected token|failed to fetch|load failed/i;

/** Messages we deliberately allow through, matched against the whole string. */
const USER_FACING: RegExp[] = [
  /^invalid email or password\.?$/i,
  /^an account with this email already exists\.?$/i,
  /^please verify your email before signing in\.?.*$/i,
  /^check your inbox for the otp\.?$/i,
  /^invalid or expired otp\.?.*$/i,
  /^invalid otp\.?$/i,
  /^this email is already verified\.?$/i,
  /^if that address has a pending account.*$/i,
  /^you do not have permission.*$/i,
  /^you are not authenticated.*$/i,
  /^your account has been blocked.*$/i,
  /^your account is currently suspended.*$/i,
  /^this account has been deleted\.?$/i,
  /^user account no longer exists\.?$/i,
  /^user not found\.?$/i,
  /^business not found\.?$/i,
  /^too many requests.*$/i,
  /^validation error\.?$/i,
  /^(please )?(enter|provide) (a )?(valid |your )?[a-z ,.-]{3,60}$/i,
  /^(email|password|name|phone|otp|code|role|gender|image)\b.{0,80}$/i,
  /must be .{0,60}$/i,
  /is required\.?$/i,
  /^invalid .{0,60}$/i,
];

/** Fallback text per HTTP status. 5xx never gets a specific message. */
const BY_STATUS: Record<number, string> = {
  400: "That request could not be processed. Please check your details.",
  401: "Your email or password is incorrect.",
  403: "You do not have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "An account with those details already exists.",
  422: "Please check the details you entered.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again shortly.",
  502: "The server is temporarily unavailable. Please try again.",
  503: "The service is temporarily unavailable. Please try again.",
  504: "The server took too long to respond. Please try again.",
};

export const DEFAULT_API_ERROR =
  "Something went wrong. Please try again.";

const MAX_LENGTH = 200;

type SafeApiMessageOptions = {
  /** HTTP status of the failed response, if any. */
  status?: number;
  /** Raw `message` field from the server body. */
  serverMessage?: string | null;
  /** Message to use when the status has no mapping. */
  fallback?: string;
 
  allowFieldMessage?: boolean;
};


export function safeApiMessage({
  status,
  serverMessage,
  fallback,
  allowFieldMessage = false,
}: SafeApiMessageOptions): string {
  if (typeof serverMessage === "string") {
    const msg = serverMessage.trim();

    const wellFormed =
      msg.length > 0 &&
      msg.length <= MAX_LENGTH &&
      !INTERNAL_MARKERS.test(msg) &&
      !msg.includes("`") &&
      !msg.includes("\n");

    if (wellFormed) {
      const recognised = USER_FACING.some((rule) => rule.test(msg));
      if (recognised || allowFieldMessage) return msg;
    }
  }

  if (status && BY_STATUS[status]) return BY_STATUS[status];
  return fallback ?? DEFAULT_API_ERROR;
}

/** Logs the untouched server/network error. Safe to call in production. */
export function logInternalError(
  context: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV === "production") {
    // Keep production logs useful without dumping the whole payload.
    console.error(`[api] ${context}`, extra ?? "");
    return;
  }
  console.error(`[api] ${context}`, error, extra ?? "");
}


export async function readApiError(
  context: string,
  response: Response,
  fallback?: string,
): Promise<string> {
  let body: unknown = null;

  let raw: string;
  try {
    raw = await response.text();
  } catch (readError) {
    logInternalError(`${context}: body unreadable`, readError, {
      status: response.status,
    });
    return safeApiMessage({ status: response.status, fallback });
  }

  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      // Non-JSON body — typically a proxy/hosting error page.
      logInternalError(`${context}: non-JSON body`, raw.slice(0, 500), {
        status: response.status,
      });
      return safeApiMessage({ status: response.status, fallback });
    }
  }

  const envelope = body as
    | { message?: unknown; errorSources?: unknown }
    | null;

  const serverMessage =
    typeof envelope?.message === "string" ? envelope.message : null;

  logInternalError(`${context}: server responded`, body, { status: response.status });

  return safeApiMessage({ status: response.status, serverMessage, fallback });
}

/** Turns a thrown fetch/TypeError into safe UI text. */
export function safeThrownError(
  context: string,
  error: unknown,
  fallback?: string,
): string {
  logInternalError(`${context}: request threw`, error);
  return fallback ?? DEFAULT_API_ERROR;
}