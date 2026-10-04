import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

if (!resendApiKey) throw new Error("RESEND_API_KEY is not defined");
if (!emailFrom) throw new Error("EMAIL_FROM is not defined");

const resend = new Resend(resendApiKey);

type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export async function sendEmail({ to, subject, text, html }: SendEmailOptions) {
  console.log("📧 Sending email to:", to, "from:", emailFrom);

  const response = await resend.emails.send({
    from: emailFrom as string,
    to: [to],
    subject,
    text: text ?? "",
    html,
  });

  if (response.error) {
    console.error("❌ Resend error:", response.error);
    throw new Error(response.error.message);
  }

  console.log("✅ Resend success:", response.data);
  return response.data;
}