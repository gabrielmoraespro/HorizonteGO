import express from "express";
import Stripe from "stripe";
import { updateUserPayment } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export const stripeWebhookRouter = express.Router();

stripeWebhookRouter.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("[Webhook] Missing stripe-signature header");
      return res.status(400).send("Missing signature");
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({
        verified: true,
      });
    }

    // Handle real events
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          if (userId && session.customer) {
            const { getDb } = await import("./db");
            const { users } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const db = await getDb();
            if (db) {
              await db.update(users).set({ stripeCustomerId: session.customer as string }).where(eq(users.id, parseInt(userId)));
            }
          }
          break;
        }

        case "customer.subscription.created": {
          const subscription = event.data.object as any;
          const userId = subscription.metadata?.userId;
          const planName = subscription.metadata?.plan as "starter" | "pro";
          if (userId && planName) {
            const { getDb } = await import("./db");
            const { users, subscriptions } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const db = await getDb();
            if (db) {
              await db.insert(subscriptions).values({
                userId: parseInt(userId),
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0]?.price.id || "",
                planName,
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
              });
              await db.update(users).set({ plan: planName, hasPaid: true, paymentDate: new Date(), stripeSubscriptionId: subscription.id }).where(eq(users.id, parseInt(userId)));
              
              const user = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
              if (user[0]?.email) {
                const { sendBrevoEmail } = await import("./brevo-notifications");
                const { emailTemplates } = await import("./email-templates");
                await sendBrevoEmail({
                  to: user[0].email,
                  subject: "🎉 Bem-vindo ao HorizonteGo!",
                  htmlContent: emailTemplates.subscriptionCreated(user[0].name || "Usuário", planName === "starter" ? "Starter" : "Pro"),
                });
              }
            }
          }
          break;
        }

        case "customer.subscription.updated": {
          const subscription = event.data.object as any;
          const { getDb } = await import("./db");
          const { users, subscriptions } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            await db.update(subscriptions).set({
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            }).where(eq(subscriptions.stripeSubscriptionId, subscription.id));
            if (subscription.status === "canceled") {
              const sub = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subscription.id)).limit(1);
              if (sub[0]) await db.update(users).set({ plan: "free", hasPaid: false }).where(eq(users.id, sub[0].userId));
            }
          }
          break;
        }

        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          const { getDb } = await import("./db");
          const { users, subscriptions } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          const db = await getDb();
          if (db) {
            await db.update(subscriptions).set({ status: "canceled" }).where(eq(subscriptions.stripeSubscriptionId, subscription.id));
            const sub = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subscription.id)).limit(1);
            if (sub[0]) {
              await db.update(users).set({ plan: "free", hasPaid: false, stripeSubscriptionId: null }).where(eq(users.id, sub[0].userId));
              
              const user = await db.select().from(users).where(eq(users.id, sub[0].userId)).limit(1);
              if (user[0]?.email) {
                const { sendBrevoEmail } = await import("./brevo-notifications");
                const { emailTemplates } = await import("./email-templates");
                await sendBrevoEmail({
                  to: user[0].email,
                  subject: "😔 Assinatura Cancelada - HorizonteGo",
                  htmlContent: emailTemplates.subscriptionCanceled(user[0].name || "Usuário"),
                });
              }
            }
          }
          break;
        }

        case "invoice.paid": {
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const { getDb } = await import("./db");
            const { subscriptions } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const db = await getDb();
            if (db) {
              await db.update(subscriptions).set({ status: "active" }).where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
              
              const sub = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string)).limit(1);
              if (sub[0]) {
                const { users } = await import("../drizzle/schema");
                const user = await db.select().from(users).where(eq(users.id, sub[0].userId)).limit(1);
                if (user[0]?.email) {
                  const { sendBrevoEmail } = await import("./brevo-notifications");
                  const { emailTemplates } = await import("./email-templates");
                  await sendBrevoEmail({
                    to: user[0].email,
                    subject: "✅ Assinatura Renovada - HorizonteGo",
                    htmlContent: emailTemplates.subscriptionRenewed(user[0].name || "Usuário"),
                  });
                }
              }
            }
          }
          break;
        }

        case "invoice.payment_failed": {
          const invoice = event.data.object as any;
          if (invoice.subscription) {
            const { getDb } = await import("./db");
            const { subscriptions } = await import("../drizzle/schema");
            const { eq } = await import("drizzle-orm");
            const db = await getDb();
            if (db) {
              await db.update(subscriptions).set({ status: "past_due" }).where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
              
              const sub = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string)).limit(1);
              if (sub[0]) {
                const { users } = await import("../drizzle/schema");
                const user = await db.select().from(users).where(eq(users.id, sub[0].userId)).limit(1);
                if (user[0]?.email) {
                  const { sendBrevoEmail } = await import("./brevo-notifications");
                  const { emailTemplates } = await import("./email-templates");
                  await sendBrevoEmail({
                    to: user[0].email,
                    subject: "⚠️ Falha no Pagamento - HorizonteGo",
                    htmlContent: emailTemplates.paymentFailed(user[0].name || "Usuário"),
                  });
                }
              }
            }
          }
          break;
        }

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error("[Webhook] Error processing event:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  }
);
