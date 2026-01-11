import { Resend } from "resend";
import type { ReactElement } from "react";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email - can be overridden via env var
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Gifto <noreply@gifto.app>";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
};

/**
 * Send an email using Resend with a React Email template
 */
export async function sendEmail({
  to,
  subject,
  react,
  from = FROM_EMAIL,
}: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export { resend };
