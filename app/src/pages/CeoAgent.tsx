import { useState } from "react";
import { Target, DollarSign, CheckCircle, Truck, TrendingUp, Sparkles, Heart, Check, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const roasData = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, roas: 2.8 + Math.sin(i * 0.2) * 0.5 + Math.random() * 0.3, cpa: 85 + Math.sin(i * 0.18) * 15 + Math.random() * 10 }));
const recs = [
  { id: 1, title: "Scale Wireless Charger — ROAS at 4.1x. Increase budget 25%.", desc: "Consistent performance over 7 days.", confidence: 94, impact: "+EGP 12,000/mo", status: "pending" },
  { id: 2, title: "Stop Campaign Summer_Sale_Alex — ROAS at 1.8x, below breakeven.", desc: "Audience fatigue after 3 weeks.", confidence: 96, impact: "Save EGP 5,400/mo", status: "pending" },
  { id: 3, title: "Switch Luxor shipments from Bosta to Aramex — 14% better delivery.", desc: "Aramex achieves 86% vs Bosta 72% in Luxor.", confidence: 88, impact: "+14% delivery", status: "accepted" },
];

function HealthGauge({ score, label }: { score: number; label: string }) {
  const r = 36, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ;
  const c = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24"><svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r={r} fill="none" stroke="#1A2744" strokeWidth="6" /><circle cx="50" cy="50" r={r} fill="none" stroke={c} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} /></svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg font-bold text-[#E8EDF5] font-mono-data">{score}</span></div></div><p className="text-xs text-[#8B95A8] mt-2">{label}</p>
    </div>
  );
}

function KPICard({ title, value, target, icon: Icon, color }: { title: string; value: string; target: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow hover:card-glow-hover transition-all hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}15` }}><Icon className="w-5 h-5" style={{ color }} /></div>
      <p className="text-xs text-[#8B95A8] uppercase tracking-wider font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{value}</p>
      <p className="text-xs text-[#8B95A8] mt-1">Target: {target}</p>
    </div>
  );
}

export default function CeoAgent() {
  const [recommendations, setRecs] = useState(recs);
  const updateStatus = (id: number, s: string) => setRecs(recommendations.map((r) => r.id === id ? { ...r, status: s } : r));

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#22D3EE]/15 flex items-center justify-center"><Target className="w-5 h-5 text-[#22D3EE]" /></div>
        <div><h2 className="text-xl font-bold text-[#E8EDF5]">CEO Agent</h2><p className="text-sm text-[#8B95A8]">Executive Intelligence & Strategic Oversight</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KPICard title="ROAS" value="3.2x" target="3.0x" icon={TrendingUp} color="#22D3EE" />
        <KPICard title="CPA" value="EGP 89" target="EGP 95" icon={DollarSign} color="#10B981" />
        <KPICard title="Confirmation Rate" value="73.8%" target="75%" icon={CheckCircle} color="#F59E0B" />
        <KPICard title="Delivery Rate" value="89.2%" target="90%" icon={Truck} color="#3B82F6" />
        <KPICard title="Profit Margin" value="18.5%" target="20%" icon={TrendingUp} color="#8B5CF6" />
        <KPICard title="Cash Flow" value="EGP 42,000" target="Positive" icon={DollarSign} color="#10B981" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
          <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">ROAS & CPA Over Time</h3>
          <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={roasData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis yAxisId="left" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis yAxisId="right" orientation="right" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Line yAxisId="left" type="monotone" dataKey="roas" stroke="#22D3EE" strokeWidth={2} dot={false} /><Line yAxisId="right" type="monotone" dataKey="cpa" stroke="#F59E0B" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
        </div>
        <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
          <div className="flex items-center gap-2 mb-4"><Heart className="w-5 h-5 text-[#EF4444]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">Business Health Score</h3></div>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32"><svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" fill="none" stroke="#1A2744" strokeWidth="8" /><circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeDasharray={314} strokeDashoffset={314 - 82 / 100 * 314} /></svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold text-[#E8EDF5] font-mono-data">82</span><span className="text-xs text-[#8B95A8]">/ 100</span></div></div>
          </div>
          <div className="grid grid-cols-3 gap-4"><HealthGauge score={90} label="Revenue" /><HealthGauge score={78} label="Operations" /><HealthGauge score={85} label="Marketing" /></div>
        </div>
      </div>
      <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
        <div className="flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-[#8B5CF6]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">AI Strategic Recommendations</h3></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((r) => (
            <div key={r.id} className="p-4 rounded-lg bg-[#0F1829] border border-[#1A2744]/50">
              <div className="flex items-start justify-between gap-3 mb-2"><h4 className="text-sm font-semibold text-[#E8EDF5] flex-1">{r.title}</h4><span className="text-xs px-2 py-0.5 rounded-full bg-[#22D3EE]/10 text-[#22D3EE] flex-shrink-0">{r.confidence}%</span></div>
              <p className="text-xs text-[#8B95A8] mb-3">{r.desc}</p>
              <div className="flex items-center justify-between"><span className="text-sm font-medium text-[#10B981]">{r.impact}</span>
                <div className="flex gap-2">
                  {r.status === "pending" && <><button onClick={() => updateStatus(r.id, "accepted")} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] text-xs"><Check className="w-3 h-3" /> Accept</button><button onClick={() => updateStatus(r.id, "rejected")} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-xs"><X className="w-3 h-3" /> Reject</button></>}
                  {r.status !== "pending" && <span className={`text-xs ${r.status === "accepted" ? "text-[#10B981]" : "text-[#EF4444]"}`}>{r.status}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
