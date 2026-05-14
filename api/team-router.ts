import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { teamMembers } from "@db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const teamRouter = createRouter({
  list: publicQuery.input(z.object({
    department: z.string().optional(),
    status: z.string().optional(),
  }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.department) conditions.push(eq(teamMembers.department, input.department as any));
    if (input?.status) conditions.push(eq(teamMembers.status, input.status as any));

    return db.select().from(teamMembers)
      .where(conditions.length ? sql`${conditions.join(" AND ")}` : undefined)
      .orderBy(desc(teamMembers.createdAt));
  }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const [totals] = await db.select({
      total: sql<number>`COUNT(*)`,
      present: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
      onLeave: sql<number>`SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END)`,
      avgPerformance: sql<number>`COALESCE(AVG(performance), 0)`,
      avgAttendance: sql<number>`COALESCE(AVG(attendance), 0)`,
    }).from(teamMembers);

    const byDepartment = await db.select({
      department: teamMembers.department,
      count: sql<number>`COUNT(*)`,
      avgPerformance: sql<number>`AVG(performance)`,
    }).from(teamMembers).groupBy(teamMembers.department);

    const byShift = await db.select({
      shift: teamMembers.shift,
      count: sql<number>`COUNT(*)`,
    }).from(teamMembers).groupBy(teamMembers.shift);

    return {
      total: Number(totals?.total || 0),
      present: Number(totals?.present || 0),
      onLeave: Number(totals?.onLeave || 0),
      avgPerformance: Number(totals?.avgPerformance || 0).toFixed(1),
      avgAttendance: Number(totals?.avgAttendance || 0).toFixed(1),
      byDepartment,
      byShift,
    };
  }),

  create: publicQuery.input(z.object({
    name: z.string().min(1),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string().min(1),
    department: z.enum(["operations", "marketing", "sales", "tech", "finance", "hr"]),
    shift: z.enum(["morning", "evening", "night"]).default("morning"),
    joinDate: z.string(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const [result] = await db.insert(teamMembers).values({
      ...input,
      joinDate: new Date(input.joinDate),
    });
    return { id: Number(result.insertId), success: true };
  }),

  updateStatus: publicQuery.input(z.object({
    id: z.number(),
    status: z.enum(["active", "on_leave", "terminated"]),
    performance: z.number().optional(),
    attendance: z.number().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const { id, ...updates } = input;
    await db.update(teamMembers).set(updates).where(eq(teamMembers.id, id));
    return { success: true };
  }),
});
