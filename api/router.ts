import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { productRouter } from "./product-router";
import { orderRouter } from "./order-router";
import { campaignRouter } from "./campaign-router";
import { financeRouter } from "./finance-router";
import { shippingRouter } from "./shipping-router";
import { teamRouter } from "./team-router";
import { agentRouter } from "./agent-router";
import { shippingProvidersRouter } from "./shipping-providers-router";
import { metaRouter } from "./meta-router";
import { whatsappRouter } from "./whatsapp-router";
import { aiRouter } from "./ai-router";
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
  shippingProviders: shippingProvidersRouter,
  meta: metaRouter,
  whatsapp: whatsappRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
