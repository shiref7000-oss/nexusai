import { useState } from "react";
import { Link } from "react-router";
import { TrendingUp, TrendingDown, CheckCircle, Truck, DollarSign, Zap, Activity, AlertTriangle, ChevronRight, BarChart3, MapPin, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { trpc } from "@/providers/trpc";

function KPICard({ title, value, change, icon: Icon, color, loading }: { title: string; value: string; change: string; icon: React.ElementType; color: string; loading?: boolean }) {
  const isPositive = change.startsWith("+");
  if (loading) return (
    <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-[#1A2744] mb-3" />
      <div className="h-3 w-20 bg-[#1A2744] rounded mb-2" />
      <div className="h-7 w-24 bg-[#1A2744] rounded" />
    </div>
  );
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

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("30 Days");

  const { data: kpis, isLoading: kpisLoading } = trpc.dashboard.kpis.useQuery();
  const { data: revenueTrend } = trpc.dashboard.revenueTrend.useQuery();
  const { data: govData } = trpc.dashboard.governorateBreakdown.useQuery();
  const { data: activities } = trpc.dashboard.activityStream.useQuery();
  const { data: alerts } = trpc.dashboard.alerts.useQuery();
  const { data: agentStatusData } = trpc.dashboard.agentStatus.useQuery();

  const revenueChartData = revenueTrend?.length
    ? revenueTrend.map(r => ({ day: r.day || 0, revenue: r.revenue || 0 }))
    : Array.from({ length: 30 }, (_, i) => ({ day: i + 1, revenue: 25000 + Math.sin(i * 0.3) * 8000 + Math.random() * 5000 }));

  const governorateChartData = govData?.length
    ? govData.map(g => ({ gov: g.name, orders: g.orders }))
    : [{ gov: "Cairo", orders: 342 }, { gov: "Giza", orders: 198 }, { gov: "Alex", orders: 156 }, { gov: "Mansoura", orders: 89 }, { gov: "Tanta", orders: 67 }];

  const activityFeed = activities?.length
    ? activities.map(a => ({
        id: a.id,
        agent: a.agent.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) + " Agent",
        action: a.description || a.action,
        type: a.impact === "positive" ? "recommendation" : a.impact === "negative" ? "alert" : "analysis",
        impact: a.impactValue ? `EGP ${Number(a.impactValue).toLocaleString()}` : "",
      }))
    : [
      { id: 1, agent: "CEO Agent", action: "ROAS on Wireless Charger reached 4.1x. Recommend scaling.", type: "recommendation", impact: "+EGP 12,000/mo" },
      { id: 2, agent: "Shipping Agent", action: "Bosta delivery in Aswan dropped to 72%. Switch to Aramex.", type: "alert", impact: "+8% delivery" },
      { id: 3, agent: "Product Hunter", action: "New winning product: Smart Water Bottle (margin 6.5x)", type: "analysis", impact: "+EGP 15,800/mo" },
    ];

  const priorityAlerts = alerts?.length
    ? alerts.map(a => ({ id: a.id, title: a.title, impact: a.impact || "Review needed", severity: a.confidence && a.confidence > 90 ? "danger" : "warning" }))
    : [
      { id: 1, title: "3 campaigns below target ROAS", impact: "Review needed", severity: "warning" },
      { id: 2, title: "12 orders flagged as fake (96% confidence)", impact: "Auto-cancelled 8", severity: "warning" },
      { id: 3, title: "Cash flow negative this week", impact: "Reduce ad spend", severity: "danger" },
    ];

  const agentGrid = agentStatusData?.length
    ? agentStatusData.map(a => ({
        name: a.agent.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        status: a.isActive ? "operational" : "processing",
        color: a.pendingActions > 0 ? "#F59E0B" : "#10B981",
        pending: a.pendingActions,
      }))
    : [
      { name: "CEO", status: "operational", color: "#22D3EE", pending: 0 },
      { name: "Product Hunter", status: "operational", color: "#10B981", pending: 0 },
      { name: "Creative", status: "processing", color: "#8B5CF6", pending: 0 },
      { name: "Landing Page", status: "operational", color: "#F59E0B", pending: 0 },
      { name: "Confirmation", status: "operational", color: "#3B82F6", pending: 0 },
      { name: "Shipping", status: "processing", color: "#F97316", pending: 0 },
      { name: "Finance", status: "operational", color: "#EF4444", pending: 0 },
      { name: "HR & Team", status: "operational", color: "#6366F1", pending: 0 },
    ];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E8EDF5] tracking-tight">Command Center</h2>
          <p className="text-sm text-[#8B95A8] mt-1">{kpis ? `${kpis.shipmentCount} shipments this month. ${kpis.activeCampaigns} active campaigns.` : "Loading dashboard data..."}</p>
        </div>
        <div className="flex gap-2">
          {["7 Days", "30 Days", "90 Days"].map(r => (
            <button key={r} onClick={() => setDateRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateRange === r ? "bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30" : "text-[#8B95A8] hover:text-[#E8EDF5] border border-transparent"}`}>{r}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={kpis ? `EGP ${(kpis.totalRevenue / 1000).toFixed(0)}K` : "EGP 0"} change="+12.5%" icon={DollarSign} color="#22D3EE" loading={kpisLoading} />
        <KPICard title="Confirmation Rate" value={kpis ? `${kpis.confirmationRate}%` : "0%"} change="+2.3%" icon={CheckCircle} color="#10B981" loading={kpisLoading} />
        <KPICard title="Delivery Rate" value={kpis ? `${kpis.deliveryRate}%` : "0%"} change="+1.8%" icon={Truck} color="#F59E0B" loading={kpisLoading} />
        <KPICard title="Active Campaigns" value={kpis ? `${kpis.activeCampaigns}` : "0"} change="+3" icon={Zap} color="#8B5CF6" loading={kpisLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2"><Activity className="w-4 h-4 text-[#22D3EE]" />Revenue Trend</h3>
            <span className="text-xs text-[#8B95A8]">{dateRange}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueChartData}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22D3EE" stopOpacity={0.3} /><stop offset="100%" stopColor="#22D3EE" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 11 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 11 }} tickFormatter={v => `EGP ${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ backgroundColor: "#0A1120", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => [`EGP ${v?.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#22D3EE" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow">
          <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2 mb-4"><MapPin className="w-4 h-4 text-[#22D3EE]" />Orders by Governorate</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={governorateChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis type="number" tick={{ fill: "#8B95A8", fontSize: 11 }} /><YAxis dataKey="gov" type="category" tick={{ fill: "#8B95A8", fontSize: 11 }} width={70} />
              <Tooltip contentStyle={{ backgroundColor: "#0A1120", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
              <Bar dataKey="orders" fill="#22D3EE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow">
          <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2 mb-4"><Activity className="w-4 h-4 text-[#22D3EE]" />AI Agent Activity Stream</h3>
          <div className="space-y-3">
            {activityFeed.map(a => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#050A14] border border-[#1A2744]/50">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.type === "recommendation" ? "bg-[#10B981]" : a.type === "alert" ? "bg-[#F59E0B]" : "bg-[#22D3EE"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#8B95A8] mb-0.5">{a.agent}</p>
                  <p className="text-sm text-[#E8EDF5]">{a.action}</p>
                </div>
                {a.impact && <span className="text-xs font-medium text-[#10B981] shrink-0">{a.impact}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow">
          <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2 mb-4"><AlertTriangle className="w-4 h-4 text-[#F59E0B]" />Priority Alerts</h3>
          <div className="space-y-3">
            {priorityAlerts.map(a => (
              <div key={a.id} className={`p-3 rounded-lg border ${a.severity === "danger" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : "bg-[#F59E0B]/5 border-[#F59E0B]/20"}`}>
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className={`w-3.5 h-3.5 ${a.severity === "danger" ? "text-[#EF4444]" : "text-[#F59E0B]"}`} /><p className="text-sm font-medium text-[#E8EDF5]">{a.title}</p></div>
                <p className="text-xs text-[#8B95A8] ml-5.5">{a.impact}</p>
              </div>
            ))}
          </div>
          <Link to="/moderator" className="mt-4 flex items-center justify-center gap-1 text-xs text-[#22D3EE] hover:text-[#67E8F9] transition-colors py-2 rounded-lg border border-[#22D3EE]/20 hover:border-[#22D3EE]/40">View Moderator<ChevronRight className="w-3 h-3" /></Link>
        </div>
      </div>

      <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow">
        <h3 className="text-sm font-semibold text-[#E8EDF5] flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-[#22D3EE]" />Agent Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {agentGrid.map(a => (
            <div key={a.name} className="flex flex-col items-center p-3 rounded-lg bg-[#050A14] border border-[#1A2744]/50">
              <div className="w-2.5 h-2.5 rounded-full mb-2" style={{ backgroundColor: a.color, boxShadow: `0 0 8px ${a.color}40` }} />
              <span className="text-xs text-[#E8EDF5] font-medium text-center">{a.name}</span>
              <span className="text-[10px] text-[#8B95A8] capitalize">{a.status}</span>
              {a.pending > 0 && <span className="text-[10px] text-[#F59E0B] mt-1">{a.pending} pending</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
