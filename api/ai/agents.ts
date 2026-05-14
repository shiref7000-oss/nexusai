/**
 * NexusAI Specialized Agents — Domain-specific AI agents
 * Each agent has a focused system prompt, tool access, and structured output.
 */
import { getGemini } from "./gemini-service";
import { contextManager, type AgentId } from "./memory";
import { toolRegistry } from "./tools";
import { getDb } from "../queries/connection";
import { recommendations, agentActivities } from "@db/schema";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { orders, products, customers, shipments, financialTransactions, campaigns } from "@db/schema";

// ─── Base Agent Class ───
abstract class BaseAgent {
  protected agentId: AgentId;

  constructor(agentId: AgentId) {
    this.agentId = agentId;
  }

  protected async callAI(query: string, systemExtra?: string, expectJson = true) {
    const gemini = getGemini();
    const memory = contextManager.getAgentMemory(this.agentId);
    const history = await memory.buildContextString(5);

    const result = await gemini.generate({
      systemInstruction: `${this.getSystemPrompt()}\n\nRecent context:\n${history}${systemExtra ? `\n\n${systemExtra}` : ""}\n\nAvailable tools:\n${toolRegistry.getToolDescriptionsForPrompt()}`,
      messages: [{ role: "user", content: query }],
      expectJson,
      config: { temperature: 0.3, maxOutputTokens: 8192 },
    });

    // Store to memory
    if (result.content) {
      await memory.add({
        role: "agent",
        content: result.content,
        metadata: { action: "analysis", confidence: result.parsed?.confidence || 80 },
      });
    }

    // Persist recommendations
    if (result.parsed?.recommendations) {
      const db = getDb();
      for (const rec of result.parsed.recommendations) {
        await db.insert(recommendations).values({
          agent: this.agentId, type: "ai_analysis", title: rec.title,
          description: rec.description, confidence: rec.confidence || 80,
          impact: rec.impact, status: "pending",
        }).catch(() => {});
      }
    }

    return result;
  }

  abstract getSystemPrompt(): string;
}

// ─── 1. Financial Analysis Agent ───
export class FinancialAgent extends BaseAgent {
  constructor() { super("finance"); }

  getSystemPrompt(): string {
    return `You are the Finance AI Agent for NexusAI, an Egyptian e-commerce company operating 1000+ shipments/month. Analyze financial data with Egyptian market specifics: 14% VAT, COD fees (2-5%), multi-provider shipping costs, and seasonal patterns. Provide actionable recommendations to improve margins and cash flow.`;
  }

  async analyzePnl(days: number = 30) {
    const db = getDb();
    const since = new Date(Date.now() - days * 86400000);

    const [revenue] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
      .from(financialTransactions).where(and(eq(financialTransactions.type, "revenue"), gte(financialTransactions.date, since)));
    const [costs] = await db.select({ total: sql<number>`COALESCE(SUM(ABS(amount)), 0)` })
      .from(financialTransactions).where(and(sql`${financialTransactions.type} != 'revenue'`, gte(financialTransactions.date, since)));
    const [orderStats] = await db.select({
      count: sql<number>`COUNT(*)`, avgValue: sql<number>`AVG(totalAmount)`,
    }).from(orders).where(gte(orders.createdAt, since));

    return this.callAI(
      `Analyze P&L for last ${days} days:\nRevenue: EGP ${Number(revenue?.total || 0).toLocaleString()}\nCosts: EGP ${Number(costs?.total || 0).toLocaleString()}\nOrders: ${orderStats?.count || 0}\nAvg Order: EGP ${Number(orderStats?.avgValue || 0).toFixed(2)}`,
      `Focus on: net margin, cost breakdown, ad spend efficiency, and cash flow trajectory.`
    );
  }

  async forecastCashFlow(days: number = 30) {
    const db = getDb();
    const trend = await db.select({
      date: sql<string>`DATE(date)`,
      revenue: sql<number>`SUM(CASE WHEN type='revenue' THEN amount ELSE 0 END)`,
      costs: sql<number>`SUM(CASE WHEN type!='revenue' THEN ABS(amount) ELSE 0 END)`,
    }).from(financialTransactions)
      .where(gte(financialTransactions.date, new Date(Date.now() - days * 86400000)))
      .groupBy(sql`DATE(date)`)
      .orderBy(sql`DATE(date)`);

    return this.callAI(
      `Forecast cash flow based on ${days}-day trend:\n${JSON.stringify(trend)}`,
      `Predict next 30 days revenue, flag cash flow risks, recommend budget adjustments.`
    );
  }

  async detectAnomalies() {
    const db = getDb();
    const recent = await db.select().from(financialTransactions)
      .orderBy(desc(financialTransactions.date)).limit(100);

    return this.callAI(
      `Detect financial anomalies in recent transactions:\n${JSON.stringify(recent.slice(0, 20))}`,
      `Look for: unusual ad spend spikes, refund patterns, shipping cost outliers, VAT discrepancies.`
    );
  }
}

// ─── 2. Product Research Agent ───
export class ProductResearchAgent extends BaseAgent {
  constructor() { super("product_hunter"); }

  getSystemPrompt(): string {
    return `You are the Product Hunter AI for Egyptian e-commerce. Research winning products considering: COD payment preference (no card needed), low return rates, compact/lightweight for cheap shipping, universal appeal across Egyptian demographics, 3x+ margin potential, and fast delivery compatibility. Focus on categories: electronics accessories, home organizers, beauty tools, fitness gear, kitchen gadgets.`;
  }

  async analyzeCurrentProducts() {
    const db = getDb();
    const prods = await db.select().from(products).orderBy(desc(products.aiScore)).limit(15);
    return this.callAI(
      `Analyze current product catalog:\n${JSON.stringify(prods.map(p => ({
        name: p.name, category: p.category, cost: p.costPrice, price: p.sellingPrice,
        margin: p.margin, score: p.aiScore, demand: p.demandLevel, sales: p.totalSales,
      })))}`,
      `Identify top performers, underperformers, and gap opportunities in the catalog.`
    );
  }

  async researchNewProducts(niche: string) {
    return this.callAI(
      `Research winning products in niche: "${niche}" for Egyptian e-commerce market.`,
      `Provide 5 specific products with: name, category, estimated cost (EGP), selling price, margin %, demand level, competition level, supplier suggestion, and confidence score (0-100).`,
    );
  }

  async optimizeMargins() {
    const db = getDb();
    const lowMargin = await db.select().from(products)
      .where(sql`${products.margin} < 40 AND ${products.status} = 'active'`)
      .orderBy(products.margin).limit(10);

    return this.callAI(
      `Optimize pricing for low-margin products:\n${JSON.stringify(lowMargin.map(p => ({
        name: p.name, cost: p.costPrice, currentPrice: p.sellingPrice, margin: p.margin,
      })))}`,
      `Suggest price increases, bundle strategies, or cost reduction for each product.`
    );
  }
}

// ─── 3. Marketing/Creative Agent ───
export class MarketingAgent extends BaseAgent {
  constructor() { super("creative_director"); }

  getSystemPrompt(): string {
    return `You are the Creative Director AI for Egyptian e-commerce. Generate high-converting ads in Egyptian Arabic (with English when needed). Understand local buying triggers: urgency, social proof, scarcity, value-for-money, trust signals. Optimize for Meta Ads (Facebook/Instagram) with COD-friendly messaging. A/B test everything.`;
  }

  async generateAdCreative(productName: string, audience: string) {
    return this.callAI(
      `Generate complete ad creative for: "${productName}" targeting: ${audience}`,
      `Provide: 5 Egyptian Arabic headlines with Egyptian dialect, 3 body texts, 2 CTA options, visual direction, targeting suggestions, and estimated CTR.`,
    );
  }

  async analyzeCampaignPerformance() {
    const db = getDb();
    const camps = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt)).limit(10);
    return this.callAI(
      `Analyze campaign performance:\n${JSON.stringify(camps.map(c => ({
        name: c.name, platform: c.platform, status: c.status, spent: c.spent,
        roas: c.roas, ctr: c.ctr, cpa: c.cpa, conversions: c.conversions,
      })))}`,
      `Identify winners/losers, reallocation opportunities, and creative fatigue signals.`
    );
  }

  async generateEmailSequence(orderId: number) {
    return this.callAI(
      `Generate post-purchase email/WhatsApp sequence for order ${orderId}`,
      `Create: confirmation message, shipping notification, delivery reminder, and review request — all in Egyptian Arabic.`,
    );
  }
}

// ─── 4. Order Risk Assessment Agent ───
export class RiskAssessmentAgent extends BaseAgent {
  constructor() { super("moderator"); }

  getSystemPrompt(): string {
    return `You are the Fraud Detection AI for Egyptian COD e-commerce. Analyze orders for risk of fake/cancelled delivery. Key risk factors in Egypt: new customers with high-value orders, certain governorates with higher return rates, phone number patterns (virtual numbers), repeated failed deliveries to same address, orders placed at unusual hours, and customers with previous cancellations.`;
  }

  async assessOrder(orderId: number) {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return { error: "Order not found" };

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
    const customerOrders = await db.select({
      total: sql<number>`COUNT(*)`,
      cancelled: sql<number>`SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)`,
      returned: sql<number>`SUM(CASE WHEN status='returned' THEN 1 ELSE 0 END)`,
    }).from(orders).where(eq(orders.customerId, customer?.id || 0));

    return this.callAI(
      `Assess risk for order ${order.orderCode}:\nAmount: EGP ${order.totalAmount}\nPayment: ${order.paymentMethod}\nCustomer: ${customer?.name} (${customer?.governorate})\nPhone: ${customer?.phone}\nOrder history: ${JSON.stringify(customerOrders[0])}`,
      `Return structured risk assessment with score (0-100), risk level (low/medium/high/critical), specific flags, and recommendation.`
    );
  }

  async detectBulkFakes(orderIds: number[]) {
    return this.callAI(
      `Analyze ${orderIds.length} orders for bulk fraud patterns: ${orderIds.join(", ")}`,
      `Look for: duplicate addresses, similar phone numbers, coordinated ordering patterns, and flag suspicious clusters.`
    );
  }

  async optimizeConfirmationScript(customerType: string) {
    return this.callAI(
      `Generate optimized confirmation script for ${customerType} customer type in Egyptian Arabic.`,
      `Include: opening, verification questions, objection handling, and closing. Keep it natural and conversational.`
    );
  }
}

// ─── 5. Shipping Optimization Agent ───
export class ShippingAgent extends BaseAgent {
  constructor() { super("shipping"); }

  getSystemPrompt(): string {
    return `You are the Shipping Optimization AI for Egyptian e-commerce. Optimize across Bosta, Aramex, VHub, and SMSA. Consider: delivery speed per governorate, cost per provider, COD handling fees, failure rates by region, seasonal capacity constraints, and customer satisfaction.`;
  }

  async optimizeRoute(orderId: number) {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return { error: "Order not found" };

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));

    return this.callAI(
      `Recommend best shipping provider for order to ${customer?.governorate}, ${customer?.city}.\nOrder value: EGP ${order.totalAmount}, COD: ${order.paymentMethod === "cod"}.`,
      `Compare Bosta, Aramex, VHub, SMSA for this destination. Consider: speed, cost, reliability, COD handling.`
    );
  }

  async analyzeProviderPerformance() {
    const db = getDb();
    const stats = await db.select({
      provider: shipments.provider,
      total: sql<number>`COUNT(*)`,
      delivered: sql<number>`SUM(CASE WHEN status='delivered' THEN 1 ELSE 0 END)`,
      avgDays: sql<number>`AVG(actualDays)`,
    }).from(shipments).groupBy(shipments.provider);

    return this.callAI(
      `Analyze provider performance:\n${JSON.stringify(stats)}`,
      `Calculate delivery rates, avg times, recommend provider mix adjustments per governorate.`
    );
  }

  async predictDeliveryIssues() {
    const db = getDb();
    const atRisk = await db.select().from(shipments)
      .where(and(
        sql`${shipments.status} IN ('in_transit', 'out_for_delivery')`,
        sql`${shipments.estimatedDays} > 3`
      ))
      .limit(20);

    return this.callAI(
      `Predict delivery issues for ${atRisk.length} delayed shipments:\n${JSON.stringify(atRisk)}`,
      `Flag high-risk deliveries, suggest proactive customer communication, and recommend escalation.`
    );
  }
}

// ─── 6. Recommendation Engine ───
export class RecommendationEngine {
  async scoreAndRank(limit: number = 20) {
    const db = getDb();
    const recs = await db.select().from(recommendations)
      .where(eq(recommendations.status, "pending"))
      .orderBy(desc(recommendations.confidence))
      .limit(limit);

    // Score based on confidence + recency + agent priority
    const scored = recs.map(r => {
      let priorityScore = 0;
      const agentPriority: Record<string, number> = {
        finance: 10, moderator: 9, shipping: 8, confirmation: 7,
        product_hunter: 6, creative_director: 5, ceo: 4, landing_page: 3, team: 2,
      };
      priorityScore += (r.confidence || 0) * 0.5;
      priorityScore += (agentPriority[r.agent] || 0) * 5;
      priorityScore += Math.min(20, (Date.now() - new Date(r.createdAt || Date.now()).getTime()) / (86400000)); // +1 per day old

      return { ...r, priorityScore: Math.round(priorityScore) };
    });

    return scored.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  async autoApprove(lowRiskOnly = true) {
    const db = getDb();
    const candidates = await db.select().from(recommendations)
      .where(and(eq(recommendations.status, "pending"), sql`${recommendations.confidence} >= 90`));

    const approved = [];
    for (const c of candidates) {
      if (lowRiskOnly && c.agent === "moderator") continue; // Never auto-approve risk decisions
      await db.update(recommendations).set({ status: "approved" }).where(eq(recommendations.id, c.id));
      approved.push(c.id);
    }
    return approved;
  }
}

// ─── Singleton Exports ───
export const financialAI = new FinancialAgent();
export const productAI = new ProductResearchAgent();
export const marketingAI = new MarketingAgent();
export const riskAI = new RiskAssessmentAgent();
export const shippingAI = new ShippingAgent();
export const recommendationEngine = new RecommendationEngine();
