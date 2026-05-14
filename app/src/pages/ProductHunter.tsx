import { useState } from "react";
import { Search, TrendingUp, Package, DollarSign, BarChart3, Lightbulb, Check, X, ExternalLink, Star, ArrowUpRight, Eye, MousePointer } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

const trendData = [
  { month: "Jan", products: 12, score: 78 },
  { month: "Feb", products: 18, score: 82 },
  { month: "Mar", products: 24, score: 85 },
  { month: "Apr", products: 32, score: 88 },
  { month: "May", products: 28, score: 84 },
  { month: "Jun", products: 42, score: 91 },
];

const categoryData = [
  { name: "Electronics", count: 34, margin: 42 },
  { name: "Home", count: 28, margin: 38 },
  { name: "Beauty", count: 22, margin: 55 },
  { name: "Fashion", count: 18, margin: 48 },
  { name: "Sports", count: 15, margin: 35 },
  { name: "Toys", count: 12, margin: 40 },
];

const radarData = [
  { metric: "Demand", current: 85, competitor: 70 },
  { metric: "Margin", current: 78, competitor: 65 },
  { metric: "Quality", current: 92, competitor: 80 },
  { metric: "Shipping", current: 75, competitor: 85 },
  { metric: "Saturation", current: 60, competitor: 90 },
  { metric: "Seasonality", current: 88, competitor: 72 },
];

const recommendations = [
  { id: 1, name: "Wireless Earbuds Pro", category: "Electronics", margin: 52, demand: "High", competition: "Medium", score: 94, status: "pending" },
  { id: 2, name: "Organic Skincare Set", category: "Beauty", margin: 68, demand: "High", competition: "Low", score: 91, status: "approved" },
  { id: 3, name: "Smart Home Hub", category: "Electronics", margin: 45, demand: "Medium", competition: "High", score: 78, status: "pending" },
  { id: 4, name: "Fitness Resistance Bands", category: "Sports", margin: 72, demand: "Medium", competition: "Low", score: 88, status: "rejected" },
  { id: 5, name: "LED Desk Lamp", category: "Home", margin: 55, demand: "High", competition: "Medium", score: 86, status: "pending" },
];

const topProducts = [
  { name: "Wireless Earbuds Pro", views: 12400, clicks: 3800, ctr: 30.6, sales: 156, revenue: 234000 },
  { name: "Organic Skincare Set", views: 8900, clicks: 2900, ctr: 32.6, sales: 128, revenue: 192000 },
  { name: "Smart Watch Band", views: 7200, clicks: 2100, ctr: 29.2, sales: 98, revenue: 117600 },
  { name: "Phone Stand", views: 15600, clicks: 4200, ctr: 26.9, sales: 245, revenue: 245000 },
  { name: "USB-C Hub", views: 6800, clicks: 1900, ctr: 27.9, sales: 76, revenue: 136800 },
];

const kpiCards = [
  { label: "Active Products", value: "129", change: "+23 this month", icon: Package, color: "#10B981" },
  { label: "Avg. Margin", value: "47.2%", change: "+3.8% vs last month", icon: DollarSign, color: "#10B981" },
  { label: "Winning Score", value: "86.4", change: "+2.1 improvement", icon: Star, color: "#10B981" },
  { label: "AI Suggestions", value: "18", change: "4 pending review", icon: Lightbulb, color: "#10B981" },
];

export default function ProductHunter() {
  const [recs, setRecs] = useState(recommendations);
  const [tab, setTab] = useState<"research" | "products" | "analytics">("research");

  const handleDecision = (id: number, decision: "approved" | "rejected") => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: decision } : r));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <Search className="w-6 h-6 text-emerald-400" />
              Product Hunter
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered product research, sourcing analysis, and winning product detection</p>
          </div>
          <div className="flex gap-2">
            {(["research", "products", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>
                {t}
              </button>
            ))}
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
              <div className="text-xs text-emerald-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "research" && (
          <>
            {/* Recommendations + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-400" />
                  AI Product Recommendations
                </h3>
                <div className="space-y-3">
                  {recs.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-[#E8EDF5]">{rec.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8]">{rec.category}</span>
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${rec.score >= 90 ? "bg-emerald-500/15 text-emerald-400" : rec.score >= 80 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                            Score: {rec.score}
                          </span>
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-[#8B95A8]">
                          <span>Margin: <strong className="text-[#E8EDF5]">{rec.margin}%</strong></span>
                          <span>Demand: <strong className="text-[#E8EDF5]">{rec.demand}</strong></span>
                          <span>Competition: <strong className="text-[#E8EDF5]">{rec.competition}</strong></span>
                        </div>
                      </div>
                      {rec.status === "pending" ? (
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => handleDecision(rec.id, "approved")} className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDecision(rec.id, "rejected")} className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ml-4 ${rec.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                          {rec.status === "approved" ? "Approved" : "Rejected"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Product Viability Radar
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1A2744" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#8B95A8", fontSize: 11 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#8B95A8", fontSize: 10 }} />
                    <Radar name="Selected" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Market Avg" dataKey="competitor" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Product Discovery Trend (6 Months)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="phProducts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="phScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                  <XAxis dataKey="month" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Area yAxisId="left" type="monotone" dataKey="products" name="Products Found" stroke="#10B981" strokeWidth={2} fill="url(#phProducts)" />
                  <Area yAxisId="right" type="monotone" dataKey="score" name="Avg Score" stroke="#8B5CF6" strokeWidth={2} fill="url(#phScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === "products" && (
          <>
            {/* Top Products Table */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                Top Performing Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1A2744]">
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Product</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Views</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Clicks</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">CTR</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Sales</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Revenue (EGP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[#E8EDF5] font-medium">{p.name}</span>
                            <ExternalLink className="w-3 h-3 text-[#8B95A8]" />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.views.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.clicks.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-mono-data font-medium ${p.ctr >= 30 ? "text-emerald-400" : p.ctr >= 27 ? "text-amber-400" : "text-red-400"}`}>{p.ctr}%</span>
                        </td>
                        <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.sales}</td>
                        <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "analytics" && (
          <>
            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Products by Category
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                    <XAxis dataKey="name" tick={{ fill: "#8B95A8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                    <Bar dataKey="count" name="Products" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  Margin by Category
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                    <XAxis type="number" domain={[0, 70]} tick={{ fill: "#8B95A8", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#8B95A8", fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="margin" name="Margin %" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
