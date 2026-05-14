/**
 * NexusAI Tool Registry — Functions that AI agents can invoke
 * Each tool is a typed function that the orchestrator can execute.
 */
import { getDb } from "../queries/connection";
import { orders, products, customers, shipments, financialTransactions, campaigns } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";

export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
}

export type ToolName =
  | "get_order"
  | "list_orders"
  | "update_order_status"
  | "get_product"
  | "list_products"
  | "get_customer"
  | "get_shipment"
  | "get_finance_summary"
  | "get_campaign"
  | "create_recommendation"
  | "log_activity";

// ─── Tool Implementations ───
const tools: Record<ToolName, (args: Record<string, any>) => Promise<ToolResult>> = {
  // ─── Order Tools ───
  async get_order(args: { orderId: number }) {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, args.orderId));
    if (!order) return { success: false, data: null, error: "Order not found" };
    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
    return { success: true, data: { ...order, customer } };
  },

  async list_orders(args: { status?: string; limit?: number; days?: number }) {
    const db = getDb();
    const conditions = [];
    if (args.status) conditions.push(eq(orders.status, args.status as any));
    if (args.days) conditions.push(gte(orders.createdAt, new Date(Date.now() - args.days * 86400000)));

    const rows = await db.select().from(orders)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(args.limit || 20);
    return { success: true, data: rows };
  },

  async update_order_status(args: { orderId: number; status: string; notes?: string }) {
    const db = getDb();
    const updates: any = { status: args.status };
    if (args.notes) updates.notes = args.notes;
    if (args.status === "confirmed") updates.confirmedAt = new Date();
    if (args.status === "shipped") updates.shippedAt = new Date();
    if (args.status === "delivered") updates.deliveredAt = new Date();
    await db.update(orders).set(updates).where(eq(orders.id, args.orderId));
    return { success: true, data: { orderId: args.orderId, newStatus: args.status } };
  },

  // ─── Product Tools ───
  async get_product(args: { productId: number }) {
    const db = getDb();
    const [p] = await db.select().from(products).where(eq(products.id, args.productId));
    return { success: !!p, data: p, error: p ? undefined : "Product not found" };
  },

  async list_products(args: { category?: string; limit?: number; status?: string }) {
    const db = getDb();
    const conditions = [];
    if (args.category) conditions.push(eq(products.category, args.category));
    if (args.status) conditions.push(eq(products.status, args.status as any));
    const rows = await db.select().from(products)
      .where(conditions.length ? and(...conditions) : undefined)
      .limit(args.limit || 20);
    return { success: true, data: rows };
  },

  // ─── Customer Tools ───
  async get_customer(args: { customerId: number }) {
    const db = getDb();
    const [c] = await db.select().from(customers).where(eq(customers.id, args.customerId));
    const orderCount = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(eq(orders.customerId, args.customerId));
    return { success: !!c, data: { ...c, orderCount: orderCount[0]?.count || 0 }, error: c ? undefined : "Customer not found" };
  },

  // ─── Shipment Tools ───
  async get_shipment(args: { orderId: number }) {
    const db = getDb();
    const [s] = await db.select().from(shipments).where(eq(shipments.orderId, args.orderId));
    return { success: !!s, data: s, error: s ? undefined : "Shipment not found" };
  },

  // ─── Finance Tools ───
  async get_finance_summary(args: { days?: number }) {
    const db = getDb();
    const since = new Date(Date.now() - (args.days || 30) * 86400000);

    const [revenue] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions).where(and(eq(financialTransactions.type, "revenue"), gte(financialTransactions.date, since)));
    const [costs] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions).where(and(sql`${financialTransactions.type} != 'revenue'`, gte(financialTransactions.date, since)));
    const [orderCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(orders).where(gte(orders.createdAt, since));

    return {
      success: true,
      data: {
        revenue: Number(revenue?.total || 0),
        costs: Math.abs(Number(costs?.total || 0)),
        profit: Number(revenue?.total || 0) - Math.abs(Number(costs?.total || 0)),
        orderCount: orderCount?.count || 0,
        avgOrderValue: (orderCount?.count || 0) > 0 ? (Number(revenue?.total || 0) / orderCount!.count).toFixed(2) : "0",
        margin: (Number(revenue?.total || 0) > 0 ? ((Number(revenue?.total || 0) - Math.abs(Number(costs?.total || 0))) / Number(revenue?.total || 0) * 100).toFixed(1) : "0"),
      },
    };
  },

  // ─── Campaign Tools ───
  async get_campaign(args: { campaignId?: number; name?: string }) {
    const db = getDb();
    let row;
    if (args.campaignId) {
      [row] = await db.select().from(campaigns).where(eq(campaigns.id, args.campaignId));
    } else if (args.name) {
      [row] = await db.select().from(campaigns).where(sql`${campaigns.name} LIKE ${`%${args.name}%`}`);
    }
    return { success: !!row, data: row, error: row ? undefined : "Campaign not found" };
  },

  // ─── Recommendation Tool ───
  async create_recommendation(args: { agent: string; type: string; title: string; description: string; confidence: number; impact?: string; metadata?: any }) {
    const { recommendations } = await import("@db/schema");
    const db = getDb();
    const [result] = await db.insert(recommendations).values({
      agent: args.agent as any,
      type: args.type,
      title: args.title,
      description: args.description,
      confidence: args.confidence,
      impact: args.impact,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
    });
    return { success: true, data: { recommendationId: Number(result.insertId) } };
  },

  // ─── Activity Logger ───
  async log_activity(args: { agent: string; action: string; description: string; impact?: string; impactValue?: number; status?: string; metadata?: any }) {
    const { agentActivities } = await import("@db/schema");
    const db = getDb();
    await db.insert(agentActivities).values({
      agent: args.agent as any,
      action: args.action,
      description: args.description,
      impact: args.impact || "neutral",
      impactValue: args.impactValue?.toFixed(2) || "0",
      status: (args.status || "applied") as any,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
    });
    return { success: true, data: { logged: true } };
  },
};

// ─── Tool Registry ───
export class ToolRegistry {
  async execute(name: ToolName, args: Record<string, any>): Promise<ToolResult> {
    const tool = tools[name];
    if (!tool) return { success: false, data: null, error: `Unknown tool: ${name}` };
    try {
      return await tool(args);
    } catch (e: any) {
      return { success: false, data: null, error: e.message };
    }
  }

  listTools(): Array<{ name: ToolName; description: string; parameters: string[] }> {
    return [
      { name: "get_order", description: "Get order details by ID", parameters: ["orderId"] },
      { name: "list_orders", description: "List orders with optional filters", parameters: ["status?", "limit?", "days?"] },
      { name: "update_order_status", description: "Update order status", parameters: ["orderId", "status", "notes?"] },
      { name: "get_product", description: "Get product by ID", parameters: ["productId"] },
      { name: "list_products", description: "List products with filters", parameters: ["category?", "limit?", "status?"] },
      { name: "get_customer", description: "Get customer with order history", parameters: ["customerId"] },
      { name: "get_shipment", description: "Get shipment by order ID", parameters: ["orderId"] },
      { name: "get_finance_summary", description: "Get financial summary for period", parameters: ["days?"] },
      { name: "get_campaign", description: "Get campaign details", parameters: ["campaignId?", "name?"] },
      { name: "create_recommendation", description: "Create an AI recommendation", parameters: ["agent", "type", "title", "description", "confidence", "impact?"] },
      { name: "log_activity", description: "Log an agent activity", parameters: ["agent", "action", "description", "impact?", "status?"] },
    ];
  }

  getToolDescriptionsForPrompt(): string {
    return this.listTools().map(t =>
      `${t.name}(${t.parameters.join(", ")}) — ${t.description}`
    ).join("\n");
  }
}

export const toolRegistry = new ToolRegistry();
