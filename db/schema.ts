import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

// ─── Users (Auth) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

// ─── Products ───
export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  costPrice: decimal("costPrice", { precision: 12, scale: 2 }).notNull(),
  sellingPrice: decimal("sellingPrice", { precision: 12, scale: 2 }).notNull(),
  margin: decimal("margin", { precision: 5, scale: 2 }).notNull(),
  supplierUrl: text("supplierUrl"),
  imageUrl: text("imageUrl"),
  status: mysqlEnum("status", ["active", "draft", "discontinued"]).default("active").notNull(),
  aiScore: int("aiScore").default(0),
  demandLevel: mysqlEnum("demandLevel", ["low", "medium", "high"]).default("medium"),
  competitionLevel: mysqlEnum("competitionLevel", ["low", "medium", "high"]).default("medium"),
  totalSales: int("totalSales").default(0),
  totalRevenue: decimal("totalRevenue", { precision: 14, scale: 2 }).default("0"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Customers ───
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  governorate: varchar("governorate", { length: 100 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  notes: text("notes"),
  totalOrders: int("totalOrders").default(0),
  totalSpent: decimal("totalSpent", { precision: 14, scale: 2 }).default("0"),
  riskScore: int("riskScore").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Orders ───
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderCode: varchar("orderCode", { length: 50 }).notNull().unique(),
  customerId: bigint("customerId", { mode: "number", unsigned: true }).references(() => customers.id),
  productIds: json("productIds").$type<number[]>(),
  itemCount: int("itemCount").default(1),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  shippingFee: decimal("shippingFee", { precision: 10, scale: 2 }).default("0"),
  vatAmount: decimal("vatAmount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cod", "card", "wallet"]).default("cod"),
  status: mysqlEnum("status", [
    "pending", "confirmed", "cancelled", "no_answer",
    "processing", "shipped", "delivered", "returned",
    "flagged_fake"
  ]).default("pending").notNull(),
  confirmationAgent: varchar("confirmationAgent", { length: 50 }).default("ai"),
  notes: text("notes"),
  confirmedAt: timestamp("confirmedAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Shipments ───
export const shipments = mysqlTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: bigint("orderId", { mode: "number", unsigned: true }).references(() => orders.id),
  trackingCode: varchar("trackingCode", { length: 100 }),
  provider: mysqlEnum("provider", ["bosta", "aramex", "vhub", "smsa", "other"]).notNull(),
  status: mysqlEnum("status", [
    "pending", "picked_up", "in_transit", "out_for_delivery",
    "delivered", "returned", "failed"
  ]).default("pending").notNull(),
  estimatedDays: int("estimatedDays").default(2),
  actualDays: int("actualDays"),
  governorate: varchar("governorate", { length: 100 }),
  codAmount: decimal("codAmount", { precision: 12, scale: 2 }),
  deliveryFee: decimal("deliveryFee", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Campaigns ───
export const campaigns = mysqlTable("campaigns", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ["meta", "google", "tiktok", "snapchat"]).default("meta"),
  objective: mysqlEnum("objective", ["awareness", "traffic", "conversions", "retargeting"]).default("conversions"),
  status: mysqlEnum("status", ["active", "paused", "draft", "ended"]).default("draft"),
  budget: decimal("budget", { precision: 12, scale: 2 }).default("0"),
  spent: decimal("spent", { precision: 12, scale: 2 }).default("0"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  roas: decimal("roas", { precision: 5, scale: 2 }).default("0"),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"),
  cpa: decimal("cpa", { precision: 10, scale: 2 }).default("0"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Creatives ───
export const creatives = mysqlTable("creatives", {
  id: serial("id").primaryKey(),
  campaignId: bigint("campaignId", { mode: "number", unsigned: true }).references(() => campaigns.id),
  name: varchar("name", { length: 255 }).notNull(),
  format: mysqlEnum("format", ["carousel", "single_image", "video", "collection"]).notNull(),
  status: mysqlEnum("status", ["active", "paused", "testing"]).default("active"),
  aiGenerated: boolean("aiGenerated").default(false),
  imageUrl: text("imageUrl"),
  headline: varchar("headline", { length: 255 }),
  body: text("body"),
  ctaText: varchar("ctaText", { length: 100 }),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  ctr: decimal("ctr", { precision: 5, scale: 2 }).default("0"),
  roas: decimal("roas", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Landing Pages ───
export const landingPages = mysqlTable("landing_pages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  template: mysqlEnum("template", ["product", "collection", "flash_sale", "lead_capture"]).default("product"),
  status: mysqlEnum("status", ["published", "draft", "archived"]).default("draft"),
  aiOptimized: boolean("aiOptimized").default(false),
  views: int("views").default(0),
  conversions: int("conversions").default(0),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0"),
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }).default("0"),
  avgTime: int("avgTime").default(0),
  content: json("content"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Financial Transactions ───
export const financialTransactions = mysqlTable("financial_transactions", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", [
    "revenue", "ad_spend", "product_cost", "shipping_cost",
    "delivery_fee", "cod_fee", "vat_collected", "vat_paid",
    "refund", "return_cost", "other_income", "other_expense"
  ]).notNull(),
  category: varchar("category", { length: 100 }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("EGP"),
  description: text("description"),
  referenceId: varchar("referenceId", { length: 100 }),
  referenceType: mysqlEnum("referenceType", ["order", "campaign", "shipment", "other"]),
  governorate: varchar("governorate", { length: 100 }),
  date: timestamp("date").notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Team Members ───
export const teamMembers = mysqlTable("team_members", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 255 }).notNull(),
  department: mysqlEnum("department", [
    "operations", "marketing", "sales", "tech", "finance", "hr"
  ]).notNull(),
  status: mysqlEnum("status", ["active", "on_leave", "terminated"]).default("active"),
  performance: int("performance").default(0),
  attendance: int("attendance").default(0),
  shift: mysqlEnum("shift", ["morning", "evening", "night"]).default("morning"),
  joinDate: timestamp("joinDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Agent Activities ───
export const agentActivities = mysqlTable("agent_activities", {
  id: serial("id").primaryKey(),
  agent: mysqlEnum("agent", [
    "ceo", "product_hunter", "creative_director", "landing_page",
    "confirmation", "moderator", "shipping", "finance", "team"
  ]).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  description: text("description"),
  impact: varchar("impact", { length: 50 }),
  impactValue: decimal("impactValue", { precision: 12, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["pending", "applied", "dismissed", "auto_executed"]).default("pending"),
  metadata: json("metadata"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Recommendations (AI Suggestions) ───
export const recommendations = mysqlTable("recommendations", {
  id: serial("id").primaryKey(),
  agent: mysqlEnum("agent", [
    "ceo", "product_hunter", "creative_director", "landing_page",
    "confirmation", "moderator", "shipping", "finance", "team"
  ]).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  confidence: int("confidence").default(0),
  impact: varchar("impact", { length: 100 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "applied"]).default("pending"),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── KPI Snapshots ───
export const kpiSnapshots = mysqlTable("kpi_snapshots", {
  id: serial("id").primaryKey(),
  metric: varchar("metric", { length: 100 }).notNull(),
  value: decimal("value", { precision: 14, scale: 2 }).notNull(),
  label: varchar("label", { length: 255 }),
  period: mysqlEnum("period", ["daily", "weekly", "monthly"]).default("daily"),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
