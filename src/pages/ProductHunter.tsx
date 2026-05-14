import { useState } from "react";
import { Search, TrendingUp, Package, DollarSign, BarChart3, Lightbulb, Check, X, ExternalLink, Star, ArrowUpRight, Eye, MousePointer } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { trpc } from "@/providers/trpc";

const radarData = [
  { metric: "Demand", current: 85, competitor: 70 },
  { metric: "Margin", current: 78, competitor: 65 },
  { metric: "Quality", current: 92, competitor: 80 },
  { metric: "Shipping", current: 75, competitor: 85 },
  { metric: "Saturation", current: 60, competitor: 90 },
  { metric: "Seasonality", current: 88, competitor: 72 },
];

const trendData = [
  { month: "Jan", products: 12, score: 78 }, { month: "Feb", products: 18, score: 82 },
  { month: "Mar", products: 24, score: 85 }, { month: "Apr", products: 32, score: 88 },
  { month: "May", products: 28, score: 84 }, { month: "Jun", products: 42, score: 91 },
];

export default function ProductHunter() {
  const [tab, setTab] = useState<"research" | "products" | "analytics">("research");
  const { data: productList, isLoading } = trpc.product.list.useQuery();
  const { data: stats } = trpc.product.stats.useQuery();
  const { data: recsData } = trpc.agent.recommendations.useQuery({ agent: "product_hunter" });

  const products = productList || [];
  const recommendations = recsData || [];

  const kpiCards = [
    { label: "Active Products", value: `${stats?.total || 0}`, change: "+15 from DB", icon: Package, color: "#10B981" },
    { label: "Avg. Margin", value: `${stats?.avgMargin ? stats.avgMargin.toFixed(1) : "0"}%`, change: "Live from DB", icon: DollarSign, color: "#10B981" },
    { label: "Categories", value: `${stats?.categories?.length || 0}`, change: "Product groups", icon: Star, color: "#10B981" },
    { label: "AI Suggestions", value: `${recommendations.length}`, change: "Pending review", icon: Lightbulb, color: "#10B981" },
  ];

  const categoryData = stats?.categories?.map(c => ({
    name: c.category, count: Number(c.count), margin: Number(c.avgMargin),
  })) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <Search className="w-6 h-6 text-emerald-400" /> Product Hunter
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered product research, sourcing analysis, and winning product detection</p>
          </div>
          <div className="flex gap-2">
            {(["research", "products", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t}</button>
            ))}
          </div>
        </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-emerald-400" />AI Product Recommendations</h3>
                {isLoading ? <div className="text-sm text-[#8B95A8] animate-pulse">Loading products...</div> : (
                  <div className="space-y-3">
                    {products.slice(0, 8).map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#E8EDF5]">{p.name}</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8]">{p.category}</span>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${Number(p.aiScore) >= 90 ? "bg-emerald-500/15 text-emerald-400" : Number(p.aiScore) >= 80 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>Score: {p.aiScore}</span>
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-[#8B95A8]">
                            <span>Margin: <strong className="text-[#E8EDF5]">{p.margin}%</strong></span>
                            <span>Cost: <strong className="text-[#E8EDF5]">EGP {p.costPrice}</strong></span>
                            <span>Sell: <strong className="text-[#E8EDF5]">EGP {p.sellingPrice}</strong></span>
                            <span>Demand: <strong className="text-[#E8EDF5]">{p.demandLevel}</strong></span>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-lg font-medium ml-4 ${p.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-400" />Product Viability Radar</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}><PolarGrid stroke="#1A2744" /><PolarAngleAxis dataKey="metric" tick={{ fill: "#8B95A8", fontSize: 11 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#8B95A8", fontSize: 10 }} />
                    <Radar name="Selected" dataKey="current" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Market Avg" dataKey="competitor" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-400" />Product Discovery Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <defs><linearGradient id="phProd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                    <linearGradient id="phScore2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="month" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis yAxisId="left" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis yAxisId="right" orientation="right" domain={[60, 100]} tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Area yAxisId="left" type="monotone" dataKey="products" name="Products Found" stroke="#10B981" strokeWidth={2} fill="url(#phProd)" />
                  <Area yAxisId="right" type="monotone" dataKey="score" name="Avg Score" stroke="#8B5CF6" strokeWidth={2} fill="url(#phScore2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === "products" && (
          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Eye className="w-4 h-4 text-emerald-400" />Product Catalog</h3>
            {isLoading ? <div className="text-sm text-[#8B95A8] animate-pulse">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#1A2744]">
                    <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Product</th>
                    <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Category</th>
                    <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Cost</th>
                    <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Price</th>
                    <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Margin</th>
                    <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Score</th>
                    <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Status</th>
                  </tr></thead>
                  <tbody>{products.map((p) => (
                    <tr key={p.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-[#E8EDF5] font-medium">{p.name}</td>
                      <td className="py-3 px-3"><span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8]">{p.category}</span></td>
                      <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.costPrice}</td>
                      <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{p.sellingPrice}</td>
                      <td className="py-3 px-3 text-right"><span className={`font-mono-data font-medium ${Number(p.margin) >= 60 ? "text-emerald-400" : Number(p.margin) >= 40 ? "text-amber-400" : "text-red-400"}`}>{p.margin}%</span></td>
                      <td className="py-3 px-3 text-center text-[#E8EDF5] font-mono-data">{p.aiScore}</td>
                      <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded font-medium ${p.status === "active" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{p.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "analytics" && categoryData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-400" />Products by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="name" tick={{ fill: "#8B95A8", fontSize: 11 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Bar dataKey="count" name="Products" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><ArrowUpRight className="w-4 h-4 text-emerald-400" />Margin by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis type="number" domain={[0, 80]} tick={{ fill: "#8B95A8", fontSize: 12 }} tickFormatter={(v) => `${v}%`} /><YAxis type="category" dataKey="name" tick={{ fill: "#8B95A8", fontSize: 11 }} width={70} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="margin" name="Margin %" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
