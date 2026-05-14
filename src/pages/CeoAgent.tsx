import { useState } from "react";
import { Crown, TrendingUp, BarChart3, DollarSign, Target, Users, Zap, Check, X, Lightbulb } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { trpc } from "@/providers/trpc";

export default function CeoAgent() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: trend } = trpc.finance.trend.useQuery();
  const { data: recs } = trpc.agent.recommendations.useQuery({ limit: 8 });

  const kpiCards = [
    { label: "Monthly Revenue", value: `EGP ${((kpis?.totalRevenue || 0) / 1000).toFixed(0)}K`, icon: DollarSign, color: "#22D3EE" },
    { label: "Total Orders", value: `${kpis?.totalOrders || 0}`, icon: BarChart3, color: "#10B981" },
    { label: "Active Campaigns", value: `${kpis?.activeCampaigns || 0}`, icon: Target, color: "#8B5CF6" },
    { label: "Delivery Rate", value: `${kpis?.deliveryRate || 0}%`, icon: TrendingUp, color: "#F59E0B" },
    { label: "Confirmation Rate", value: `${kpis?.confirmationRate || 0}%`, icon: Users, color: "#3B82F6" },
    { label: "Product Count", value: `${kpis?.totalProducts || 0}`, icon: Zap, color: "#F97316" },
  ];

  const lineData = trend?.map((r: any) => ({
    date: r.date?.slice(5) || "", revenue: Number(r.revenue || 0), adSpend: Number(Math.abs(r.adSpend || 0)),
  })) || [];

  const recommendations = recs || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><Crown className="w-6 h-6 text-cyan-400" /> CEO Agent</h1>
            <p className="text-sm text-[#8B95A8] mt-1">Strategic business intelligence, financial health monitoring, and AI-powered executive insights</p></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" />Revenue vs Ad Spend</h3>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="date" tick={{ fill: "#8B95A8", fontSize: 11 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="adSpend" name="Ad Spend" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-[#8B95A8] animate-pulse">Loading...</div>}
          </div>

          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-cyan-400" />AI Strategic Recommendations</h3>
            <div className="space-y-3">
              {recommendations.map((r: any) => (
                <div key={r.id} className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8] capitalize">{r.agent?.replace(/_/g, " ")}</span>
                    <span className="text-xs text-cyan-400">{r.confidence}% confidence</span>
                  </div>
                  <h4 className="text-sm font-medium text-[#E8EDF5] mb-1">{r.title}</h4>
                  <p className="text-xs text-[#8B95A8] mb-2">{r.description}</p>
                  {r.impact && <span className="text-xs text-emerald-400 font-medium">{r.impact}</span>}
                </div>
              ))}
              {recommendations.length === 0 && <div className="text-sm text-[#8B95A8]">No recommendations yet</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
