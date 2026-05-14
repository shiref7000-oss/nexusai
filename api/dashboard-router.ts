import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  orders, products, campaigns, shipments,
  financialTransactions, agentActivities, recommendations, kpiSnapshots,
} from "@db/schema";
import { sql, desc, eq, and, gte } from "drizzle-orm";

export const dashboardRouter = createRouter({
  // KPI cards data
  kpis: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [revenue] = await db.select({
      total: sql<number>`COALESCE(SUM(${financialTransactions.amount}), 0)`,
    }).from(financialTransactions)
      .where(and(
        eq(financialTransactions.type, "revenue"),
        gte(financialTransactions.date, thirtyDaysAgo)
      ));

    const [orderStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      confirmed: sql<number>`SUM(CASE WHEN ${orders.status} = 'confirmed' THEN 1 ELSE 0 END)`,
      delivered: sql<number>`SUM(CASE WHEN ${orders.status} = 'delivered' THEN 1 ELSE 0 END)`,
    }).from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo));

    const [campaignCount] = await db.select({
      count: sql<number>`COUNT(*)`,
    }).from(campaigns).where(eq(campaigns.status, "active"));

    const [deliveryRate] = await db.select({
      rate: sql<number>`COALESCE(AVG(CASE WHEN ${shipments.status} = 'delivered' THEN 1 ELSE 0 END) * 100, 0)`,
    }).from(shipments)
      .where(gte(shipments.createdAt, thirtyDaysAgo));

    const totalOrders = Number(orderStats?.total || 0);
    const confirmedOrders = Number(orderStats?.confirmed || 0);
    const deliveredOrders = Number(orderStats?.delivered || 0);
    const confirmationRate = totalOrders > 0 ? (confirmedOrders / totalOrders * 100).toFixed(1) : "0";
    const deliveryRateValue = Number(deliveryRate?.rate || 0).toFixed(1);

    return {
      totalRevenue: Number(revenue?.total || 0),
      confirmationRate,
      deliveryRate: deliveryRateValue,
      activeCampaigns: campaignCount?.count || 0,
      totalOrders,
      totalProducts: (await db.select({ count: sql<number>`COUNT(*)` }).from(products))[0]?.count || 0,
      shipmentCount: (await db.select({ count: sql<number>`COUNT(*)` }).from(shipments)
        .where(gte(shipments.createdAt, thirtyDaysAgo)))[0]?.count || 0,
    };
  }),

  // Revenue trend (30 days)
  revenueTrend: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      date: sql<string>`DATE(${financialTransactions.date})`,
      revenue: sql<number>`SUM(CASE WHEN ${financialTransactions.type} = 'revenue' THEN ${financialTransactions.amount} ELSE 0 END)`,
      orders: sql<number>`COUNT(DISTINCT ${financialTransactions.referenceId})`,
    }).from(financialTransactions)
      .where(gte(financialTransactions.date, new Date(Date.now() - 30 * 86400000)))
      .groupBy(sql`DATE(${financialTransactions.date})`)
      .orderBy(sql`DATE(${financialTransactions.date})`);

    return rows.map((r, i) => ({
      day: i + 1,
      revenue: Number(r.revenue),
      orders: Number(r.orders),
      date: r.date,
    }));
  }),

  // Governorate breakdown
  governorateBreakdown: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      governorate: orders.governorate,
      count: sql<number>`COUNT(*)`,
      revenue: sql<number>`SUM(${orders.totalAmount})`,
    }).from(orders)
      .where(sql`${orders.governorate} IS NOT NULL`)
      .groupBy(orders.governorate)
      .orderBy(desc(sql`COUNT(*)`));

    return rows.map(r => ({
      name: r.governorate || "Unknown",
      orders: Number(r.count),
      revenue: Number(r.revenue),
    }));
  }),

  // AI Activity Stream
  activityStream: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(agentActivities)
      .orderBy(desc(agentActivities.createdAt))
      .limit(20);
  }),

  // Priority alerts
  alerts: publicQuery.query(async () => {
    const db = getDb();
    const pendingRecs = await db.select().from(recommendations)
      .where(eq(recommendations.status, "pending"))
      .orderBy(desc(recommendations.confidence))
      .limit(10);

    return pendingRecs.map(r => ({
      id: r.id,
      agent: r.agent,
      title: r.title,
      description: r.description,
      confidence: r.confidence,
      impact: r.impact,
    }));
  }),

  // Agent status
  agentStatus: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000);

    const agents = ["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"] as const;

    const results = await Promise.all(agents.map(async (agent) => {
      const [latest] = await db.select().from(agentActivities)
        .where(eq(agentActivities.agent, agent))
        .orderBy(desc(agentActivities.createdAt))
        .limit(1);

      return {
        agent,
        lastActive: latest?.createdAt || oneHourAgo,
        isActive: latest ? new Date(latest.createdAt) > oneHourAgo : false,
        pendingActions: (await db.select({ count: sql<number>`COUNT(*)` }).from(agentActivities)
          .where(and(eq(agentActivities.agent, agent), eq(agentActivities.status, "pending"))))[0]?.count || 0,
      };
    }));

    return results;
  }),
});
