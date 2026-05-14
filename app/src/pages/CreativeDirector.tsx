import { useState } from "react";
import { Palette, Image, Video, Type, BarChart3, Eye, MousePointer, TrendingUp, Check, X, Play, Layers, Star } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const campaignTrend = [
  { day: "Mon", impressions: 42000, clicks: 1800, spend: 2500 },
  { day: "Tue", impressions: 48000, clicks: 2100, spend: 2800 },
  { day: "Wed", impressions: 39000, clicks: 1700, spend: 2200 },
  { day: "Thu", impressions: 55000, clicks: 2600, spend: 3400 },
  { day: "Fri", impressions: 62000, clicks: 3100, spend: 3900 },
  { day: "Sat", impressions: 58000, clicks: 2800, spend: 3600 },
  { day: "Sun", impressions: 45000, clicks: 2000, spend: 2700 },
];

const formatData = [
  { name: "Carousel", value: 42, color: "#8B5CF6" },
  { name: "Single Image", value: 28, color: "#10B981" },
  { name: "Video", value: 18, color: "#F59E0B" },
  { name: "Collection", value: 12, color: "#22D3EE" },
];

const creativeVariants = [
  { id: 1, name: "Summer Sale - Carousel A", format: "Carousel", status: "active", impressions: 24500, ctr: 3.8, roas: 4.2, aiGenerated: true },
  { id: 2, name: "Summer Sale - Carousel B", format: "Carousel", status: "active", impressions: 18200, ctr: 2.9, roas: 3.6, aiGenerated: true },
  { id: 3, name: "Product Showcase - Video", format: "Video", status: "testing", impressions: 8900, ctr: 4.2, roas: 5.1, aiGenerated: true },
  { id: 4, name: "Trust Builder - Image", format: "Single Image", status: "active", impressions: 32100, ctr: 2.4, roas: 3.1, aiGenerated: false },
  { id: 5, name: "UGC Style - Video", format: "Video", status: "testing", impressions: 5600, ctr: 5.1, roas: 6.2, aiGenerated: true },
];

const abTests = [
  { id: 1, name: "Headline Test: A/B/C", variants: 3, winner: "A - 'Last Chance'", confidence: 94, uplift: 23 },
  { id: 2, name: "CTA Color Test", variants: 2, winner: "Green CTA", confidence: 88, uplift: 12 },
  { id: 3, name: "Thumbnail Style", variants: 3, winner: "Lifestyle Shot", confidence: 91, uplift: 18 },
];

const kpiCards = [
  { label: "Active Creatives", value: "47", change: "+8 this week", icon: Layers, color: "#8B5CF6" },
  { label: "Avg. CTR", value: "3.42%", change: "+0.6% vs last week", icon: MousePointer, color: "#8B5CF6" },
  { label: "Avg. ROAS", value: "4.1x", change: "+0.3x improvement", icon: TrendingUp, color: "#8B5CF6" },
  { label: "AI Generated", value: "32", change: "68% of total", icon: Star, color: "#8B5CF6" },
];

const aiSuggestions = [
  { id: 1, type: "Headline", content: "Use urgency: 'Only 3 Left in Cairo' drives 34% more clicks", confidence: 92 },
  { id: 2, type: "Visual", content: "Add UGC-style unboxing videos for electronics category", confidence: 87 },
  { id: 3, type: "CTA", content: "Switch CTA to 'Get Mine Now' for 18-25 demographic", confidence: 85 },
];

export default function CreativeDirector() {
  const [tab, setTab] = useState<"creatives" | "testing" | "ai">("creatives");
  const [variants, setVariants] = useState(creativeVariants);

  const toggleStatus = (id: number) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, status: v.status === "active" ? "paused" : "active" } : v));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <Palette className="w-6 h-6 text-violet-400" />
              Creative Director
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered ad creative management, A/B testing, and visual campaign optimization</p>
          </div>
          <div className="flex gap-2">
            {(["creatives", "testing", "ai"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-violet-500/15 text-violet-400 border border-violet-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>
                {t === "ai" ? "AI Studio" : t}
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
              <div className="text-xs text-violet-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "creatives" && (
          <>
            {/* Campaign Chart + Format Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  Campaign Performance (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={campaignTrend}>
                    <defs>
                      <linearGradient id="cdImp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="cdClick" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                    <XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                    <Area yAxisId="left" type="monotone" dataKey="impressions" name="Impressions" stroke="#8B5CF6" strokeWidth={2} fill="url(#cdImp)" />
                    <Area yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="#10B981" strokeWidth={2} fill="url(#cdClick)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-violet-400" />
                  Creative Format Mix
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={formatData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                      {formatData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {formatData.map((f) => (
                    <div key={f.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                      <span className="text-[#8B95A8]">{f.name}</span>
                      <span className="text-[#E8EDF5] font-medium">{f.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Creative Variants */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-violet-400" />
                Creative Variants
              </h3>
              <div className="space-y-3">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-4 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#1A2744] flex items-center justify-center">
                        {v.format === "Video" ? <Video className="w-5 h-5 text-violet-400" /> : v.format === "Carousel" ? <Layers className="w-5 h-5 text-violet-400" /> : <Image className="w-5 h-5 text-violet-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#E8EDF5]">{v.name}</span>
                          {v.aiGenerated && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-400 font-medium">AI</span>}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${v.status === "active" ? "bg-emerald-500/15 text-emerald-400" : v.status === "testing" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                            {v.status}
                          </span>
                        </div>
                        <span className="text-xs text-[#8B95A8]">{v.format}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-[#8B95A8]">Impressions</div>
                        <div className="text-sm text-[#E8EDF5] font-mono-data">{v.impressions.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8B95A8]">CTR</div>
                        <div className={`text-sm font-mono-data font-medium ${v.ctr >= 4 ? "text-emerald-400" : v.ctr >= 3 ? "text-amber-400" : "text-red-400"}`}>{v.ctr}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#8B95A8]">ROAS</div>
                        <div className="text-sm text-emerald-400 font-mono-data font-medium">{v.roas}x</div>
                      </div>
                      <button onClick={() => toggleStatus(v.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${v.status === "active" ? "bg-red-500/15 text-red-400 hover:bg-red-500/25" : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"}`}>
                        {v.status === "active" ? "Pause" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "testing" && (
          <div className="space-y-4">
            {abTests.map((test) => (
              <div key={test.id} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold text-[#E8EDF5]">{test.name}</h4>
                    <p className="text-xs text-[#8B95A8] mt-1">{test.variants} variants tested</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-medium">{test.confidence}% confidence</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-[#050A14] border border-emerald-500/30">
                    <span className="text-xs text-[#8B95A8]">Winner</span>
                    <div className="text-sm font-medium text-emerald-400 mt-1">{test.winner}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    <span className="text-xs text-[#8B95A8]">Uplift</span>
                    <div className="text-sm font-medium text-emerald-400 mt-1">+{test.uplift}%</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    <span className="text-xs text-[#8B95A8]">Recommendation</span>
                    <div className="text-sm font-medium text-[#E8EDF5] mt-1">Apply to all campaigns</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiSuggestions.map((s) => (
              <div key={s.id} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-semibold text-[#E8EDF5]">{s.type} Optimization</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-violet-500/15 text-violet-400">{s.confidence}% confidence</span>
                </div>
                <p className="text-sm text-[#E8EDF5] mb-4">{s.content}</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-violet-500/15 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-colors flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Apply
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-[#1A2744] text-[#8B95A8] text-sm font-medium hover:bg-[#2A3764] transition-colors flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow lg:col-span-2">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-violet-400" />
                AI Creative Studio
              </h3>
              <p className="text-sm text-[#8B95A8] mb-4">Generate new ad creatives using AI. Describe your campaign and the AI will create headlines, copy, and visual suggestions.</p>
              <div className="flex gap-3">
                <input type="text" placeholder="Describe your campaign (e.g., 'Summer sale for electronics in Cairo')..."
                  className="flex-1 px-4 py-3 rounded-lg bg-[#050A14] border border-[#1A2744] text-sm text-[#E8EDF5] placeholder-[#8B95A8] focus:outline-none focus:border-violet-500/50" />
                <button className="px-6 py-3 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors">
                  Generate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
