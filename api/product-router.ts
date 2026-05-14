import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const productRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(products).orderBy(desc(products.createdAt));
  }),

  byId: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const [product] = await db.select().from(products).where(eq(products.id, input.id));
    return product || null;
  }),

  byCategory: publicQuery.input(z.object({ category: z.string() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(products).where(eq(products.category, input.category));
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [total] = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
    const [avgMargin] = await db.select({ avg: sql<number>`COALESCE(AVG(${products.margin}), 0)` }).from(products);
    const categories = await db.select({
      category: products.category,
      count: sql<number>`COUNT(*)`,
      avgMargin: sql<number>`AVG(${products.margin})`,
    }).from(products).groupBy(products.category);

    return { total: total?.count || 0, avgMargin: Number(avgMargin?.avg || 0), categories };
  }),

  create: publicQuery.input(z.object({
    name: z.string().min(1),
    category: z.string(),
    description: z.string().optional(),
    costPrice: z.string().or(z.number()),
    sellingPrice: z.string().or(z.number()),
    supplierUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    demandLevel: z.enum(["low", "medium", "high"]).optional(),
    competitionLevel: z.enum(["low", "medium", "high"]).optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = getDb();
    const cost = typeof input.costPrice === "string" ? parseFloat(input.costPrice) : input.costPrice;
    const sell = typeof input.sellingPrice === "string" ? parseFloat(input.sellingPrice) : input.sellingPrice;
    const margin = cost > 0 ? ((sell - cost) / sell * 100) : 0;

    const [result] = await db.insert(products).values({
      ...input,
      costPrice: cost.toFixed(2),
      sellingPrice: sell.toFixed(2),
      margin: margin.toFixed(2),
      createdBy: ctx.user?.id,
    });
    return { id: Number(result.insertId), success: true };
  }),

  update: publicQuery.input(z.object({
    id: z.number(),
    name: z.string().optional(),
    status: z.enum(["active", "draft", "discontinued"]).optional(),
    sellingPrice: z.string().or(z.number()).optional(),
    aiScore: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...data } = input;
    await db.update(products).set(data).where(eq(products.id, id));
    return { success: true };
  }),
});
