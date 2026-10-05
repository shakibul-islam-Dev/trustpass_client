/**
 * COMMENTED OUT — OTP verification is disabled.
 *
 * This page was already an orphan: nothing in `app/` imported it, so it was
 * dead code before the OTP endpoints were disabled. It is left here (rather
 * than deleted) as the reference implementation for restoring OTP.
 *
 * Why it is inert:
 *
 *   - It imports `verifyOtp` from `@/lib/core/auth-api`, which is commented
 *     out there because the server has no working mail transport, so it never
 *     produces a code.
 *   - `LoginForm.tsx` and `RegistrationForm.tsx` no longer render it or
 *     `OtpForm`, so nothing reaches this component.
 *
 * To restore: uncomment `verifyOtp`/`resendOtp` in `lib/core/auth-api.ts`,
 * re-add the OTP step to both forms, and re-export this component from a route.
 *
 * ---------------------------------------------------------------------------
 * Original implementation:
 * ---------------------------------------------------------------------------
 *
 * "use client";
 *
 * import { useState } from "react";
 * import { useRouter, useSearchParams } from "next/navigation";
 * import { loginWithPassword, verifyOtp } from "@/lib/core/auth-api";
 * import OtpForm from "@/components/otp/OtpForm";
 *
 * const VerifyOtpPage = () => {
 *   const router = useRouter();
 *   const searchParams = useSearchParams();
 *   const email = searchParams.get("email") ?? "";
 *   const [error, setError] = useState<string | null>(null);
 *   const [isVerifying, setIsVerifying] = useState(false);
 *
 *   const handleVerify = async (otp: string) => {
 *     if (!email) {
 *       setError("Missing email. Please register again.");
 *       return;
 *     }
 *
 *     setIsVerifying(true);
 *     setError(null);
 *
 *     try {
 *       const res = await verifyOtp(email, otp);
 *
 *       if (!res.ok) {
 *         setError("Invalid or expired OTP.");
 *         return;
 *       }
 *
 *       // verify-otp marks the address verified but issues no session cookie,
 *       // so a password sign-in is still required afterwards.
 *       router.push("/auth/login");
 *     } catch {
 *       setError("Something went wrong. Please try again.");
 *     } finally {
 *       setIsVerifying(false);
 *     }
 *   };
 *
 *   return (
 *     <OtpForm
 *       email={email}
 *       isVerifying={isVerifying}
 *       onVerify={handleVerify}
 *       onBack={() => router.push("/auth/login")}
 *     />
 *   );
 * };
 *
 * export default VerifyOtpPage;
 */

export {};
