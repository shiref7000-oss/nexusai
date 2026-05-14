import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { agentActivities, recommendations } from "@db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const agentRouter = createRouter({
  // Activities
  activities: publicQuery.input(z.object({
    agent: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().default(50),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.agent) conditions.push(eq(agentActivities.agent, input.agent as any));
    if (input?.status) conditions.push(eq(agentActivities.status, input.status as any));

    return db.select().from(agentActivities)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(agentActivities.createdAt))
      .limit(input?.limit || 50);
  }),

  // Recommendations
  recommendations: publicQuery.input(z.object({
    agent: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().default(20),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.agent) conditions.push(eq(recommendations.agent, input.agent as any));
    if (input?.status) conditions.push(eq(recommendations.status, input.status as any));

    return db.select().from(recommendations)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(recommendations.confidence))
      .limit(input?.limit || 20);
  }),

  // Update recommendation status
  updateRecommendation: publicQuery.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "approved", "rejected", "applied"]),
  })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(recommendations).set({ status: input.status }).where(eq(recommendations.id, input.id));
    return { success: true };
  }),

  // Log activity
  logActivity: publicQuery.input(z.object({
    agent: z.enum(["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"]),
    action: z.string(),
    description: z.string().optional(),
    impact: z.string().optional(),
    impactValue: z.number().optional(),
    status: z.enum(["pending", "applied", "dismissed", "auto_executed"]).default("pending"),
    metadata: z.record(z.any()).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [result] = await db.insert(agentActivities).values({
      ...input,
      impactValue: input.impactValue?.toFixed(2) || "0",
      createdBy: ctx.user?.id,
    });
    return { id: Number(result.insertId), success: true };
  }),

  // Create recommendation
  createRecommendation: publicQuery.input(z.object({
    agent: z.enum(["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"]),
    type: z.string(),
    title: z.string(),
    description: z.string(),
    confidence: z.number().default(0),
    impact: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const [result] = await db.insert(recommendations).values(input);
    return { id: Number(result.insertId), success: true };
  }),
});
