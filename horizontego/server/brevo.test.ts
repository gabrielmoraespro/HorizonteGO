import { describe, expect, it } from "vitest";
import { sendEmail } from "./integrations/brevo";

describe("Brevo Integration", () => {
  it("should have Brevo API key configured", () => {
    expect(process.env.BREVO_API_KEY).toBeDefined();
    expect(process.env.BREVO_API_KEY).not.toBe("");
  });

  it("should validate Brevo credentials by sending a test email", async () => {
    const fromEmail = process.env.BREVO_FROM_EMAIL || "noreply@horizontego.com";
    
    // Send test email to the same from address (self-test)
    const result = await sendEmail({
      to: fromEmail,
      subject: "HorizonteGo - Test Email",
      htmlContent: "<p>This is a test email from HorizonteGo to validate Brevo integration.</p>",
      textContent: "This is a test email from HorizonteGo to validate Brevo integration.",
    });

    expect(result).toBe(true);
  }, { timeout: 15000 }); // Longer timeout for API call
});
