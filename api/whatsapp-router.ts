import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { customers, orders } from "@db/schema";
import { eq } from "drizzle-orm";

// ─── WhatsApp Business Cloud API ───
// Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
const WHATSAPP_API = "https://graph.facebook.com/v21.0";

async function sendWhatsAppMessage(phone: string, templateName: string, language: string, components: any[]) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { success: false, error: "WhatsApp credentials not configured", messageId: null };

  // Normalize phone: remove + and any non-digits
  const to = phone.replace(/\D/g, "");

  try {
    const resp = await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "template",
        template: { name: templateName, language: { code: language || "ar" }, components },
      }),
    });
    const data = await resp.json();
    return { success: resp.ok && !data.error, error: data.error?.message, messageId: data.messages?.[0]?.id };
  } catch (e) {
    return { success: false, error: (e as Error).message, messageId: null };
  }
}

async function sendTextMessage(phone: string, body: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { success: false, error: "WhatsApp credentials not configured" };

  const to = phone.replace(/\D/g, "");
  try {
    const resp = await fetch(`${WHATSAPP_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body, preview_url: false } }),
    });
    const data = await resp.json();
    return { success: resp.ok && !data.error, error: data.error?.message, messageId: data.messages?.[0]?.id };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

export const whatsappRouter = createRouter({
  // Send order confirmation message
  sendConfirmation: publicQuery.input(z.object({
    orderId: z.number(),
    templateName: z.string().default("order_confirmation_v2"),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
    if (!order) return { success: false, error: "Order not found" };

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
    if (!customer?.phone) return { success: false, error: "Customer phone not found" };

    const result = await sendWhatsAppMessage(customer.phone, input.templateName, "ar", [
      {
        type: "body",
        parameters: [
          { type: "text", text: customer.name || "عميلنا العزيز" },
          { type: "text", text: order.orderCode || String(order.id) },
          { type: "text", text: `EGP ${Number(order.totalAmount).toLocaleString()}` },
        ],
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0",
        parameters: [{ type: "payload", payload: `CONFIRM_${order.id}` }],
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "1",
        parameters: [{ type: "payload", payload: `CANCEL_${order.id}` }],
      },
    ]);

    if (result.success) {
      await db.update(orders).set({ confirmationAgent: "whatsapp" }).where(eq(orders.id, input.orderId));
    }

    return result;
  }),

  // Send shipping update
  sendShippingUpdate: publicQuery.input(z.object({
    orderId: z.number(),
    status: z.enum(["shipped", "out_for_delivery", "delivered"]),
    trackingUrl: z.string().optional(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
    if (!order) return { success: false, error: "Order not found" };

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
    if (!customer?.phone) return { success: false, error: "Customer phone not found" };

    const statusText: Record<string, string> = {
      shipped: "تم شحن طلبك بنجاح!",
      out_for_delivery: "طلبك في الطريق إليك الآن!",
      delivered: "تم توصيل طلبك بنجاح! شكراً لتسوقك معنا",
    };

    const body = `${statusText[input.status]}\n\nرقم الطلب: ${order.orderCode}\nالمبلغ: EGP ${Number(order.totalAmount).toLocaleString()}${input.trackingUrl ? `\nتتبع الشحنة: ${input.trackingUrl}` : ""}`;

    return sendTextMessage(customer.phone, body);
  }),

  // Send COD reminder
  sendCodReminder: publicQuery.input(z.object({
    orderId: z.number(),
  })).mutation(async ({ input }) => {
    const db = getDb();
    const [order] = await db.select().from(orders).where(eq(orders.id, input.orderId));
    if (!order) return { success: false, error: "Order not found" };

    const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
    if (!customer?.phone) return { success: false, error: "Customer phone not found" };

    const body = `تذكير بالدفع عند الاستلام\n\nمرحباً ${customer.name || "عميلنا العزيز"}\nطلبك ${order.orderCode} يصل اليوم\nالمبلغ المطلوب: EGP ${Number(order.totalAmount).toLocaleString()}\nيرجى توفير المبلغ لسائق التوصيل`;

    return sendTextMessage(customer.phone, body);
  }),

  // Send bulk confirmations (for batch processing)
  bulkConfirmations: publicQuery.input(z.object({
    orderIds: z.array(z.number()),
  })).mutation(async ({ input }) => {
    const results = [];
    for (const orderId of input.orderIds) {
      const result = await sendConfirmationInternal(orderId);
      results.push({ orderId, ...result });
    }
    return { sent: results.filter(r => r.success).length, failed: results.filter(r => !r.success).length, results };
  }),

  // Template management
  listTemplates: publicQuery.query(async () => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const wabaId = process.env.WHATSAPP_WABA_ID;
    if (!token || !wabaId) return { templates: [], error: "WhatsApp credentials not configured" };

    try {
      const resp = await fetch(`${WHATSAPP_API}/${wabaId}/message_templates?limit=50`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await resp.json();
      return {
        templates: (data.data || []).map((t: any) => ({
          name: t.name, status: t.status, category: t.category, language: t.language,
        })),
      };
    } catch (e) {
      return { templates: [], error: (e as Error).message };
    }
  }),

  // Check connection status
  status: publicQuery.query(async () => {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) return { connected: false, error: "Not configured" };

    try {
      const resp = await fetch(`${WHATSAPP_API}/${phoneNumberId}?fields=verified_name,quality_rating`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      const data = await resp.json();
      return { connected: true, verifiedName: data.verified_name, qualityRating: data.quality_rating };
    } catch (e) {
      return { connected: false, error: (e as Error).message };
    }
  }),
});

// Internal helper
async function sendConfirmationInternal(orderId: number) {
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return { success: false, error: "Order not found" };
  const [customer] = await db.select().from(customers).where(eq(customers.id, order.customerId || 0));
  if (!customer?.phone) return { success: false, error: "No phone" };

  const body = `مرحباً ${customer.name || "عميلنا العزيز"}\nلديك طلب بقيمة EGP ${Number(order.totalAmount).toLocaleString()}\nهل تؤكد الطلب؟\nيرجى الرد بـ "نعم" للتأكيد أو "لا" للإلغاء`;
  return sendTextMessage(customer.phone, body);
}
