import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, customers } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export const orderRouter = createRouter({
  list: publicQuery.input(z.object({
    status: z.string().optional(),
    limit: z.number().default(50),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) conditions.push(eq(orders.status, input.status as any));

    return db.select().from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(input?.limit || 50);
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      confirmed: sql<number>`SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
      noAnswer: sql<number>`SUM(CASE WHEN status = 'no_answer' THEN 1 ELSE 0 END)`,
      revenue: sql<number>`SUM(totalAmount)`,
    }).from(orders).where(gte(orders.createdAt, today));

    const [pendingCount] = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders).where(eq(orders.status, "pending"));

    return {
      todayTotal: Number(todayStats?.total || 0),
      todayConfirmed: Number(todayStats?.confirmed || 0),
      todayCancelled: Number(todayStats?.cancelled || 0),
      todayNoAnswer: Number(todayStats?.noAnswer || 0),
      todayRevenue: Number(todayStats?.revenue || 0),
      pendingCalls: pendingCount?.count || 0,
    };
  }),

  updateStatus: publicQuery.input(z.object({
    id: z.number(),
    status: z.enum(["pending", "confirmed", "cancelled", "no_answer", "processing", "shipped", "delivered", "returned"]),
    notes: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const { id, status, notes } = input;
    const updates: any = { status };
    if (notes) updates.notes = notes;
    if (status === "confirmed") updates.confirmedAt = new Date();
    if (status === "shipped") updates.shippedAt = new Date();
    if (status === "delivered") updates.deliveredAt = new Date();

    await db.update(orders).set(updates).where(eq(orders.id, id));
    return { success: true };
  }),

  create: publicQuery.input(z.object({
    orderCode: z.string(),
    customerName: z.string(),
    customerPhone: z.string(),
    governorate: z.string().optional(),
    itemCount: z.number().default(1),
    subtotal: z.number(),
    shippingFee: z.number().default(0),
    vatAmount: z.number().default(0),
    totalAmount: z.number(),
    paymentMethod: z.enum(["cod", "card", "wallet"]).default("cod"),
  })).mutation(async ({ input }) => {
    const db = getDb();

    // Upsert customer
    const [existing] = await db.select().from(customers).where(eq(customers.phone, input.customerPhone));
    let customerId = existing?.id;
    if (!customerId) {
      const [result] = await db.insert(customers).values({
        name: input.customerName,
        phone: input.customerPhone,
        governorate: input.governorate,
      });
      customerId = Number(result.insertId);
    }

    const [result] = await db.insert(orders).values({
      orderCode: input.orderCode,
      customerId,
      itemCount: input.itemCount,
      subtotal: input.subtotal.toFixed(2),
      shippingFee: input.shippingFee.toFixed(2),
      vatAmount: input.vatAmount.toFixed(2),
      totalAmount: input.totalAmount.toFixed(2),
      paymentMethod: input.paymentMethod,
    });

    return { id: Number(result.insertId), customerId, success: true };
  }),

  pipelineTrend: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db.select({
      day: sql<string>`DATE(createdAt)`,
      total: sql<number>`COUNT(*)`,
      confirmed: sql<number>`SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)`,
      noAnswer: sql<number>`SUM(CASE WHEN status = 'no_answer' THEN 1 ELSE 0 END)`,
    }).from(orders)
      .where(gte(orders.createdAt, new Date(Date.now() - 7 * 86400000)))
      .groupBy(sql`DATE(createdAt)`)
      .orderBy(sql`DATE(createdAt)`);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return rows.map(r => ({
      day: dayNames[new Date(r.day).getDay()] || r.day,
      total: Number(r.total),
      confirmed: Number(r.confirmed),
      cancelled: Number(r.cancelled),
      noanswer: Number(r.noAnswer),
    }));
  }),
});
