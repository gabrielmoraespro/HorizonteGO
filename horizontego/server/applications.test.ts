import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(plan: "free" | "starter" | "pro" = "starter"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    plan,
    hasPaid: plan !== "free",
    paymentDate: plan !== "free" ? new Date() : null,
    stripePaymentId: plan !== "free" ? "pi_test_123" : null,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    resumeUrl: "https://example.com/resume.pdf",
    resumeUploadedAt: new Date(),
    dailyApplicationsCount: 0,
    lastApplicationDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: { origin: "http://localhost:3000" },
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("applications router", () => {
  it("should return application stats for authenticated user", async () => {
    const { ctx } = createAuthContext("starter");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.applications.stats();

    expect(stats).toBeDefined();
    expect(stats.plan).toBe("starter");
    expect(stats.dailyLimit).toBe(3); // Starter plan limit
    expect(stats.todayCount).toBeGreaterThanOrEqual(0);
    expect(stats.remaining).toBeGreaterThanOrEqual(0);
  });

  it("should show correct limits for free plan", async () => {
    const { ctx } = createAuthContext("free");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.applications.stats();

    expect(stats.plan).toBe("free");
    expect(stats.dailyLimit).toBe(0); // Free plan has no applications
  });

  it("should show correct limits for pro plan", async () => {
    const { ctx } = createAuthContext("pro");
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.applications.stats();

    expect(stats.plan).toBe("pro");
    expect(stats.dailyLimit).toBe(10); // Pro plan limit
  });

  it("should list user applications", async () => {
    const { ctx } = createAuthContext("starter");
    const caller = appRouter.createCaller(ctx);

    const applications = await caller.applications.list();

    expect(Array.isArray(applications)).toBe(true);
  });
});
