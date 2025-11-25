import { describe, it, expect } from "vitest";
import { sendBrevoEmail } from "./brevo-notifications";
import { emailTemplates } from "./email-templates";

describe("Brevo Email Notifications", () => {
  it("should send subscription created email", async () => {
    const result = await sendBrevoEmail({
      to: "noreply@horizontego.com",
      subject: "🎉 Bem-vindo ao HorizonteGo!",
      htmlContent: emailTemplates.subscriptionCreated("Test User", "Starter"),
    });

    expect(result).toBe(true);
  });

  it("should send subscription renewed email", async () => {
    const result = await sendBrevoEmail({
      to: "noreply@horizontego.com",
      subject: "✅ Assinatura Renovada - HorizonteGo",
      htmlContent: emailTemplates.subscriptionRenewed("Test User"),
    });

    expect(result).toBe(true);
  });

  it("should send subscription canceled email", async () => {
    const result = await sendBrevoEmail({
      to: "noreply@horizontego.com",
      subject: "😔 Assinatura Cancelada - HorizonteGo",
      htmlContent: emailTemplates.subscriptionCanceled("Test User"),
    });

    expect(result).toBe(true);
  });

  it("should send payment failed email", async () => {
    const result = await sendBrevoEmail({
      to: "noreply@horizontego.com",
      subject: "⚠️ Falha no Pagamento - HorizonteGo",
      htmlContent: emailTemplates.paymentFailed("Test User"),
    });

    expect(result).toBe(true);
  });
});
