import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getGemini } from "./ai/gemini-service";
import { orchestrator } from "./ai/orchestrator";
import { contextManager } from "./ai/memory";
import { toolRegistry } from "./ai/tools";
import {
  financialAI,
  productAI,
  marketingAI,
  riskAI,
  shippingAI,
  recommendationEngine,
} from "./ai/agents";

export const aiRouter = createRouter({
  // ─── Gemini Core ───
  generate: publicQuery.input(z.object({
    prompt: z.string(),
    systemPrompt: z.string().optional(),
    expectJson: z.boolean().default(true),
    model: z.enum(["pro", "flash"]).default("pro"),
  })).query(async ({ input }) => {
    const gemini = getGemini();
    return gemini.generate({
      systemInstruction: input.systemPrompt,
      messages: [{ role: "user", content: input.prompt }],
      expectJson: input.expectJson,
      model: input.model,
      config: { temperature: 0.3, maxOutputTokens: 8192 },
    });
  }),

  stream: publicQuery.input(z.object({
    prompt: z.string(),
    systemPrompt: z.string().optional(),
  })).query(async function* ({ input }) {
    const gemini = getGemini();
    const stream = gemini.streamGenerate({
      systemInstruction: input.systemPrompt,
      messages: [{ role: "user", content: input.prompt }],
      config: { temperature: 0.7 },
    });
    for await (const chunk of stream) {
      yield chunk;
    }
  }),

  chat: publicQuery.input(z.object({
    message: z.string(),
    agent: z.enum(["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"]).default("ceo"),
    context: z.string().optional(),
  })).query(async ({ input }) => {
    return orchestrator.quickAnalyze(input.agent, `${input.message}${input.context ? `\n\nContext: ${input.context}` : ""}`);
  }),

  // ─── Multi-Agent Orchestration ───
  orchestrate: publicQuery.input(z.object({
    objective: z.string(),
    context: z.string().optional(),
  })).mutation(async ({ input }) => {
    return orchestrator.planAndExecute(input.objective, input.context);
  }),

  executeTask: publicQuery.input(z.object({
    agent: z.enum(["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"]),
    action: z.string(),
    params: z.record(z.any()).default({}),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  })).mutation(async ({ input }) => {
    return orchestrator.execute({
      id: `task_${Date.now()}`,
      agent: input.agent,
      action: input.action,
      params: input.params,
      priority: input.priority,
    });
  }),

  // ─── Financial Agent ───
  financialPnl: publicQuery.input(z.object({
    days: z.number().default(30),
  })).query(async ({ input }) => {
    return financialAI.analyzePnl(input.days);
  }),

  financialForecast: publicQuery.input(z.object({
    days: z.number().default(30),
  })).query(async ({ input }) => {
    return financialAI.forecastCashFlow(input.days);
  }),

  financialAnomalies: publicQuery.query(async () => {
    return financialAI.detectAnomalies();
  }),

  // ─── Product Research Agent ───
  productAnalyze: publicQuery.query(async () => {
    return productAI.analyzeCurrentProducts();
  }),

  productResearch: publicQuery.input(z.object({
    niche: z.string(),
  })).query(async ({ input }) => {
    return productAI.researchNewProducts(input.niche);
  }),

  productOptimizeMargins: publicQuery.query(async () => {
    return productAI.optimizeMargins();
  }),

  // ─── Marketing Agent ───
  generateCreative: publicQuery.input(z.object({
    productName: z.string(),
    audience: z.string().default("Egypt 18-45"),
  })).query(async ({ input }) => {
    return marketingAI.generateAdCreative(input.productName, input.audience);
  }),

  analyzeCampaigns: publicQuery.query(async () => {
    return marketingAI.analyzeCampaignPerformance();
  }),

  generateSequence: publicQuery.input(z.object({
    orderId: z.number(),
  })).query(async ({ input }) => {
    return marketingAI.generateEmailSequence(input.orderId);
  }),

  // ─── Risk Assessment Agent ───
  assessOrderRisk: publicQuery.input(z.object({
    orderId: z.number(),
  })).query(async ({ input }) => {
    return riskAI.assessOrder(input.orderId);
  }),

  detectBulkFraud: publicQuery.input(z.object({
    orderIds: z.array(z.number()),
  })).query(async ({ input }) => {
    return riskAI.detectBulkFakes(input.orderIds);
  }),

  confirmationScript: publicQuery.input(z.object({
    customerType: z.string().default("new"),
  })).query(async ({ input }) => {
    return riskAI.optimizeConfirmationScript(input.customerType);
  }),

  // ─── Shipping Agent ───
  optimizeShipping: publicQuery.input(z.object({
    orderId: z.number(),
  })).query(async ({ input }) => {
    return shippingAI.optimizeRoute(input.orderId);
  }),

  providerPerformance: publicQuery.query(async () => {
    return shippingAI.analyzeProviderPerformance();
  }),

  predictDeliveryIssues: publicQuery.query(async () => {
    return shippingAI.predictDeliveryIssues();
  }),

  // ─── Recommendation Engine ───
  recommendations: publicQuery.input(z.object({
    limit: z.number().default(20),
  })).query(async ({ input }) => {
    return recommendationEngine.scoreAndRank(input.limit);
  }),

  autoApprove: publicQuery.input(z.object({
    safeOnly: z.boolean().default(true),
  })).mutation(async ({ input }) => {
    return recommendationEngine.autoApprove(input.safeOnly);
  }),

  // ─── Tool Execution ───
  executeTool: publicQuery.input(z.object({
    tool: z.string(),
    args: z.record(z.any()).default({}),
  })).mutation(async ({ input }) => {
    return toolRegistry.execute(input.tool as any, input.args);
  }),

  listTools: publicQuery.query(async () => {
    return toolRegistry.listTools();
  }),

  // ─── Context Management ───
  context: publicQuery.input(z.object({
    agent: z.enum(["ceo", "product_hunter", "creative_director", "landing_page", "confirmation", "moderator", "shipping", "finance", "team"]),
  })).query(async ({ input }) => {
    const memory = contextManager.getAgentMemory(input.agent);
    return {
      activities: await memory.getRecentActivities(20),
      context: await memory.buildContextString(),
    };
  }),

  crossAgentSummary: publicQuery.query(async () => {
    return contextManager.buildCrossAgentSummary();
  }),

  // ─── Budget & Health ───
  budgetStatus: publicQuery.query(async () => {
    return getGemini().budgetStatus();
  }),
});
