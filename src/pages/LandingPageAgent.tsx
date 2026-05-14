import { useState } from "react";
import { FileCode, Layout, TrendingUp, Eye, MousePointer, Clock, ArrowUpRight, BarChart3, Globe, Smartphone, Check, X, Star, Layers } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const conversionTrend = [
  { date: "01", views: 3200, conversions: 96, rate: 3.0 },
  { date: "02", views: 3800, conversions: 133, rate: 3.5 },
  { date: "03", views: 2900, conversions: 87, rate: 3.0 },
  { date: "04", views: 4200, conversions: 168, rate: 4.0 },
  { date: "05", views: 5100, conversions: 229, rate: 4.5 },
  { date: "06", views: 4800, conversions: 211, rate: 4.4 },
  { date: "07", views: 5600, conversions: 280, rate: 5.0 },
  { date: "08", views: 6200, conversions: 341, rate: 5.5 },
  { date: "09", views: 5900, conversions: 324, rate: 5.5 },
  { date: "10", views: 7100, conversions: 426, rate: 6.0 },
];

const deviceData = [
  { name: "Mobile", visitors: 62, conversion: 4.2, color: "#F59E0B" },
  { name: "Desktop", visitors: 28, conversion: 5.8, color: "#22D3EE" },
  { name: "Tablet", visitors: 10, conversion: 3.9, color: "#8B5CF6" },
];

const pages = [
  { id: 1, name: "Summer Collection 2024", status: "published", views: 12500, conversion: 5.2, bounce: 32, time: 148, aiOptimized: true },
  { id: 2, name: "Electronics Flash Sale", status: "published", views: 8900, conversion: 4.8, bounce: 28, time: 132, aiOptimized: true },
  { id: 3, name: "New Arrivals - Beauty", status: "draft", views: 0, conversion: 0, bounce: 0, time: 0, aiOptimized: true },
  { id: 4, name: "Home & Living Promo", status: "published", views: 6700, conversion: 3.9, bounce: 38, time: 95, aiOptimized: false },
  { id: 5, name: "Fitness Essentials", status: "published", views: 5400, conversion: 4.5, bounce: 30, time: 112, aiOptimized: true },
];

const heatmapSections = [
  { section: "Hero Banner", attention: 94, clicks: 42 },
  { section: "Product Grid", attention: 78, clicks: 35 },
  { section: "Trust Badges", attention: 45, clicks: 8 },
  { section: "Reviews", attention: 62, clicks: 12 },
  { section: "CTA Button", attention: 88, clicks: 38 },
  { section: "FAQ", attention: 35, clicks: 5 },
];

const kpiCards = [
  { label: "Active Pages", value: "12", change: "3 drafts pending", icon: Layout, color: "#F59E0B" },
  { label: "Avg. Conversion", value: "4.68%", change: "+0.8% this week", icon: TrendingUp, color: "#F59E0B" },
  { label: "Total Visitors", value: "38.4K", change: "+12.3% vs last week", icon: Eye, color: "#F59E0B" },
  { label: "AI Optimized", value: "8", change: "67% of pages", icon: Star, color: "#F59E0B" },
];

const aiSuggestions = [
  { id: 1, page: "Home & Living Promo", suggestion: "Move CTA above the fold - current placement gets 40% less clicks", impact: "+22% conversion" },
  { id: 2, page: "Summer Collection 2024", suggestion: "Add social proof badges near checkout button", impact: "+15% conversion" },
  { id: 3, page: "Electronics Flash Sale", suggestion: "Reduce form fields from 6 to 3 for mobile users", impact: "+18% conversion" },
];

export default function LandingPageAgent() {
  const [tab, setTab] = useState<"pages" | "analytics" | "optimize">("pages");
  const [pageList, setPageList] = useState(pages);

  const toggleStatus = (id: number) => {
    setPageList(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = p.status === "published" ? "draft" : p.status === "draft" ? "published" : "draft";
      return { ...p, status: next };
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <FileCode className="w-6 h-6 text-amber-400" />
              Landing Page Agent
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI landing page builder, A/B testing, conversion optimization, and heatmap analytics</p>
          </div>
          <div className="flex gap-2">
            {(["pages", "analytics", "optimize"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>
                {t === "optimize" ? "AI Optimize" : t}
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
              <div className="text-xs text-amber-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "pages" && (
          <div className="space-y-4">
            {pageList.map((page) => (
              <div key={page.id} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A2744] flex items-center justify-center">
                      {page.status === "published" ? <Globe className="w-5 h-5 text-amber-400" /> : <FileCode className="w-5 h-5 text-[#8B95A8]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#E8EDF5]">{page.name}</span>
                        {page.aiOptimized && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-medium">AI</span>}
                      </div>
                      <span className={`text-xs ${page.status === "published" ? "text-emerald-400" : "text-[#8B95A8]"}`}>
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => toggleStatus(page.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${page.status === "published" ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"}`}>
                    {page.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>

                {page.status === "published" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-[#050A14]">
                      <div className="text-xs text-[#8B95A8]">Views</div>
                      <div className="text-sm font-semibold text-[#E8EDF5] font-mono-data mt-1">{page.views.toLocaleString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#050A14]">
                      <div className="text-xs text-[#8B95A8]">Conversion</div>
                      <div className="text-sm font-semibold text-emerald-400 font-mono-data mt-1">{page.conversion}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#050A14]">
                      <div className="text-xs text-[#8B95A8]">Bounce Rate</div>
                      <div className="text-sm font-semibold text-amber-400 font-mono-data mt-1">{page.bounce}%</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#050A14]">
                      <div className="text-xs text-[#8B95A8]">Avg. Time</div>
                      <div className="text-sm font-semibold text-[#E8EDF5] font-mono-data mt-1">{page.time}s</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "analytics" && (
          <>
            {/* Conversion Trend */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow mb-6">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Conversion Rate Trend (Last 10 Days)
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={conversionTrend}>
                  <defs>
                    <linearGradient id="lpConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                  <XAxis dataKey="date" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <YAxis domain={[0, 8]} tick={{ fill: "#8B95A8", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="rate" name="Conversion Rate" stroke="#F59E0B" strokeWidth={2} fill="url(#lpConv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Device Breakdown + Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  Device Breakdown
                </h3>
                <div className="space-y-4">
                  {deviceData.map((d) => (
                    <div key={d.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[#E8EDF5]">{d.name}</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-[#8B95A8]">{d.visitors}% visitors</span>
                          <span className="text-emerald-400">{d.conversion}% conv</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-[#1A2744] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${d.visitors}%`, backgroundColor: d.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  Section Heatmap (Attention %)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={heatmapSections} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8B95A8", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="section" tick={{ fill: "#8B95A8", fontSize: 11 }} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="attention" name="Attention" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {tab === "optimize" && (
          <div className="space-y-4">
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                AI Optimization Suggestions
              </h3>
              <div className="space-y-3">
                {aiSuggestions.map((s) => (
                  <div key={s.id} className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#E8EDF5]">{s.page}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">{s.impact}</span>
                    </div>
                    <p className="text-sm text-[#8B95A8] mb-3">{s.suggestion}</p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors flex items-center gap-1.5">
                        <Check className="w-3 h-3" /> Apply
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#1A2744] text-[#8B95A8] text-xs font-medium hover:bg-[#2A3764] transition-colors flex items-center gap-1.5">
                        <X className="w-3 h-3" /> Dismiss
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Quick Builder
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Page name..."
                  className="px-4 py-3 rounded-lg bg-[#050A14] border border-[#1A2744] text-sm text-[#E8EDF5] placeholder-[#8B95A8] focus:outline-none focus:border-amber-500/50" />
                <select className="px-4 py-3 rounded-lg bg-[#050A14] border border-[#1A2744] text-sm text-[#E8EDF5] focus:outline-none focus:border-amber-500/50">
                  <option value="">Select template...</option>
                  <option value="product">Product Showcase</option>
                  <option value="collection">Collection Grid</option>
                  <option value="flash">Flash Sale</option>
                  <option value="lead">Lead Capture</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <button className="flex-1 py-2.5 rounded-lg bg-amber-500 text-[#050A14] text-sm font-semibold hover:bg-amber-400 transition-colors">
                  Create Page
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-[#1A2744] text-[#8B95A8] text-sm font-medium hover:bg-[#2A3764] transition-colors">
                  AI Generate Full Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
