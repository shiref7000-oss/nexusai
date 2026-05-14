import { useState } from "react";
import { Palette, Image, Video, BarChart3, Eye, MousePointer, TrendingUp, Layers } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/providers/trpc";

const formatData = [
  { name: "Carousel", value: 42, color: "#8B5CF6" },
  { name: "Single Image", value: 28, color: "#10B981" },
  { name: "Video", value: 18, color: "#F59E0B" },
  { name: "Collection", value: 12, color: "#22D3EE" },
];

export default function CreativeDirector() {
  const [tab, setTab] = useState<"creatives" | "testing" | "ai">("creatives");
  const { data: campaignStats } = trpc.campaign.stats.useQuery();
  const { data: campaigns } = trpc.campaign.list.useQuery();

  const s = campaignStats || { total: 0, active: 0, totalSpent: 0, totalImpressions: 0, totalClicks: 0, totalConversions: 0, avgRoas: 0, avgCtr: "0" };
  const campaignList = campaigns || [];

  const kpiCards = [
    { label: "Active Campaigns", value: `${s.active}`, change: `of ${s.total} total`, icon: Layers, color: "#8B5CF6" },
    { label: "Avg. CTR", value: `${s.avgCtr}%`, change: "Click rate", icon: MousePointer, color: "#8B5CF6" },
    { label: "Avg. ROAS", value: `${s.avgRoas}x`, change: "Return ratio", icon: TrendingUp, color: "#8B5CF6" },
    { label: "Total Spent", value: `EGP ${s.totalSpent.toLocaleString()}`, change: "Ad spend", icon: BarChart3, color: "#8B5CF6" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><Palette className="w-6 h-6 text-violet-400" /> Creative Director</h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered ad creative management, A/B testing, and visual campaign optimization</p></div>
          <div className="flex gap-2">
            {(["creatives", "testing", "ai"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-violet-500/15 text-violet-400 border border-violet-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t === "ai" ? "AI Studio" : t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-violet-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4">Campaign Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#1A2744]">
                  <th className="text-left py-3 px-3 text-[#8B95A8]">Campaign</th>
                  <th className="text-center py-3 px-3 text-[#8B95A8]">Status</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8]">Spent</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8]">Impr</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8]">Clicks</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8]">ROAS</th>
                </tr></thead>
                <tbody>{campaignList.map((c: any) => (
                  <tr key={c.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-3 text-[#E8EDF5] font-medium">{c.name}</td>
                    <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded font-medium ${c.status === "active" ? "bg-emerald-500/15 text-emerald-400" : c.status === "draft" ? "bg-amber-500/15 text-amber-400" : "bg-[#1A2744] text-[#8B95A8]"}`}>{c.status}</span></td>
                    <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{Number(c.spent || 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{(Number(c.impressions || 0) / 1000).toFixed(0)}K</td>
                    <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{(Number(c.clicks || 0) / 1000).toFixed(1)}K</td>
                    <td className="py-3 px-3 text-right"><span className={`font-mono-data font-medium ${Number(c.roas) >= 3 ? "text-emerald-400" : Number(c.roas) >= 2 ? "text-amber-400" : "text-red-400"}`}>{c.roas}x</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">Creative Format Mix</h3>
            <ResponsiveContainer width="100%" height={200}><PieChart>
              <Pie data={formatData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {formatData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
            </PieChart></ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {formatData.map((f) => <div key={f.name} className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} /><span className="text-[#8B95A8]">{f.name}</span><span className="text-[#E8EDF5] font-medium">{f.value}%</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
