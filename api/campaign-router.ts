import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { campaigns, creatives } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const campaignRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [totals] = await db.select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
      totalSpent: sql<number>`COALESCE(SUM(spent), 0)`,
      totalImpressions: sql<number>`COALESCE(SUM(impressions), 0)`,
      totalClicks: sql<number>`COALESCE(SUM(clicks), 0)`,
      totalConversions: sql<number>`COALESCE(SUM(conversions), 0)`,
      avgRoas: sql<number>`COALESCE(AVG(roas), 0)`,
    }).from(campaigns);

    return {
      total: Number(totals?.total || 0),
      active: Number(totals?.active || 0),
      totalSpent: Number(totals?.totalSpent || 0),
      totalImpressions: Number(totals?.totalImpressions || 0),
      totalClicks: Number(totals?.totalClicks || 0),
      totalConversions: Number(totals?.totalConversions || 0),
      avgRoas: Number(totals?.avgRoas || 0),
      avgCtr: totals?.totalImpressions ? ((totals.totalClicks / totals.totalImpressions) * 100).toFixed(2) : "0",
    };
  }),

  creatives: publicQuery.input(z.object({ campaignId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(creatives).where(eq(creatives.campaignId, input.campaignId));
  }),

  updateStatus: publicQuery.input(z.object({
    id: z.number(),
    status: z.enum(["active", "paused", "draft", "ended"]),
  })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(campaigns).set({ status: input.status }).where(eq(campaigns.id, input.id));
    return { success: true };
  }),
});
