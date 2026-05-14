import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { products, recommendations, agentActivities } from "@db/schema";

// ─── OpenAI Integration ───
async function openAIChat(messages: Array<{ role: string; content: string }>, model = "gpt-4o-mini") {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { success: false, error: "OPENAI_API_KEY not configured", content: null };
  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 2000 }),
    });
    const data = await resp.json();
    if (data.error) return { success: false, error: data.error.message, content: null };
    return { success: true, content: data.choices?.[0]?.message?.content, usage: data.usage };
  } catch (e) {
    return { success: false, error: (e as Error).message, content: null };
  }
}

// ─── Anthropic Claude Integration ───
async function claudeChat(messages: Array<{ role: string; content: string }>, model = "claude-3-5-haiku-20241022") {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { success: false, error: "ANTHROPIC_API_KEY not configured", content: null };
  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, max_tokens: 2000 }),
    });
    const data = await resp.json();
    if (data.error) return { success: false, error: data.error.message, content: null };
    return { success: true, content: data.content?.[0]?.text, usage: data.usage };
  } catch (e) {
    return { success: false, error: (e as Error).message, content: null };
  }
}

export const aiRouter = createRouter({
  // AI-powered product research
  productResearch: publicQuery.input(z.object({
    niche: z.string(),
    budget: z.number().optional(),
    targetMarket: z.string().default("Egypt"),
  })).query(async ({ input }) => {
    const { success, content, error } = await openAIChat([
      { role: "system", content: "You are an expert e-commerce product researcher specializing in the Egyptian market. Analyze trends, competition, margins, and demand. Respond in JSON format with: products array (name, category, estimatedCost, estimatedPrice, margin, demand, competition, aiScore 0-100, reasoning)." },
      { role: "user", content: `Find 5 winning products for ${input.niche} market in ${input.targetMarket}${input.budget ? ` with budget under EGP ${input.budget}` : ""}. Focus on products with high margins, growing demand, and low competition. Consider COD preference and local shipping logistics.` },
    ]);

    if (!success) return { error, recommendations: [] };
    try {
      const parsed = JSON.parse(content || "{}");
      return { recommendations: parsed.products || [], raw: content };
    } catch {
      return { recommendations: [], raw: content, error: "Parse error" };
    }
  }),

  // AI creative generation for ads
  generateCreative: publicQuery.input(z.object({
    productName: z.string(),
    productDescription: z.string(),
    targetAudience: z.string().default("Egypt 18-45"),
    platform: z.enum(["meta", "google", "tiktok"]).default("meta"),
    language: z.enum(["ar", "en", "both"]).default("both"),
  })).query(async ({ input }) => {
    const { success, content, error } = await openAIChat([
      { role: "system", content: "You are a senior performance marketing creative director. Generate high-converting ad copy and headlines. Respond in JSON with: headlines (array of 5), bodyTexts (array of 5), ctas (array of 3), targetingSuggestions, visualDirection. Write Arabic copy for Egyptian market." },
      { role: "user", content: `Generate ad creative for: ${input.productName}\nDescription: ${input.productDescription}\nPlatform: ${input.platform}\nAudience: ${input.targetAudience}\nLanguage: ${input.language}` },
    ]);

    if (!success) return { error, creative: null };
    try {
      return { creative: JSON.parse(content || "{}"), raw: content };
    } catch {
      return { creative: null, raw: content, error: "Parse error" };
    }
  }),

  // AI financial analysis
  financialAnalysis: publicQuery.query(async () => {
    const db = getDb();
    const { success, content, error } = await openAIChat([
      { role: "system", content: "You are a financial analyst for Egyptian e-commerce. Analyze financial data and provide actionable recommendations. Respond in JSON with: summary, alerts (array), recommendations (array with title, description, impact, confidence), projectedRevenue." },
      { role: "user", content: "Analyze the latest financial data from the database and provide key insights for the Egyptian e-commerce operation. Focus on cash flow, ad spend efficiency, and profit margins." },
    ]);

    if (!success) return { error, analysis: null };
    try {
      const parsed = JSON.parse(content || "{}");
      // Save recommendations to DB
      if (parsed.recommendations) {
        for (const rec of parsed.recommendations) {
          await db.insert(recommendations).values({
            agent: "finance", type: "ai_analysis", title: rec.title,
            description: rec.description, confidence: rec.confidence || 80,
            impact: rec.impact, status: "pending",
          }).catch(() => {});
        }
      }
      return { analysis: parsed };
    } catch {
      return { analysis: null, raw: content, error: "Parse error" };
    }
  }),

  // AI order risk assessment
  assessOrderRisk: publicQuery.input(z.object({
    orderId: z.number(),
  })).query(async ({ input }) => {
    const db = getDb();
    const { success, content, error } = await openAIChat([
      { role: "system", content: "You are a fraud detection specialist for Egyptian COD e-commerce. Assess order risk based on patterns. Respond in JSON with: riskScore (0-100), riskLevel (low/medium/high), flags (array), recommendation (approve/review/cancel)." },
      { role: "user", content: `Assess risk for order ${input.orderId}. Consider: customer history, order value, governorate, phone patterns, and typical fraud indicators in Egyptian e-commerce.` },
    ]);

    if (!success) return { error, assessment: null };
    try {
      const parsed = JSON.parse(content || "{}");
      // Log activity
      await db.insert(agentActivities).values({
        agent: "moderator", action: "Risk Assessment",
        description: `Order ${input.orderId}: ${parsed.riskLevel} risk (${parsed.riskScore})`,
        impact: parsed.riskLevel === "high" ? "negative" : "positive",
        status: "auto_executed",
      }).catch(() => {});
      return { assessment: parsed };
    } catch {
      return { assessment: null, raw: content, error: "Parse error" };
    }
  }),

  // AI chat assistant
  chat: publicQuery.input(z.object({
    message: z.string(),
    context: z.string().optional(),
    agent: z.string().default("ceo"),
  })).query(async ({ input }) => {
    const systemPrompts: Record<string, string> = {
      ceo: "You are the CEO AI assistant for NexusAI, an Egyptian e-commerce operating system. Provide strategic business advice.",
      product_hunter: "You are a product research AI. Help find winning products for the Egyptian market.",
      creative_director: "You are a creative AI. Generate ad copy, headlines, and visual concepts.",
      finance: "You are a financial AI analyst. Analyze P&L, cash flow, and provide cost optimization advice.",
      shipping: "You are a logistics AI. Optimize shipping routes, carrier selection, and delivery times.",
      moderator: "You are a fraud detection AI. Identify fake orders and assess customer risk.",
    };

    const systemPrompt = systemPrompts[input.agent] || systemPrompts.ceo;
    const { success, content, error } = await openAIChat([
      { role: "system", content: systemPrompt },
      ...(input.context ? [{ role: "user" as const, content: input.context }] : []),
      { role: "user", content: input.message },
    ]);

    return { response: content, error };
  }),

  // Generic AI completion (for any use case)
  complete: publicQuery.input(z.object({
    prompt: z.string(),
    model: z.enum(["gpt-4o-mini", "gpt-4o", "claude-3-5-haiku"]).default("gpt-4o-mini"),
    systemPrompt: z.string().optional(),
  })).query(async ({ input }) => {
    const messages = [
      ...(input.systemPrompt ? [{ role: "system", content: input.systemPrompt }] : []),
      { role: "user", content: input.prompt },
    ];

    if (input.model.startsWith("claude")) {
      return claudeChat(messages, input.model === "claude-3-5-haiku" ? "claude-3-5-haiku-20241022" : "claude-3-5-sonnet-20241022");
    }
    return openAIChat(messages, input.model);
  }),
});
