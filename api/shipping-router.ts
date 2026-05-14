import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { shipments } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export const shippingRouter = createRouter({
  list: publicQuery.input(z.object({
    status: z.string().optional(),
    provider: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) conditions.push(eq(shipments.status, input.status as any));
    if (input?.provider) conditions.push(eq(shipments.provider, input.provider as any));

    return db.select().from(shipments)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(shipments.createdAt));
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals] = await db.select({
      total: sql<number>`COUNT(*)`,
      delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
      returned: sql<number>`SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END)`,
      inTransit: sql<number>`SUM(CASE WHEN status IN ('in_transit', 'out_for_delivery') THEN 1 ELSE 0 END)`,
      avgDays: sql<number>`COALESCE(AVG(actualDays), 0)`,
    }).from(shipments).where(gte(shipments.createdAt, monthStart));

    const byProvider = await db.select({
      provider: shipments.provider,
      count: sql<number>`COUNT(*)`,
      delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
      avgDays: sql<number>`COALESCE(AVG(actualDays), 0)`,
    }).from(shipments).where(gte(shipments.createdAt, monthStart))
      .groupBy(shipments.provider);

    const byGovernorate = await db.select({
      governorate: shipments.governorate,
      count: sql<number>`COUNT(*)`,
      delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
    }).from(shipments).where(gte(shipments.createdAt, monthStart))
      .groupBy(shipments.governorate)
      .orderBy(desc(sql`COUNT(*)`));

    return {
      total: Number(totals?.total || 0),
      delivered: Number(totals?.delivered || 0),
      returned: Number(totals?.returned || 0),
      inTransit: Number(totals?.inTransit || 0),
      avgDays: Number(totals?.avgDays || 0).toFixed(1),
      deliveryRate: totals?.total ? (totals.delivered / totals.total * 100).toFixed(1) : "0",
      byProvider,
      byGovernorate,
    };
  }),

  updateStatus: publicQuery.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "returned", "failed"]),
    trackingCode: z.string().optional(),
    actualDays: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...updates } = input;
    if (updates.status === "delivered" && !updates.actualDays) {
      // Auto-calculate if not provided
    }
    await db.update(shipments).set(updates).where(eq(shipments.id, id));
    return { success: true };
  }),

  pipelineTrend: publicQuery.query(async () => {
    const db = getDb();
    return db.select({
      day: sql<string>`DATE(createdAt)`,
      shipped: sql<number>`COUNT(*)`,
      delivered: sql<number>`SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)`,
      returned: sql<number>`SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END)`,
    }).from(shipments)
      .where(gte(shipments.createdAt, new Date(Date.now() - 7 * 86400000)))
      .groupBy(sql`DATE(createdAt)`)
      .orderBy(sql`DATE(createdAt)`);
  }),
});
