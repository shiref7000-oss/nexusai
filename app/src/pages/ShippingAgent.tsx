import { useState } from "react";
import { Truck, Package, MapPin, Clock, CheckCircle, AlertTriangle, BarChart3, TrendingUp, Route, Phone, ChevronDown, Filter, Zap } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const deliveryTrend = [
  { day: "Mon", shipped: 89, delivered: 72, returned: 5 },
  { day: "Tue", shipped: 112, delivered: 95, returned: 8 },
  { day: "Wed", shipped: 98, delivered: 88, returned: 4 },
  { day: "Thu", shipped: 134, delivered: 110, returned: 10 },
  { day: "Fri", shipped: 156, delivered: 135, returned: 9 },
  { day: "Sat", shipped: 120, delivered: 105, returned: 6 },
  { day: "Sun", shipped: 87, delivered: 78, returned: 4 },
];

const providerData = [
  { name: "Bosta", shipments: 320, delivered: 285, rate: 89, avgDays: 2.1, color: "#F97316" },
  { name: "Aramex", shipments: 210, delivered: 195, rate: 93, avgDays: 1.8, color: "#3B82F6" },
  { name: "VHub", shipments: 165, delivered: 152, rate: 92, avgDays: 2.3, color: "#10B981" },
  { name: "SMSA", shipments: 95, delivered: 83, rate: 87, avgDays: 2.5, color: "#F59E0B" },
];

const governorateData = [
  { name: "Cairo", shipments: 280, delivered: 258, rate: 92 },
  { name: "Giza", shipments: 195, delivered: 180, rate: 92 },
  { name: "Alex", shipments: 120, delivered: 108, rate: 90 },
  { name: "Qalyubia", shipments: 85, delivered: 76, rate: 89 },
  { name: "Sharqia", shipments: 70, delivered: 62, rate: 89 },
  { name: "Mansoura", shipments: 55, delivered: 49, rate: 89 },
];

const shipments = [
  { id: "SHP-501", order: "ORD-2401", customer: "Ahmed Hassan", governorate: "Cairo", provider: "Bosta", status: "out_for_delivery", estimated: "Today", tracking: "BOSTA7842155" },
  { id: "SHP-502", order: "ORD-2403", customer: "Mahmoud Ali", governorate: "Alexandria", provider: "Aramex", status: "delivered", estimated: "Delivered", tracking: "ARAMEX992341" },
  { id: "SHP-503", order: "ORD-2406", customer: "Laila Ahmad", governorate: "Giza", provider: "VHub", status: "in_transit", estimated: "Tomorrow", tracking: "VHUB4412890" },
  { id: "SHP-504", order: "ORD-2408", customer: "Fatima Hassan", governorate: "Sharqia", provider: "SMSA", status: "pending", estimated: "2 days", tracking: "SMSA6673412" },
  { id: "SHP-505", order: "ORD-2409", customer: "Khaled Omar", governorate: "Cairo", provider: "Bosta", status: "delivered", estimated: "Delivered", tracking: "BOSTA8892341" },
  { id: "SHP-506", order: "ORD-2410", customer: "Nadia Samir", governorate: "Qalyubia", provider: "Aramex", status: "out_for_delivery", estimated: "Today", tracking: "ARAMEX1145234" },
  { id: "SHP-507", order: "ORD-2411", customer: "Hassan Youssef", governorate: "Giza", provider: "VHub", status: "returned", estimated: "Returned", tracking: "VHUB2289011" },
  { id: "SHP-508", order: "ORD-2412", customer: "Mona Ibrahim", governorate: "Cairo", provider: "Bosta", status: "in_transit", estimated: "Tomorrow", tracking: "BOSTA3325678" },
];

const kpiCards = [
  { label: "Active Shipments", value: "142", change: "38 out for delivery", icon: Truck, color: "#F97316" },
  { label: "Delivery Rate", value: "90.8%", change: "+2.3% this week", icon: CheckCircle, color: "#F97316" },
  { label: "Avg. Delivery", value: "2.1 days", change: "-0.3 days faster", icon: Clock, color: "#F97316" },
  { label: "Returns", value: "46", change: "4.4% return rate", icon: AlertTriangle, color: "#F97316" },
];

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/15 text-blue-400",
  in_transit: "bg-amber-500/15 text-amber-400",
  out_for_delivery: "bg-violet-500/15 text-violet-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  returned: "bg-red-500/15 text-red-400",
};

export default function ShippingAgent() {
  const [filter, setFilter] = useState<string>("all");
  const [provider, setProvider] = useState<string>("all");

  const filteredShipments = shipments.filter(s => {
    if (filter !== "all" && s.status !== filter) return false;
    if (provider !== "all" && s.provider !== provider) return false;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <Truck className="w-6 h-6 text-orange-400" />
              Shipping Agent
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">Multi-provider logistics management, real-time tracking, and delivery optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#0A1120] border border-[#1A2744] text-sm text-[#E8EDF5] focus:outline-none focus:border-orange-500/50">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#8B95A8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors">
              <Zap className="w-4 h-4" /> Bulk Update
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#8B95A8]">{kpi.label}</span>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-orange-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {/* Delivery Trend + Provider Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              Delivery Pipeline (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={deliveryTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                <XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                <Bar dataKey="shipped" name="Shipped" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="returned" name="Returned" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-orange-400" />
              Provider Performance
            </h3>
            <div className="space-y-4">
              {providerData.map((p) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-[#E8EDF5]">{p.name}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-[#8B95A8]">{p.shipments} orders</span>
                      <span className="text-emerald-400">{p.rate}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-[#1A2744] overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.rate}%`, backgroundColor: p.color }} />
                  </div>
                  <div className="text-[10px] text-[#8B95A8] mt-1">Avg {p.avgDays} days delivery</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Governorate Map + Shipments Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-1 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-400" />
              By Governorate
            </h3>
            <div className="space-y-3">
              {governorateData.map((g) => (
                <div key={g.name} className="flex items-center justify-between p-2 rounded-lg bg-[#050A14]">
                  <div>
                    <span className="text-sm text-[#E8EDF5]">{g.name}</span>
                    <div className="text-xs text-[#8B95A8]">{g.shipments} shipments</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-emerald-400 font-mono-data">{g.rate}%</div>
                    <div className="text-xs text-[#8B95A8]">{g.delivered} delivered</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-400" />
              Recent Shipments
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1A2744]">
                    <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">ID</th>
                    <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">Customer</th>
                    <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">Location</th>
                    <th className="text-left py-3 px-2 text-[#8B95A8] font-medium">Provider</th>
                    <th className="text-center py-3 px-2 text-[#8B95A8] font-medium">Status</th>
                    <th className="text-right py-3 px-2 text-[#8B95A8] font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShipments.map((s) => (
                    <tr key={s.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-2 text-[#E8EDF5] font-mono-data text-xs">{s.id}</td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="text-[#E8EDF5]">{s.customer}</div>
                          <div className="text-xs text-[#8B95A8]">{s.tracking}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-[#E8EDF5]">{s.governorate}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#E8EDF5]">{s.provider}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[s.status] || "bg-[#1A2744] text-[#8B95A8]"}`}>
                          {s.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-sm text-[#E8EDF5]">{s.estimated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
