import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(hasPaid: boolean = true): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
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

describe("documents router", () => {
  it("should allow paid users to list documents", async () => {
    const { ctx } = createAuthContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should prevent unpaid users from listing documents", async () => {
    const { ctx } = createAuthContext(false);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.documents.list()).rejects.toThrow("Payment required");
  });

  it("should generate a resume with valid input", { timeout: 30000 }, async () => {
    const { ctx } = createAuthContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.generate({
      type: "resume",
      personalInfo: {
        fullName: "João Silva",
        email: "joao@example.com",
        phone: "+55 11 99999-9999",
        location: "São Paulo, SP",
      },
      professionalInfo: {
        experience: "5 years as farm worker",
        skills: "Crop harvesting, equipment operation",
        education: "High school diploma",
      },
      targetCountry: "CAN",
      targetPosition: "Farm Worker",
      language: "en",
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
    expect(result.title).toBeTruthy();
    expect(typeof result.content).toBe("string");
  });

  it("should generate a cover letter with valid input", { timeout: 30000 }, async () => {
    const { ctx } = createAuthContext(true);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.generate({
      type: "cover_letter",
      personalInfo: {
        fullName: "Maria Santos",
        email: "maria@example.com",
      },
      professionalInfo: {
        experience: "3 years in hospitality",
        skills: "Customer service, cleaning",
      },
      targetCountry: "NOR",
      targetPosition: "Hotel Staff",
      language: "pt-BR",
    });

    expect(result).toBeDefined();
    expect(result.content).toBeTruthy();
    expect(result.title).toContain("Carta");
  });
});
