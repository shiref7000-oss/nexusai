import { relations } from "drizzle-orm";
import {
  users,
  products,
  customers,
  orders,
  shipments,
  campaigns,
  creatives,
  landingPages,
  teamMembers,
  agentActivities,
  recommendations,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  products: many(products),
  campaigns: many(campaigns),
  landingPages: many(landingPages),
  agentActivities: many(agentActivities),
}));

export const productsRelations = relations(products, ({ one }) => ({
  creator: one(users, { fields: [products.createdBy], references: [users.id] }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  shipments: many(shipments),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, { fields: [shipments.orderId], references: [orders.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  creator: one(users, { fields: [campaigns.createdBy], references: [users.id] }),
  creatives: many(creatives),
}));

export const creativesRelations = relations(creatives, ({ one }) => ({
  campaign: one(campaigns, { fields: [creatives.campaignId], references: [campaigns.id] }),
}));

export const landingPagesRelations = relations(landingPages, ({ one }) => ({
  creator: one(users, { fields: [landingPages.createdBy], references: [users.id] }),
}));
