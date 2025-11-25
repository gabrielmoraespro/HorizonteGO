import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(hasPaid: boolean = true, role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    hasPaid,
    paymentDate: hasPaid ? new Date() : null,
    stripePaymentId: hasPaid ? "pi_test_123" : null,
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

describe("jobs router", () => {
  it("should allow paid users to list jobs", async () => {
    const { ctx } = createAuthContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobs.list({});
    expect(Array.isArray(result)).toBe(true);
  });

  it("should prevent unpaid users from listing jobs", async () => {
    const { ctx } = createAuthContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.jobs.list({})).rejects.toThrow("Payment required");
  });

  it("should allow admin users to create jobs", async () => {
    const { ctx } = createAuthContext(true, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobs.create({
      countryId: 1,
      title: "Test Job",
      company: "Test Company",
      location: "Test Location",
      description: "Test Description",
      requirements: "Test Requirements",
      benefits: "Test Benefits",
      salary: "CAD 3000/month",
      sourceUrl: "https://example.com",
      sourceName: "Test Source",
      isVerified: true,
      isActive: true,
    });

    expect(result).toBeDefined();
  });

  it("should prevent non-admin users from creating jobs", async () => {
    const { ctx } = createAuthContext(true, "user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.jobs.create({
        countryId: 1,
        title: "Test Job",
        isVerified: true,
        isActive: true,
      })
    ).rejects.toThrow("Admin access required");
  });
});
