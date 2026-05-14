import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { campaigns } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const META_API = "https://graph.facebook.com/v21.0";

async function metaRequest(path: string, token: string, opts?: RequestInit) {
  const url = `${META_API}${path}${path.includes("?") ? "&" : "?"}access_token=${token}`;
  const resp = await fetch(url, opts);
  const data = await resp.json();
  return { ok: resp.ok, data, error: data.error?.message };
}

export const metaRouter = createRouter({
  // Get all campaigns from Meta
  campaigns: publicQuery.query(async () => {
    const token = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    if (!token || !adAccountId) return { connected: false, error: "Meta credentials not configured", campaigns: [] };

    const { ok, data, error } = await metaRequest(
      `/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,spend,impressions,clicks,conversions&limit=50`,
      token
    );

    if (!ok) return { connected: true, error, campaigns: [] };

    return {
      connected: true,
      campaigns: (data.data || []).map((c: any) => ({
        id: c.id, name: c.name, status: c.status, objective: c.objective,
        budget: (c.daily_budget || c.lifetime_budget || 0) / 100,
        spend: (c.spend || 0) / 100, impressions: c.impressions || 0,
        clicks: c.clicks || 0, conversions: c.conversions?.value || 0,
      })),
    };
  }),

  // Get campaign insights
  insights: publicQuery.input(z.object({
    campaignId: z.string(),
    since: z.string().optional(),
    until: z.string().optional(),
  })).query(async ({ input }) => {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) return { error: "Meta token not configured" };

    const since = input.since || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
    const until = input.until || new Date().toISOString().split("T")[0];

    const { ok, data, error } = await metaRequest(
      `/${input.campaignId}/insights?fields=spend,impressions,clicks,conversions,cost_per_action_type,ctr,cpc,roas&time_range={'since':'${since}','until':'${until}'}`,
      token
    );

    if (!ok) return { error };
    const insight = data.data?.[0] || {};
    return {
      spend: (insight.spend || 0) / 100,
      impressions: insight.impressions || 0,
      clicks: insight.clicks || 0,
      conversions: insight.conversions?.[0]?.value || 0,
      ctr: insight.ctr || 0,
      cpc: insight.cpc || 0,
      roas: insight.purchase_roas?.[0]?.value || 0,
    };
  }),

  // Create campaign on Meta
  createCampaign: publicQuery.input(z.object({
    name: z.string(),
    objective: z.enum(["AWARENESS", "TRAFFIC", "CONVERSIONS", "LEAD_GENERATION"]),
    budget: z.number(),
    budgetType: z.enum(["daily", "lifetime"]).default("daily"),
  })).mutation(async ({ input }) => {
    const token = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    if (!token || !adAccountId) return { success: false, error: "Meta credentials not configured" };

    const body = new URLSearchParams({
      name: input.name,
      objective: input.objective,
      status: "PAUSED",
      special_ad_categories: "[]",
      [input.budgetType === "daily" ? "daily_budget" : "lifetime_budget"]: String(input.budget * 100),
    });

    const { ok, data, error } = await metaRequest(`/${adAccountId}/campaigns`, token, {
      method: "POST",
      body,
    });

    if (!ok) return { success: false, error };

    // Save to local DB
    const db = getDb();
    await db.insert(campaigns).values({
      name: input.name, platform: "meta", objective: input.objective.toLowerCase() as any,
      status: "draft", budget: input.budget.toFixed(2),
    });

    return { success: true, campaignId: data.id };
  }),

  // Update campaign status (activate/pause)
  updateStatus: publicQuery.input(z.object({
    campaignId: z.string(),
    status: z.enum(["ACTIVE", "PAUSED", "DELETED"]),
  })).mutation(async ({ input }) => {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) return { success: false, error: "Meta token not configured" };

    const body = new URLSearchParams({ status: input.status });
    const { ok, error } = await metaRequest(`/${input.campaignId}`, token, {
      method: "POST", body,
    });

    // Sync to DB
    const db = getDb();
    await db.update(campaigns)
      .set({ status: input.status.toLowerCase() as any })
      .where(eq(campaigns.id, parseInt(input.campaignId)));

    return { success: ok, error };
  }),

  // Sync Meta campaigns to local DB
  sync: publicQuery.mutation(async () => {
    const token = process.env.META_ACCESS_TOKEN;
    const adAccountId = process.env.META_AD_ACCOUNT_ID;
    if (!token || !adAccountId) return { synced: 0, error: "Meta credentials not configured" };

    const { ok, data, error } = await metaRequest(
      `/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,spend,impressions,clicks,conversions`,
      token
    );

    if (!ok) return { synced: 0, error };

    const db = getDb();
    let synced = 0;
    for (const c of (data.data || [])) {
      const existing = await db.select().from(campaigns).where(eq(campaigns.name, c.name));
      const values = {
        name: c.name, platform: "meta", objective: (c.objective || "conversions").toLowerCase() as any,
        status: (c.status || "draft").toLowerCase() as any,
        budget: String((c.daily_budget || c.lifetime_budget || 0) / 100),
        spent: String((c.spend || 0) / 100),
        impressions: c.impressions || 0, clicks: c.clicks || 0,
        conversions: c.conversions?.value || 0,
      };
      if (existing.length > 0) {
        await db.update(campaigns).set(values).where(eq(campaigns.id, existing[0].id));
      } else {
        await db.insert(campaigns).values(values);
      }
      synced++;
    }
    return { synced, error: null };
  }),
});
