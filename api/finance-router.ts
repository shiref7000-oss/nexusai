import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { financialTransactions } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export const financeRouter = createRouter({
  summary: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenue] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(eq(financialTransactions.type, "revenue"), gte(financialTransactions.date, monthStart)));

    const [adSpend] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(eq(financialTransactions.type, "ad_spend"), gte(financialTransactions.date, monthStart)));

    const [productCost] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(eq(financialTransactions.type, "product_cost"), gte(financialTransactions.date, monthStart)));

    const [shippingCost] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(
        sql`${financialTransactions.type} IN ('shipping_cost', 'delivery_fee', 'cod_fee')`,
        gte(financialTransactions.date, monthStart)
      ));

    const [vat] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(eq(financialTransactions.type, "vat_collected"), gte(financialTransactions.date, monthStart)));

    const [refunds] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions)
      .where(and(eq(financialTransactions.type, "refund"), gte(financialTransactions.date, monthStart)));

    const totalRevenue = Number(revenue?.total || 0);
    const totalAdSpend = Number(adSpend?.total || 0);
    const totalProductCost = Number(productCost?.total || 0);
    const totalShipping = Number(shippingCost?.total || 0);
    const totalVat = Number(vat?.total || 0);
    const totalRefunds = Number(refunds?.total || 0);
    const grossProfit = totalRevenue - totalProductCost - totalShipping - totalAdSpend;
    const netProfit = grossProfit - totalVat - totalRefunds;

    return {
      totalRevenue,
      adSpend: totalAdSpend,
      productCost: totalProductCost,
      shippingCost: totalShipping,
      vatCollected: totalVat,
      refunds: totalRefunds,
      grossProfit,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100).toFixed(1) : "0",
    };
  }),

  trend: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      date: sql<string>`DATE(date)`,
      revenue: sql<number>`SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END)`,
      adSpend: sql<number>`SUM(CASE WHEN type = 'ad_spend' THEN amount ELSE 0 END)`,
      shipping: sql<number>`SUM(CASE WHEN type IN ('shipping_cost', 'delivery_fee') THEN amount ELSE 0 END)`,
      profit: sql<number>`SUM(CASE WHEN type = 'revenue' THEN amount ELSE -amount END)`,
    }).from(financialTransactions)
      .where(gte(financialTransactions.date, new Date(Date.now() - 30 * 86400000)))
      .groupBy(sql`DATE(date)`)
      .orderBy(sql`DATE(date)`);

    return rows.map(r => ({
      date: r.date,
      revenue: Number(r.revenue),
      adSpend: Number(r.adSpend),
      shipping: Number(r.shipping),
      profit: Number(r.profit),
    }));
  }),

  byGovernorate: publicQuery.query(async () => {
    const db = getDb();
    return db.select({
      governorate: financialTransactions.governorate,
      revenue: sql<number>`SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END)`,
      count: sql<number>`COUNT(*)`,
    }).from(financialTransactions)
      .where(sql`${financialTransactions.governorate} IS NOT NULL`)
      .groupBy(financialTransactions.governorate)
      .orderBy(desc(sql`SUM(CASE WHEN type = 'revenue' THEN amount ELSE 0 END)`));
  }),

  create: publicQuery.input(z.object({
    type: z.enum(["revenue", "ad_spend", "product_cost", "shipping_cost", "delivery_fee", "cod_fee", "vat_collected", "refund", "other"]),
    amount: z.number(),
    category: z.string().optional(),
    description: z.string().optional(),
    referenceId: z.string().optional(),
    referenceType: z.enum(["order", "campaign", "shipment", "other"]).optional(),
    governorate: z.string().optional(),
    date: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const [result] = await db.insert(financialTransactions).values({
      ...input,
      amount: input.amount.toFixed(2),
      date: input.date ? new Date(input.date) : new Date(),
      createdBy: ctx.user?.id,
    });
    return { id: Number(result.insertId), success: true };
  }),
});
