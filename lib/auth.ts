import { betterAuth } from "better-auth";
import { sendEmail } from "./email";
import { emailOTP } from "better-auth/plugins/email-otp";
import { admin } from "better-auth/plugins/admin";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        enum: ["CUSTOMER", "SELLER", "admin", "moderator", "merchant", "user"],
        defaultValue: "CUSTOMER",
      },
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60, // 1 hour
    sendVerificationEmail: async ({ user, url }) => {
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify Your Email Address",
          text: `Click the link to verify your email: ${url}`,
          html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
        });
        console.log("✅ Verification email sent to:", user.email);
      } catch (err) {
        console.error("❌ Failed to send verification email:", err);
        throw err;
      }
    },
    sendOnSignIn: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({
      defaultRole: "CUSTOMER",
      adminRoles: ["admin"],
      defaultBanReason: "Violation of terms of service",
      bannedUserMessage: "You have been banned from this application.",
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let subject = "";
        let title = "";
        let description = "";
        if (type === "sign-in") {
          subject = "Your Sign In OTP";
          title = "Sign In Verification";
          description = "Use this OTP to complete your sign in.";
        } else if (type === "email-verification") {
          subject = "Your Email Verification OTP";
          title = "Email Verification";
          description = "Use this OTP to verify your email address.";
        } else if (type === "forget-password") {
          subject = "Your Password Reset OTP";
          title = "Password Reset";
          description = "Use this OTP to reset your password.";
        }
        await sendEmail({
          to: email,
          subject,
          text: `${description}\n\nYour OTP is: ${otp}\n\nThis OTP will expire soon.`,
          html: `
            <div style=" font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; ">
              <h2>${title}</h2>
              <p>${description}</p>
              <div style=" margin: 25px 0; padding: 18px; text-align: center; background: #f3f4f6; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; ">
                ${otp}
              </div>
              <p>If you did not request this code, you can safely ignore this email.</p>
            </div>
          `,
        });
        console.log(`✅ ${type} OTP sent to:`, email);
      },
    }),
  ],
});