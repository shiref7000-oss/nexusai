import { useState } from "react";
import { FileCode, Layout, TrendingUp, Eye, Globe, Check, X, Star, Layers } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/providers/trpc";

export default function LandingPageAgent() {
  const [tab, setTab] = useState<"pages" | "analytics" | "optimize">("pages");
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: activities } = trpc.dashboard.activityStream.useQuery();

  const kpiCards = [
    { label: "Active Pages", value: "12", change: "3 drafts", icon: Layout, color: "#F59E0B" },
    { label: "Total Revenue", value: `EGP ${((kpis?.totalRevenue || 0) / 1000).toFixed(0)}K`, change: "This month", icon: TrendingUp, color: "#F59E0B" },
    { label: "Total Orders", value: `${kpis?.totalOrders || 0}`, change: "Confirmed", icon: Eye, color: "#F59E0B" },
    { label: "Delivery Rate", value: `${kpis?.deliveryRate || 0}%`, change: "Performance", icon: Star, color: "#F59E0B" },
  ];

  const pageList = [
    { name: "Summer Collection 2024", status: "published", views: 12500, conversion: 5.2, aiOptimized: true },
    { name: "Electronics Flash Sale", status: "published", views: 8900, conversion: 4.8, aiOptimized: true },
    { name: "Home & Living Promo", status: "published", views: 6700, conversion: 3.9, aiOptimized: false },
    { name: "Fitness Essentials", status: "draft", views: 0, conversion: 0, aiOptimized: true },
  ];

  const aiSuggestions = (activities || []).slice(0, 5).map((a: any) => ({
    id: a.id, title: a.action, desc: a.description, agent: a.agent,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><FileCode className="w-6 h-6 text-amber-400" /> Landing Page Agent</h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI landing page builder, A/B testing, conversion optimization, and analytics</p></div>
          <div className="flex gap-2">
            {(["pages", "analytics", "optimize"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t === "optimize" ? "AI Optimize" : t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-amber-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "pages" && (
          <div className="space-y-4">
            {pageList.map((p) => (
              <div key={p.name} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#E8EDF5]">{p.name}</span>
                        {p.aiOptimized && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">AI</span>}
                      </div>
                      <span className={`text-xs ${p.status === "published" ? "text-emerald-400" : "text-[#8B95A8]"}`}>{p.status}</span>
                    </div>
                  </div>
                </div>
                {p.status === "published" && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 rounded-lg bg-[#050A14]"><div className="text-xs text-[#8B95A8]">Views</div><div className="text-sm font-semibold text-[#E8EDF5] font-mono-data">{p.views.toLocaleString()}</div></div>
                    <div className="p-3 rounded-lg bg-[#050A14]"><div className="text-xs text-[#8B95A8]">Conversion</div><div className="text-sm font-semibold text-emerald-400 font-mono-data">{p.conversion}%</div></div>
                    <div className="p-3 rounded-lg bg-[#050A14]"><div className="text-xs text-[#8B95A8]">Est. Sales</div><div className="text-sm font-semibold text-[#E8EDF5] font-mono-data">{Math.round(p.views * p.conversion / 100)}</div></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "optimize" && (
          <div className="space-y-4">
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" />AI Optimization Suggestions</h3>
              <div className="space-y-3">
                {aiSuggestions.map((s) => (
                  <div key={s.id} className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8] capitalize">{s.agent?.replace(/_/g, " ")}</span>
                    </div>
                    <h4 className="text-sm font-medium text-[#E8EDF5] mb-1">{s.title}</h4>
                    <p className="text-xs text-[#8B95A8]">{s.desc}</p>
                  </div>
                ))}
                {aiSuggestions.length === 0 && <div className="text-sm text-[#8B95A8]">No suggestions yet</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
