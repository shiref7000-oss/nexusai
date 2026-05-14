import { useState } from "react";
import { Link } from "react-router";
import { TrendingUp, TrendingDown, CheckCircle, Truck, DollarSign, Zap, Activity, AlertTriangle, ChevronRight, BarChart3, MapPin } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

function KPICard({ title, value, change, icon: Icon, color }: { title: string; value: string; change: string; icon: React.ElementType; color: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow hover:card-glow-hover transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? "text-[#10B981] bg-[#10B981]/10" : "text-[#EF4444] bg-[#EF4444]/10"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{change}
        </span>
      </div>
      <p className="text-xs text-[#8B95A8] uppercase tracking-wider font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{value}</p>
    </div>
  );
}

const revenueData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, revenue: 25000 + Math.sin(i * 0.3) * 8000 + Math.random() * 5000 }));
const govData = [
  { gov: "Cairo", orders: 342 }, { gov: "Giza", orders: 198 }, { gov: "Alex", orders: 156 },
  { gov: "Mansoura", orders: 89 }, { gov: "Tanta", orders: 67 }, { gov: "Asyut", orders: 45 },
  { gov: "Minya", orders: 38 }, { gov: "Sohag", orders: 29 },
];
const activities = [
  { id: 1, agent: "CEO Agent", action: "ROAS on Wireless Charger reached 4.1x. Recommend scaling.", type: "recommendation", impact: "+EGP 12,000/mo" },
  { id: 2, agent: "Shipping Agent", action: "Bosta delivery in Aswan dropped to 72%. Switch to Aramex.", type: "alert", impact: "+8% delivery" },
  { id: 3, agent: "Product Hunter", action: "New winning product: Smart Water Bottle (margin 6.5x)", type: "analysis", impact: "+EGP 15,800/mo" },
  { id: 4, agent: "Finance Agent", action: "Ad spend up 23%, revenue up only 8%. Review campaigns.", type: "alert", impact: "-EGP 8,400" },
  { id: 5, agent: "Confirmation Agent", action: "12 orders flagged as fake (96.2% confidence). Auto-cancelled 8.", type: "automation", impact: "Saved EGP 3,200" },
  { id: 6, agent: "Creative Director", action: "5 new ad variations generated for Oil Spray. CTR: 3.2%", type: "analysis", impact: "+EGP 5,600/mo" },
];
const alerts = [
  { id: 1, title: "3 campaigns below target ROAS", impact: "Review needed", severity: "warning" },
  { id: 2, title: "12 orders flagged as fake (96% confidence)", impact: "Auto-cancelled 8", severity: "warning" },
  { id: 3, title: "Cash flow negative this week: -EGP 24,000", impact: "Reduce ad spend", severity: "danger" },
];
const agentStatus = [
  { name: "CEO", status: "operational", color: "#22D3EE" }, { name: "Product Hunter", status: "operational", color: "#10B981" },
  { name: "Creative", status: "processing", color: "#8B5CF6" }, { name: "Landing Page", status: "operational", color: "#F59E0B" },
  { name: "Confirmation", status: "operational", color: "#3B82F6" }, { name: "Shipping", status: "processing", color: "#F97316" },
  { name: "Finance", status: "operational", color: "#EF4444" }, { name: "HR & Team", status: "operational", color: "#6366F1" },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30 Days");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E8EDF5] tracking-tight">Command Center</h2>
          <p className="text-sm text-[#8B95A8] mt-1">All agents operational. 1,247 shipments this month.</p>
        </div>
        <div className="flex gap-2">
          {["Today", "7 Days", "30 Days"].map((r) => (
            <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${r === dateRange ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30" : "bg-[#0A1120] text-[#8B95A8] border border-[#1A2744]"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value="EGP 847,320" change="+12.4%" icon={DollarSign} color="#22D3EE" />
        <KPICard title="Confirmation Rate" value="73.8%" change="+2.1%" icon={CheckCircle} color="#10B981" />
        <KPICard title="Delivery Rate" value="89.2%" change="-0.5%" icon={Truck} color="#F59E0B" />
        <KPICard title="Active Campaigns" value="12" change="3 need attention" icon={Zap} color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#22D3EE]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">Revenue & Orders</h3></div>
            <span className="text-xs text-[#8B95A8]">30 days</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs><linearGradient id="rg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity={0.3} /><stop offset="100%" stopColor="#22D3EE" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                <XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" />
                <YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" />
                <Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#22D3EE" strokeWidth={2} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
          <div className="flex items-center gap-2 mb-4"><MapPin className="w-5 h-5 text-[#10B981]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">By Governorate</h3></div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={govData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                <XAxis type="number" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" />
                <YAxis dataKey="gov" type="category" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" width={60} />
                <Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} />
                <Bar dataKey="orders" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
          <div className="flex items-center gap-2 mb-4"><Activity className="w-5 h-5 text-[#22D3EE]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">AI Activity Stream</h3></div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0F1829] border border-[#1A2744]/50">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: a.type === "recommendation" ? "#22D3EE" : a.type === "alert" ? "#F59E0B" : a.type === "automation" ? "#10B981" : "#8B5CF6" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8B95A8] mb-0.5">{a.agent}</p>
                  <p className="text-sm text-[#E8EDF5] leading-relaxed">{a.action}</p>
                  <span className="inline-block mt-1 text-xs font-medium text-[#22D3EE] bg-[#22D3EE]/10 px-2 py-0.5 rounded-full">{a.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-[#F59E0B]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">Priority Alerts</h3></div>
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className={`p-3 rounded-lg border ${a.severity === "danger" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : "bg-[#F59E0B]/5 border-[#F59E0B]/20"}`}>
                  <p className="text-sm text-[#E8EDF5]">{a.title}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs font-medium ${a.severity === "danger" ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>{a.impact}</span>
                    <button className="flex items-center gap-1 text-xs text-[#22D3EE]">Investigate <ChevronRight className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-3">Agent Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {agentStatus.map((a) => (
                <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg bg-[#0F1829]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.status === "operational" ? "bg-[#10B981]" : "bg-[#F59E0B] animate-pulse"}`} />
                  <span className="text-xs text-[#8B95A8]">{a.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
