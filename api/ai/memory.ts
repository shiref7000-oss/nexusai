/**
 * NexusAI Memory System — Agent context & long-term memory
 * Stores conversation history, learned facts, and agent state in DB.
 */
import { getDb } from "../queries/connection";
import { agentActivities } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export type AgentId = "ceo" | "product_hunter" | "creative_director" | "landing_page" | "confirmation" | "moderator" | "shipping" | "finance" | "team";

interface MemoryEntry {
  role: "user" | "agent" | "system" | "tool";
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// In-memory conversation buffers per agent (for hot context)
const conversationBuffers: Map<AgentId, MemoryEntry[]> = new Map();
const MAX_BUFFER_SIZE = 20;

// ─── Conversation Memory ───
export class AgentMemory {
  private agent: AgentId;

  constructor(agent: AgentId) {
    this.agent = agent;
  }

  // Add a memory entry
  async add(entry: Omit<MemoryEntry, "timestamp">): Promise<void> {
    const fullEntry: MemoryEntry = { ...entry, timestamp: new Date() };

    // Add to hot buffer
    const buffer = this.getBuffer();
    buffer.push(fullEntry);
    if (buffer.length > MAX_BUFFER_SIZE) buffer.shift();

    // Persist important entries to DB
    if (entry.role === "agent" && entry.content.length > 50) {
      const db = getDb();
      await db.insert(agentActivities).values({
        agent: this.agent,
        action: entry.metadata?.action || "AI Response",
        description: entry.content.substring(0, 500),
        impact: entry.metadata?.impact || "neutral",
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        status: entry.metadata?.status || "applied",
      }).catch(() => {}); // Non-critical
    }
  }

  // Get conversation context for the agent
  async getContext(limit: number = 10): Promise<MemoryEntry[]> {
    const buffer = this.getBuffer();
    // Return recent buffer + relevant DB history
    return buffer.slice(-limit);
  }

  // Get recent activities from DB for this agent
  async getRecentActivities(limit: number = 20): Promise<Array<{
    id: number; action: string; description: string | null; impact: string | null;
    status: string | null; createdAt: Date | null;
  }>> {
    const db = getDb();
    return db.select({
      id: agentActivities.id,
      action: agentActivities.action,
      description: agentActivities.description,
      impact: agentActivities.impact,
      status: agentActivities.status,
      createdAt: agentActivities.createdAt,
    }).from(agentActivities)
      .where(eq(agentActivities.agent, this.agent))
      .orderBy(desc(agentActivities.createdAt))
      .limit(limit);
  }

  // Build a context string for LLM prompt
  async buildContextString(limit: number = 5): Promise<string> {
    const activities = await this.getRecentActivities(limit);
    if (activities.length === 0) return "";

    return activities.map(a =>
      `- [${a.createdAt?.toISOString().slice(0, 10)}] ${a.action}: ${a.description?.substring(0, 100)} (impact: ${a.impact}, status: ${a.status})`
    ).join("\n");
  }

  // Clear buffer
  clear(): void {
    conversationBuffers.delete(this.agent);
  }

  private getBuffer(): MemoryEntry[] {
    if (!conversationBuffers.has(this.agent)) {
      conversationBuffers.set(this.agent, []);
    }
    return conversationBuffers.get(this.agent)!;
  }
}

// Global context manager
export class ContextManager {
  private memories: Map<AgentId, AgentMemory> = new Map();

  getAgentMemory(agent: AgentId): AgentMemory {
    if (!this.memories.has(agent)) {
      this.memories.set(agent, new AgentMemory(agent));
    }
    return this.memories.get(agent)!;
  }

  // Build cross-agent summary for CEO/overview agents
  async buildCrossAgentSummary(): Promise<string> {
    const db = getDb();
    const recent = await db.select({
      agent: agentActivities.agent,
      action: agentActivities.action,
      description: agentActivities.description,
      impact: agentActivities.impact,
      status: agentActivities.status,
    }).from(agentActivities)
      .orderBy(desc(agentActivities.createdAt))
      .limit(30);

    const byAgent: Record<string, typeof recent> = {};
    for (const r of recent) {
      const a = r.agent || "unknown";
      if (!byAgent[a]) byAgent[a] = [];
      byAgent[a].push(r);
    }

    return Object.entries(byAgent)
      .map(([agent, acts]) => {
        const lines = acts.slice(0, 3).map(a => `  - ${a.action}: ${a.description?.substring(0, 80)} (${a.impact})`);
        return `[${agent.toUpperCase()}]\n${lines.join("\n")}`;
      })
      .join("\n\n");
  }

  // Summarize old context to compress memory
  async compressMemory(agent: AgentId): Promise<string> {
    const memory = this.getAgentMemory(agent);
    const activities = await memory.getRecentActivities(50);
    if (activities.length < 10) return "No history to compress.";

    // Simple heuristic compression
    const keyActions = activities.filter(a =>
      a.impact === "positive" || a.impact === "negative" || a.status === "applied"
    );

    return `Compressed memory for ${agent}: ${keyActions.length} key actions from last ${activities.length} activities.`;
  }
}

export const contextManager = new ContextManager();
