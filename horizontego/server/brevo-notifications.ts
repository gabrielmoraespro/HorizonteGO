interface BrevoEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendBrevoEmail({ to, subject, htmlContent }: BrevoEmailParams) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName = process.env.BREVO_FROM_NAME;

  if (!apiKey || !fromEmail) {
    console.error("[Brevo] Missing API key or sender email");
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: fromEmail, name: fromName },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      console.error("[Brevo] Failed to send email:", await response.text());
      return false;
    }

    console.log(`[Brevo] Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Brevo] Error sending email:", error);
    return false;
  }
}
