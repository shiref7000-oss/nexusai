/**
 * NexusAI Gemini Service — Central AI intelligence layer
 * Wraps Google's Gemini API with structured JSON output, retry logic,
 * token budget management, and fallback to OpenAI/Anthropic.
 */

const GEMINI_API = "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-1.5-pro-latest";
const FAST_MODEL = "gemini-1.5-flash-latest";

// ─── Types ───
export interface AIMessage {
  role: "system" | "user" | "assistant" | "model";
  content: string;
}

export interface AIGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: "application/json" | "text/plain";
}

export interface AIRequest {
  messages: AIMessage[];
  config?: AIGenerationConfig;
  model?: "pro" | "flash";
  expectJson?: boolean;
  systemInstruction?: string;
}

export interface AIResponse<T = any> {
  success: boolean;
  content: string | null;
  parsed: T | null;
  model: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  error: string | null;
  fallbackUsed?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; enum?: string[] }>;
}

// ─── Token budget manager ───
class TokenBudget {
  private dailyLimit: number;
  private used: number = 0;
  private resetTime: Date;

  constructor(dailyLimit: number = 1_000_000) {
    this.dailyLimit = dailyLimit;
    this.resetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  check(tokens: number): boolean {
    this.maybeReset();
    return this.used + tokens <= this.dailyLimit;
  }

  consume(tokens: number): void {
    this.maybeReset();
    this.used += tokens;
  }

  remaining(): number {
    this.maybeReset();
    return this.dailyLimit - this.used;
  }

  private maybeReset(): void {
    if (Date.now() > this.resetTime.getTime()) {
      this.used = 0;
      this.resetTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}

const globalBudget = new TokenBudget(
  parseInt(process.env.AI_DAILY_TOKEN_LIMIT || "1000000", 10)
);

// ─── Retry with exponential backoff ───
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (i === maxRetries - 1) throw e;
      // Don't retry on auth errors
      if (e.message?.includes("API key") || e.message?.includes("authentication")) throw e;
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("Retry exhausted");
}

// ─── Gemini Core ───
export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || "";
    this.model = DEFAULT_MODEL;
  }

  // Main generate method
  async generate<T = any>(request: AIRequest): Promise<AIResponse<T>> {
    if (!this.apiKey) {
      return this.fallback(request);
    }

    const modelName = request.model === "flash" ? FAST_MODEL : DEFAULT_MODEL;
    const expectJson = request.expectJson ?? (request.config?.responseMimeType === "application/json");

    try {
      const result = await withRetry(() => this.callGemini(request, modelName, expectJson));
      return result;
    } catch (err: any) {
      console.error("[Gemini] Primary failed:", err.message);
      return this.fallback(request);
    }
  }

  private async callGemini<T>(
    request: AIRequest,
    modelName: string,
    expectJson: boolean
  ): Promise<AIResponse<T>> {
    const contents = this.buildContents(request.messages, request.systemInstruction);
    const config = {
      temperature: request.config?.temperature ?? 0.3,
      topP: request.config?.topP ?? 0.95,
      topK: request.config?.topK ?? 40,
      maxOutputTokens: request.config?.maxOutputTokens ?? 8192,
      responseMimeType: expectJson ? "application/json" : "text/plain",
      ...(expectJson ? {
        responseSchema: request.messages.find(m => m.role === "system")?.content.includes("schema")
          ? undefined
          : undefined,
      } : {}),
    };

    const url = `${GEMINI_API}/${modelName}:generateContent?key=${this.apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: config }),
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error?.message || `Gemini HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const candidate = data.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || null;
    const usage = candidate?.tokenCount
      ? { promptTokens: data.usageMetadata?.promptTokenCount || 0, completionTokens: data.usageMetadata?.candidatesTokenCount || 0, totalTokens: data.usageMetadata?.totalTokenCount || 0 }
      : undefined;

    if (usage) {
      globalBudget.consume(usage.totalTokens);
    }

    let parsed: T | null = null;
    if (content && expectJson) {
      try {
        // Gemini sometimes wraps JSON in markdown fences
        const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
        parsed = JSON.parse(cleaned);
      } catch {
        parsed = null;
      }
    }

    return {
      success: true,
      content,
      parsed,
      model: modelName,
      usage,
      error: null,
    };
  }

  // Streaming generation for real-time agent responses
  async *streamGenerate(request: AIRequest): AsyncGenerator<string, void, unknown> {
    if (!this.apiKey) {
      yield "[Error: Gemini API key not configured]";
      return;
    }

    const modelName = request.model === "flash" ? FAST_MODEL : DEFAULT_MODEL;
    const contents = this.buildContents(request.messages, request.systemInstruction);
    const config = {
      temperature: request.config?.temperature ?? 0.7,
      maxOutputTokens: request.config?.maxOutputTokens ?? 4096,
    };

    const url = `${GEMINI_API}/${modelName}:streamGenerateContent?alt=sse&key=${this.apiKey}`;

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: config }),
    });

    if (!resp.ok || !resp.body) {
      yield "[Error: Stream failed]";
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        try {
          const json = JSON.parse(line.slice(6));
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch { /* ignore parse errors */ }
      }
    }
  }

  // Tool-calling generation: Gemini decides which tools to call
  async generateWithTools<T = any>(
    request: AIRequest,
    tools: ToolDefinition[]
  ): Promise<{ response: AIResponse<T>; toolCalls: Array<{ name: string; args: Record<string, any> }> }> {
    // Append tool definitions to system instruction
    const toolDesc = tools.map(t =>
      `TOOL: ${t.name}\nDescription: ${t.description}\nParameters: ${JSON.stringify(t.parameters)}`
    ).join("\n\n");

    const enhancedSystem = `${request.systemInstruction || ""}\n\nYou have access to these tools. If you need to use one, include a JSON block like {"tool_call": {"name": "tool_name", "args": {...}}} in your response.\n\n${toolDesc}`;

    const result = await this.generate<T>({
      ...request,
      systemInstruction: enhancedSystem,
      expectJson: true,
    });

    // Extract tool calls from response
    const toolCalls: Array<{ name: string; args: Record<string, any> }> = [];
    if (result.content) {
      const matches = result.content.match(/\{"tool_call"\s*:\s*\{[^}]+\}\}/g);
      if (matches) {
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match);
            if (parsed.tool_call) toolCalls.push(parsed.tool_call);
          } catch { /* ignore */ }
        }
      }
    }

    return { response: result, toolCalls };
  }

  // ─── Fallback chain: Gemini → OpenAI → Anthropic ───
  private async fallback<T>(request: AIRequest): Promise<AIResponse<T>> {
    // Try OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const result = await this.callOpenAI<T>(request);
        return { ...result, fallbackUsed: true };
      } catch (e: any) {
        console.error("[OpenAI Fallback] Failed:", e.message);
      }
    }

    // Try Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const result = await this.callAnthropic<T>(request);
        return { ...result, fallbackUsed: true };
      } catch (e: any) {
        console.error("[Anthropic Fallback] Failed:", e.message);
      }
    }

    return {
      success: false,
      content: null,
      parsed: null,
      model: "none",
      error: "No AI provider available. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.",
    };
  }

  private async callOpenAI<T>(request: AIRequest): Promise<AIResponse<T>> {
    const msgs = request.messages.map(m => ({ role: m.role === "model" ? "assistant" : m.role, content: m.content }));
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: msgs,
        temperature: request.config?.temperature ?? 0.3,
        max_tokens: request.config?.maxOutputTokens ?? 4096,
        response_format: request.expectJson ? { type: "json_object" } : undefined,
      }),
    });
    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;
    let parsed: T | null = null;
    if (content && request.expectJson) {
      try { parsed = JSON.parse(content); } catch { /* */ }
    }
    return { success: true, content, parsed, model: "gpt-4o-mini", error: null, usage: data.usage };
  }

  private async callAnthropic<T>(request: AIRequest): Promise<AIResponse<T>> {
    const msgs = request.messages.filter(m => m.role !== "system");
    const sysPrompt = request.messages.find(m => m.role === "system")?.content || request.systemInstruction || "";
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        system: sysPrompt,
        messages: msgs.map(m => ({ role: m.role === "model" ? "assistant" : m.role as any, content: m.content })),
        max_tokens: request.config?.maxOutputTokens ?? 4096,
      }),
    });
    const data = await resp.json();
    const content = data.content?.[0]?.text;
    let parsed: T | null = null;
    if (content && request.expectJson) {
      try { parsed = JSON.parse(content); } catch { /* */ }
    }
    return { success: true, content, parsed, model: "claude-3-5-haiku", error: null };
  }

  private buildContents(messages: AIMessage[], systemInstruction?: string): Array<{ role: string; parts: Array<{ text: string }> }> {
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // System instruction goes as first user message with SYSTEM: prefix
    if (systemInstruction) {
      contents.push({ role: "user", parts: [{ text: `[SYSTEM INSTRUCTION]: ${systemInstruction}` }] });
      contents.push({ role: "model", parts: [{ text: "Understood." }] });
    }

    for (const msg of messages) {
      if (msg.role === "system") continue; // handled above
      contents.push({
        role: msg.role === "model" || msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    return contents;
  }

  // Budget status
  budgetStatus() {
    return {
      remaining: globalBudget.remaining(),
      limit: parseInt(process.env.AI_DAILY_TOKEN_LIMIT || "1000000", 10),
      percentUsed: 100 - Math.round((globalBudget.remaining() / parseInt(process.env.AI_DAILY_TOKEN_LIMIT || "1000000", 10)) * 100),
    };
  }
}

// Singleton instance
let _gemini: GeminiService | null = null;
export function getGemini(): GeminiService {
  if (!_gemini) _gemini = new GeminiService();
  return _gemini;
}
