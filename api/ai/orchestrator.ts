/**
 * NexusAI Orchestrator — Multi-agent task coordination system
 * Routes tasks to specialized agents, manages execution chains,
 * handles cross-agent communication, and aggregates results.
 */
import { getGemini, type AIRequest, type AIResponse } from "./gemini-service";
import { contextManager, type AgentId } from "./memory";
import { toolRegistry } from "./tools";
import { getDb } from "../queries/connection";
import { recommendations, agentActivities } from "@db/schema";
import { desc } from "drizzle-orm";

// ─── Types ───
export interface Task {
  id: string;
  agent: AgentId;
  action: string;
  params: Record<string, any>;
  priority: "low" | "medium" | "high" | "critical";
  context?: string;
}

export interface TaskPlan {
  objective: string;
  tasks: Task[];
  estimatedTokens: number;
}

export interface AgentResult {
  agent: AgentId;
  task: string;
  output: any;
  confidence: number;
  actionsTaken: string[];
  recommendations: Array<{
    title: string; description: string; confidence: number; impact: string;
  }>;
}

// ─── Task Planner ───
export class TaskPlanner {
  async plan(objective: string, context?: string): Promise<TaskPlan> {
    const gemini = getGemini();
    const tools = toolRegistry.getToolDescriptionsForPrompt();

    const result = await gemini.generate<TaskPlan>({
      systemInstruction: `You are the NexusAI Task Planner. Given a business objective, break it into sequential tasks that agents can execute. Available tools:\n${tools}\n\nRespond in JSON: { "objective": string, "tasks": [{ "id": string, "agent": string, "action": string, "params": object, "priority": "low|medium|high|critical" }], "estimatedTokens": number }`,
      messages: [{ role: "user", content: `Objective: ${objective}${context ? `\nContext: ${context}` : ""}` }],
      expectJson: true,
      config: { temperature: 0.2, maxOutputTokens: 4096 },
    });

    if (result.parsed) return result.parsed;

    return {
      objective,
      tasks: [{ id: "t1", agent: "ceo", action: "analyze", params: { query: objective }, priority: "medium" }],
      estimatedTokens: 1000,
    };
  }
}

// ─── Orchestrator ───
export class AgentOrchestrator {
  private planner: TaskPlanner;

  constructor() {
    this.planner = new TaskPlanner();
  }

  // Execute a single task on a specific agent
  async execute(task: Task): Promise<AgentResult> {
    const memory = contextManager.getAgentMemory(task.agent);
    const gemini = getGemini();

    const historyContext = await memory.buildContextString(5);
    const tools = toolRegistry.getToolDescriptionsForPrompt();
    const systemPrompt = this.buildAgentSystemPrompt(task.agent, tools, historyContext);

    const { response, toolCalls } = await gemini.generateWithTools(
      {
        systemInstruction: systemPrompt,
        messages: [
          { role: "user", content: `Task: ${task.action}\nParameters: ${JSON.stringify(task.params)}\n${task.context ? `Additional context: ${task.context}` : ""}` },
        ],
        expectJson: true,
        config: { temperature: 0.3, maxOutputTokens: 4096 },
      },
      this.getAgentTools(task.agent)
    );

    // Execute any tool calls
    const actionsTaken: string[] = [];
    for (const tc of toolCalls) {
      const result = await toolRegistry.execute(tc.name as any, tc.args);
      actionsTaken.push(`${tc.name}(${JSON.stringify(tc.args)}) => ${result.success ? "OK" : "FAIL"}`);
    }

    let output: any = response.parsed || { analysis: response.content };
    let confidence = output.confidence || 80;

    // Store to memory
    await memory.add({
      role: "agent",
      content: response.content || JSON.stringify(output),
      metadata: { action: task.action, params: task.params, confidence, agent: task.agent },
    });

    // Create recommendations if any
    const recs = output.recommendations || [];
    for (const rec of recs) {
      const db = getDb();
      await db.insert(recommendations).values({
        agent: task.agent, type: "ai_generated", title: rec.title,
        description: rec.description, confidence: rec.confidence || confidence,
        impact: rec.impact, status: "pending",
      }).catch(() => {});
    }

    return {
      agent: task.agent,
      task: task.action,
      output,
      confidence,
      actionsTaken,
      recommendations: recs,
    };
  }

  // Execute a full plan (chain of tasks)
  async executePlan(plan: TaskPlan): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    for (const task of plan.tasks) {
      if (results.length > 0) {
        task.context = `Previous results: ${JSON.stringify(results.slice(-2).map(r => ({
          agent: r.agent, output: r.output?.summary || r.output?.analysis || "done",
        })))}`;
      }
      const result = await this.execute(task);
      results.push(result);
    }
    return results;
  }

  // Plan and execute from a natural language objective
  async planAndExecute(objective: string, context?: string): Promise<{
    plan: TaskPlan; results: AgentResult[];
  }> {
    const plan = await this.planner.plan(objective, context);
    const results = await this.executePlan(plan);
    return { plan, results };
  }

  // Quick single-agent analysis
  async quickAnalyze(agent: AgentId, query: string): Promise<AIResponse> {
    const gemini = getGemini();
    const memory = contextManager.getAgentMemory(agent);
    const history = await memory.buildContextString(3);

    return gemini.generate({
      systemInstruction: this.buildAgentSystemPrompt(agent, toolRegistry.getToolDescriptionsForPrompt(), history),
      messages: [{ role: "user", content: query }],
      expectJson: true,
      config: { temperature: 0.3, maxOutputTokens: 4096 },
    });
  }

  private buildAgentSystemPrompt(agent: AgentId, tools: string, history: string): string {
    const prompts: Record<AgentId, string> = {
      ceo: `You are the CEO AI Agent for NexusAI, an Egyptian e-commerce company. You analyze business performance, make strategic recommendations, and coordinate other agents. You have access to company-wide data.`,
      product_hunter: `You are the Product Hunter AI Agent. You research winning products for Egyptian e-commerce, analyze margins, demand, competition, and supplier availability. Focus on COD-friendly products with fast shipping.`,
      creative_director: `You are the Creative Director AI Agent. You generate high-converting ad copy, headlines, and creative concepts for Egyptian audiences. Write in Arabic and English. Understand local culture and buying triggers.`,
      landing_page: `You are the Landing Page AI Agent. You optimize page layouts, CTAs, and copy for maximum conversion. You understand Egyptian consumer psychology and mobile-first design.`,
      confirmation: `You are the Order Confirmation AI Agent. You verify orders, detect fake orders, optimize confirmation scripts for Egyptian customers, and handle COD verification.`,
      moderator: `You are the Moderator AI Agent. You detect fraudulent orders, analyze customer risk patterns, and protect the business from returns and scams.`,
      shipping: `You are the Shipping AI Agent. You optimize delivery routes, select best carriers per governorate, predict delivery times, and minimize shipping costs for Egyptian logistics.`,
      finance: `You are the Finance AI Agent. You analyze P&L, cash flow, ad spend efficiency, VAT compliance, and provide financial forecasts for Egyptian e-commerce operations.`,
      team: `You are the HR & Team AI Agent. You manage shift schedules, track performance, and optimize workforce allocation for an Egyptian e-commerce operation center.`,
    };

    return `${prompts[agent] || prompts.ceo}

Available tools you can call:
${tools}

Recent activity history:
${history || "No recent activity."}

Respond in structured JSON with:
{
  "analysis": "your detailed analysis",
  "summary": "1-2 sentence summary",
  "confidence": 0-100,
  "recommendations": [{ "title": "...", "description": "...", "confidence": 0-100, "impact": "+EGP X/mo or X% improvement" }],
  "actions": [{ "tool": "tool_name", "params": {} }]
}`;
  }

  private getAgentTools(agent: AgentId): Array<{ name: string; description: string; parameters: Record<string, any> }> {
    const all = toolRegistry.listTools();
    const relevant: Record<AgentId, string[]> = {
      ceo: ["get_finance_summary", "list_orders", "list_products", "create_recommendation", "log_activity"],
      product_hunter: ["list_products", "get_product", "create_recommendation", "log_activity"],
      creative_director: ["get_campaign", "list_products", "create_recommendation", "log_activity"],
      landing_page: ["get_campaign", "list_products", "create_recommendation", "log_activity"],
      confirmation: ["get_order", "list_orders", "update_order_status", "get_customer", "log_activity"],
      moderator: ["get_order", "list_orders", "get_customer", "update_order_status", "log_activity"],
      shipping: ["get_shipment", "list_orders", "update_order_status", "log_activity"],
      finance: ["get_finance_summary", "list_orders", "get_campaign", "create_recommendation", "log_activity"],
      team: ["log_activity"],
    };

    const names = relevant[agent] || [];
    return all.filter(t => names.includes(t.name)).map(t => ({
      name: t.name, description: t.description, parameters: {},
    }));
  }
}

export const orchestrator = new AgentOrchestrator();
