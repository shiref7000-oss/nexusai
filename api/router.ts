import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { productRouter } from "./product-router";
import { orderRouter } from "./order-router";
import { campaignRouter } from "./campaign-router";
import { financeRouter } from "./finance-router";
import { shippingRouter } from "./shipping-router";
import { teamRouter } from "./team-router";
import { agentRouter } from "./agent-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  product: productRouter,
  order: orderRouter,
  campaign: campaignRouter,
  finance: financeRouter,
  shipping: shippingRouter,
  team: teamRouter,
  agent: agentRouter,
});

export type AppRouter = typeof appRouter;
