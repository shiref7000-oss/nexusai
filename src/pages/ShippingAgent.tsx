import { useState } from "react";
import { Truck, Package, MapPin, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Route, ChevronDown, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/providers/trpc";

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-400", in_transit: "bg-amber-500/15 text-amber-400",
  out_for_delivery: "bg-violet-500/15 text-violet-400", delivered: "bg-emerald-500/15 text-emerald-400",
  returned: "bg-red-500/15 text-red-400", picked_up: "bg-blue-500/15 text-blue-400", failed: "bg-red-500/15 text-red-400",
};

export default function ShippingAgent() {
  const [filter, setFilter] = useState<string>("all");
  const [provider, setProvider] = useState<string>("all");
  const { data: stats } = trpc.shipping.stats.useQuery();
  const { data: shipmentList } = trpc.shipping.list.useQuery({ status: filter !== "all" ? filter : undefined, provider: provider !== "all" ? provider : undefined });
  const { data: pipeline } = trpc.shipping.pipelineTrend.useQuery();

  const shipments = shipmentList || [];
  const s = stats || { total: 0, delivered: 0, returned: 0, inTransit: 0, avgDays: "0", deliveryRate: "0", byProvider: [], byGovernorate: [] };

  const kpiCards = [
    { label: "Active Shipments", value: `${s.inTransit}`, change: "In transit now", icon: Truck, color: "#F97316" },
    { label: "Delivery Rate", value: `${s.deliveryRate}%`, change: "This month", icon: CheckCircle, color: "#F97316" },
    { label: "Avg. Delivery", value: `${s.avgDays} days`, change: "Average time", icon: Clock, color: "#F97316" },
    { label: "Returns", value: `${s.returned}`, change: `${s.total > 0 ? (s.returned / s.total * 100).toFixed(1) : 0}% rate`, icon: AlertTriangle, color: "#F97316" },
  ];

  const providerData = s.byProvider?.map((p: any) => ({
    name: p.provider, shipments: Number(p.count), delivered: Number(p.delivered),
    rate: p.count > 0 ? (p.delivered / p.count * 100).toFixed(0) : 0,
    avgDays: Number(p.avgDays || 0).toFixed(1),
  })) || [];

  const pipelineData = pipeline?.map((r: any) => ({
    day: r.day?.slice(5) || "", shipped: Number(r.shipped || 0), delivered: Number(r.delivered || 0), returned: Number(r.returned || 0),
  })) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><Truck className="w-6 h-6 text-orange-400" /> Shipping Agent</h1>
            <p className="text-sm text-[#8B95A8] mt-1">Multi-provider logistics management, real-time tracking, and delivery optimization</p></div>
          <div className="flex items-center gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0A1120] border border-[#1A2744] text-sm text-[#E8EDF5]">
              <option value="all">All Status</option><option value="pending">Pending</option><option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option><option value="delivered">Delivered</option><option value="returned">Returned</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-orange-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-orange-400" />Delivery Pipeline</h3>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Bar dataKey="shipped" name="Shipped" fill="#3B82F6" /><Bar dataKey="delivered" name="Delivered" fill="#10B981" /><Bar dataKey="returned" name="Returned" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-[#8B95A8] animate-pulse">Loading pipeline...</div>}
          </div>

          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Route className="w-4 h-4 text-orange-400" />Provider Performance</h3>
            <div className="space-y-4">
              {providerData.map((p: any) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-[#E8EDF5] capitalize">{p.name}</span>
                    <div className="flex gap-3 text-xs"><span className="text-[#8B95A8]">{p.shipments} orders</span><span className="text-emerald-400">{p.rate}%</span></div>
                  </div>
                  <div className="h-2 rounded-full bg-[#1A2744] overflow-hidden"><div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${Math.min(Number(p.rate), 100)}%` }} /></div>
                  <div className="text-[10px] text-[#8B95A8] mt-1">Avg {p.avgDays} days</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
          <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Package className="w-4 h-4 text-orange-400" />Shipments ({shipments.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1A2744]">
                <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">ID</th>
                <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">Provider</th>
                <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">Governorate</th>
                <th className="text-center py-3 px-2 text-[#8B95A8] font-medium">Status</th>
                <th className="text-right py-3 px-2 text-[#8B95A8] font-medium">COD</th>
                <th className="text-right py-3 px-2 text-[#8B95A8] font-medium">ETA</th>
              </tr></thead>
              <tbody>{shipments.map((s: any) => (
                <tr key={s.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02]">
                  <td className="py-3 px-2 text-[#E8EDF5] font-mono-data text-xs">{s.trackingCode || `SHP-${s.id}`}</td>
                  <td className="py-3 px-2"><span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#E8EDF5] capitalize">{s.provider}</span></td>
                  <td className="py-3 px-2 text-[#E8EDF5]">{s.governorate || "-"}</td>
                  <td className="py-3 px-2 text-center"><span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[s.status] || "bg-[#1A2744] text-[#8B95A8]"}`}>{s.status.replace(/_/g, " ")}</span></td>
                  <td className="py-3 px-2 text-right text-[#E8EDF5] font-mono-data">{s.codAmount ? `EGP ${Number(s.codAmount).toLocaleString()}` : "-"}</td>
                  <td className="py-3 px-2 text-right text-sm text-[#E8EDF5]">{s.estimatedDays ? `${s.estimatedDays} days` : "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
