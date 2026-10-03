import { betterAuth } from "better-auth";
import { sendEmail } from "./email";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
    sendOnSignIn:true,
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


});