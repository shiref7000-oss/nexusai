import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { shipments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

// ─── Bosta API Integration ───
// Docs: https://bosta.co/en-eg/developers
const BOSTA_API = "https://dev.bosta.co/api/v1";

async function bostaCreateShipment(data: {
  receiverName: string; receiverPhone: string; receiverAddress: string;
  city: string; cod: number; description: string;
}) {
  const apiKey = process.env.BOSTA_API_KEY;
  if (!apiKey) return { success: false, error: "BOSTA_API_KEY not configured", tracking: null };
  try {
    const resp = await fetch(`${BOSTA_API}/deliveries`, {
      method: "POST",
      headers: { "Authorization": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        receiver: { name: data.receiverName, phone: data.receiverPhone, address: data.receiverAddress, city: data.city },
        specs: { cod: data.cod },
        notes: data.description,
      }),
    });
    const result = await resp.json();
    return { success: resp.ok, tracking: result.trackingNumber, error: resp.ok ? null : result.message };
  } catch (e) {
    return { success: false, error: (e as Error).message, tracking: null };
  }
}

async function bostaTrackShipment(trackingNumber: string) {
  const apiKey = process.env.BOSTA_API_KEY;
  if (!apiKey) return { status: "unknown", details: [], error: "BOSTA_API_KEY not configured" };
  try {
    const resp = await fetch(`${BOSTA_API}/deliveries/${trackingNumber}`, {
      headers: { "Authorization": apiKey },
    });
    const result = await resp.json();
    return { status: result.state || "unknown", details: result.timeline || [], error: null };
  } catch (e) {
    return { status: "error", details: [], error: (e as Error).message };
  }
}

// ─── Aramex API Integration ───
// Docs: https://www.aramex.com/developers
const ARAMEX_API = "https://ws.aramex.net/ShippingAPI.V2/ShippingService.svc";

async function aramexCreateShipment(data: {
  receiverName: string; receiverPhone: string; receiverAddress: string;
  city: string; cod: number; description: string;
}) {
  const username = process.env.ARAMEX_USERNAME;
  const password = process.env.ARAMEX_PASSWORD;
  if (!username || !password) return { success: false, error: "Aramex credentials not configured", tracking: null };
  try {
    const resp = await fetch(`${ARAMEX_API}/json/CreateShipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ClientInfo: { UserName: username, Password: password, Version: "v2.0", AccountNumber: process.env.ARAMEX_ACCOUNT, AccountPin: process.env.ARAMEX_PIN, AccountEntity: "CAI", AccountCountryCode: "EG" },
        Shipments: [{
          Shipper: { PersonName: "NexusAI Store", CompanyName: "NexusAI", PhoneNumber1: "+201000000000", CellPhone: "+201000000000", EmailAddress: "ship@nexusai.com", CountryCode: "EG", City: "Cairo", Line1: "123 Nile Corniche" },
          Consignee: { PersonName: data.receiverName, PhoneNumber1: data.receiverPhone, CellPhone: data.receiverPhone, CountryCode: "EG", City: data.city, Line1: data.receiverAddress },
          Details: { Dimensions: null, ActualWeight: { Value: 1, Unit: "KG" }, ChargeableWeight: { Value: 1, Unit: "KG" }, DescriptionOfGoods: data.description, NumberOfPieces: 1, CashOnDeliveryAmount: { Value: data.cod, CurrencyCode: "EGP" }, CustomsValueAmount: { Value: data.cod, CurrencyCode: "EGP" } },
        }],
      }),
    });
    const result = await resp.json();
    const shipment = result.Shipments?.[0];
    return { success: resp.ok && shipment?.ID, tracking: shipment?.ID, error: shipment?.ShipmentLabel?.Error?.Message };
  } catch (e) {
    return { success: false, error: (e as Error).message, tracking: null };
  }
}

async function aramexTrackShipment(trackingNumber: string) {
  const username = process.env.ARAMEX_USERNAME;
  const password = process.env.ARAMEX_PASSWORD;
  if (!username || !password) return { status: "unknown", details: [], error: "Aramex credentials not configured" };
  try {
    const resp = await fetch(`${ARAMEX_API}/json/TrackShipments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ClientInfo: { UserName: username, Password: password, Version: "v2.0" },
        Shipments: [trackingNumber],
      }),
    });
    const result = await resp.json();
    const tracking = result.TrackingResults?.[0];
    return { status: tracking?.UpdateCode || "unknown", details: tracking?.Value?.TrackingResult?.map((t: any) => ({ date: t.UpdateDateTime, status: t.UpdateDescription })) || [], error: null };
  } catch (e) {
    return { status: "error", details: [], error: (e as Error).message };
  }
}

// ─── VHub API Integration ───
// Docs: https://vhub.app/developers
const VHUB_API = "https://api.vhub.app/v1";

async function vhubCreateShipment(data: {
  receiverName: string; receiverPhone: string; receiverAddress: string;
  city: string; cod: number;
}) {
  const apiKey = process.env.VHUB_API_KEY;
  if (!apiKey) return { success: false, error: "VHUB_API_KEY not configured", tracking: null };
  try {
    const resp = await fetch(`${VHUB_API}/shipments`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        recipient: { name: data.receiverName, phone: data.receiverPhone, address: data.receiverAddress, city: data.city },
        cod_amount: data.cod, pieces: 1, weight: 1,
      }),
    });
    const result = await resp.json();
    return { success: resp.ok, tracking: result.tracking_number, error: resp.ok ? null : result.error };
  } catch (e) {
    return { success: false, error: (e as Error).message, tracking: null };
  }
}

async function vhubTrackShipment(trackingNumber: string) {
  const apiKey = process.env.VHUB_API_KEY;
  if (!apiKey) return { status: "unknown", details: [], error: "VHUB_API_KEY not configured" };
  try {
    const resp = await fetch(`${VHUB_API}/shipments/${trackingNumber}/track`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });
    const result = await resp.json();
    return { status: result.status, details: result.tracking_history || [], error: null };
  } catch (e) {
    return { status: "error", details: [], error: (e as Error).message };
  }
}

// ─── SMSA Express Integration ───
const SMSA_API = "https://www.smsaexpress.com/api";

async function smsaCreateShipment(data: {
  receiverName: string; receiverPhone: string; receiverAddress: string;
  city: string; cod: number;
}) {
  const apiKey = process.env.SMSA_API_KEY;
  if (!apiKey) return { success: false, error: "SMSA_API_KEY not configured", tracking: null };
  try {
    const resp = await fetch(`${SMSA_API}/shipment`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        cName: data.receiverName, cntry: "EG", cCity: data.city, cMobile: data.receiverPhone, cAddr1: data.receiverAddress,
        codAmt: data.cod, pcs: 1, weight: 1,
      }),
    });
    const result = await resp.json();
    return { success: resp.ok, tracking: result.awb, error: resp.ok ? null : result.message };
  } catch (e) {
    return { success: false, error: (e as Error).message, tracking: null };
  }
}

// ─── Unified Router ───
export const shippingProvidersRouter = createRouter({
  // Create shipment with selected provider
  create: publicQuery.input(z.object({
    provider: z.enum(["bosta", "aramex", "vhub", "smsa"]),
    orderId: z.number(),
    receiverName: z.string(),
    receiverPhone: z.string(),
    receiverAddress: z.string(),
    city: z.string(),
    governorate: z.string(),
    cod: z.number(),
    description: z.string().default("NexusAI Order"),
  })).mutation(async ({ input }) => {
    const db = getDb();
    let result: { success: boolean; tracking: string | null; error: string | null };

    switch (input.provider) {
      case "bosta": result = await bostaCreateShipment(input); break;
      case "aramex": result = await aramexCreateShipment(input); break;
      case "vhub": result = await vhubCreateShipment(input); break;
      case "smsa": result = await smsaCreateShipment(input); break;
      default: result = { success: false, tracking: null, error: "Unknown provider" };
    }

    if (result.success && result.tracking) {
      await db.insert(shipments).values({
        orderId: input.orderId,
        trackingCode: result.tracking,
        provider: input.provider,
        status: "pending",
        estimatedDays: input.provider === "aramex" ? 1 : input.provider === "bosta" ? 2 : 3,
        governorate: input.governorate,
        codAmount: input.cod.toFixed(2),
      });
    }

    return result;
  }),

  // Track shipment
  track: publicQuery.input(z.object({
    provider: z.enum(["bosta", "aramex", "vhub", "smsa"]),
    trackingNumber: z.string(),
  })).query(async ({ input }) => {
    switch (input.provider) {
      case "bosta": return bostaTrackShipment(input.trackingNumber);
      case "aramex": return aramexTrackShipment(input.trackingNumber);
      case "vhub": return vhubTrackShipment(input.trackingNumber);
      case "smsa": return { status: "pending", details: [], error: "SMSA tracking via their portal" };
      default: return { status: "unknown", details: [], error: "Unknown provider" };
    }
  }),

  // Sync all pending shipments with providers
  syncAll: publicQuery.mutation(async () => {
    const db = getDb();
    const pending = await db.select().from(shipments).where(eq(shipments.status, "in_transit")).orderBy(desc(shipments.createdAt));

    const results = [];
    for (const s of pending) {
      if (!s.trackingCode) continue;
      let update: any = { status: s.status };
      switch (s.provider) {
        case "bosta": { const t = await bostaTrackShipment(s.trackingCode); update = { status: mapBostaStatus(t.status) }; break; }
        case "aramex": { const t = await aramexTrackShipment(s.trackingCode); update = { status: mapAramexStatus(t.status) }; break; }
        case "vhub": { const t = await vhubTrackShipment(s.trackingCode); update = { status: mapVHubStatus(t.status) }; break; }
      }
      await db.update(shipments).set(update).where(eq(shipments.id, s.id));
      results.push({ id: s.id, tracking: s.trackingCode, oldStatus: s.status, newStatus: update.status });
    }
    return { synced: results.length, results };
  }),
});

// Status mapping functions
function mapBostaStatus(s: string) {
  const map: Record<string, string> = {
    " picked_up": "picked_up", " in_transit": "in_transit", " out_for_delivery": "out_for_delivery",
    " delivered": "delivered", " returned": "returned", " failed": "failed",
  };
  return map[s] || "in_transit";
}
function mapAramexStatus(s: string) {
  const map: Record<string, string> = {
    "shp-001": "pending", "shp-002": "picked_up", "shp-003": "in_transit",
    "shp-004": "out_for_delivery", "shp-005": "delivered", "shp-006": "returned",
  };
  return map[s] || "in_transit";
}
function mapVHubStatus(s: string) {
  const map: Record<string, string> = {
    pending: "pending", picked: "picked_up", "in_transit": "in_transit",
    out_for_delivery: "out_for_delivery", delivered: "delivered", returned: "returned",
  };
  return map[s] || "in_transit";
}
