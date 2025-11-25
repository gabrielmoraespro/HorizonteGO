import { z } from "zod";
import Stripe from "stripe";
import { protectedProcedure, router } from "./_core/trpc";
import { PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export const paymentRouter = router({
  createCheckout: protectedProcedure
    .input(z.object({
      productKey: z.enum(["FREE", "STARTER", "PRO"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const product = PRODUCTS[input.productKey];
      
      // Free plan doesn't require payment
      if (product.price === 0) {
        throw new Error("Free plan does not require payment");
      }
      const origin = ctx.req.headers.origin || "http://localhost:3000";

      // Criar ou reutilizar Stripe Customer
      let customerId = ctx.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: {
            userId: ctx.user.id.toString(),
          },
        });
        customerId = customer.id;

        // Salvar no banco
        const { getDb } = await import("./db");
        const db = await getDb();
        if (db) {
          const { users } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, ctx.user.id));
        }
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription", // MODO ASSINATURA
        line_items: [
          {
            price: product.priceId,
            quantity: 1,
          },
        ],
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment/cancel`,
        metadata: {
          userId: ctx.user.id.toString(),
          plan: input.productKey.toLowerCase(),
        },
        subscription_data: {
          metadata: {
            userId: ctx.user.id.toString(),
            plan: input.productKey.toLowerCase(),
          },
        },
        allow_promotion_codes: true,
      });

      return {
        url: session.url,
        sessionId: session.id,
      };
    }),

  createBillingPortalSession: protectedProcedure
    .mutation(async ({ ctx }) => {
      const customerId = ctx.user.stripeCustomerId;
      
      if (!customerId) {
        throw new Error("No Stripe customer found. Please subscribe to a plan first.");
      }

      const origin = ctx.req.headers.origin || "http://localhost:3000";
      
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/profile`,
      });

      return {
        url: session.url,
      };
    }),
});
