import { useState } from "react";
import { Headset, CheckCircle, XCircle, Shield, TrendingUp, TrendingDown, Send, Flag, Bot, MessageSquare, BarChart3, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const moderators = [
  { id: 1, name: "Amr Khaled", avatar: "AK", role: "Manager", status: "online", score: 92, responseTime: 2.1, confirmationRate: 82.5, todayOrders: 34, weeklyOrders: 156, rating: 4.8, trend: 3.2, color: "#10B981" },
  { id: 2, name: "Nada Hassan", avatar: "NH", role: "Team Lead", status: "online", score: 88, responseTime: 2.8, confirmationRate: 79.3, todayOrders: 28, weeklyOrders: 134, rating: 4.6, trend: 2.1, color: "#3B82F6" },
  { id: 3, name: "Omar Farouk", avatar: "OF", role: "Agent", status: "online", score: 87, responseTime: 3.1, confirmationRate: 78.2, todayOrders: 25, weeklyOrders: 120, rating: 4.5, trend: 2.3, color: "#F59E0B" },
  { id: 4, name: "Salma Ibrahim", avatar: "SI", role: "Agent", status: "online", score: 91, responseTime: 2.4, confirmationRate: 81.0, todayOrders: 31, weeklyOrders: 148, rating: 4.7, trend: 4.1, color: "#8B5CF6" },
  { id: 5, name: "Karim Mahmoud", avatar: "KM", role: "Agent", status: "away", score: 78, responseTime: 4.5, confirmationRate: 71.5, todayOrders: 19, weeklyOrders: 95, rating: 4.2, trend: -1.2, color: "#22D3EE" },
  { id: 6, name: "Yasmin Ali", avatar: "YA", role: "Agent", status: "online", score: 85, responseTime: 3.5, confirmationRate: 76.8, todayOrders: 22, weeklyOrders: 112, rating: 4.4, trend: 1.8, color: "#F97316" },
  { id: 7, name: "Mostafa Sayed", avatar: "MS", role: "Agent", status: "offline", score: 72, responseTime: 5.2, confirmationRate: 68.4, todayOrders: 15, weeklyOrders: 76, rating: 4.0, trend: -2.5, color: "#EF4444" },
  { id: 8, name: "Hana Mohamed", avatar: "HM", role: "Agent", status: "online", score: 90, responseTime: 2.6, confirmationRate: 80.1, todayOrders: 29, weeklyOrders: 140, rating: 4.7, trend: 3.5, color: "#10B981" },
];

const hourlyActivity = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, confirmed: Math.floor(5 + Math.sin(i * 0.3) * 8 + Math.random() * 5), rejected: Math.floor(1 + Math.sin(i * 0.4) * 3 + Math.random() * 2), pending: Math.floor(2 + Math.cos(i * 0.5) * 4 + Math.random() * 3) }));
const confirmationTrend = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, rate: 70 + Math.sin(i * 0.2) * 5 + Math.random() * 3, target: 75 }));
const responseDist = [{ range: "0-1 min", count: 145 }, { range: "1-2 min", count: 234 }, { range: "2-3 min", count: 189 }, { range: "3-4 min", count: 98 }, { range: "4-5 min", count: 45 }, { range: "5+ min", count: 23 }];
const fakeLog = [
  { id: 1, order: "ORD-0042", customer: "Unknown - Port Said", risk: 96, method: "Phone Pattern", time: "2 min ago" },
  { id: 2, order: "ORD-0089", customer: "Fake Address - Asyut", risk: 88, method: "Address Validation", time: "5 min ago" },
  { id: 3, order: "ORD-0123", customer: "Repeated Cancels", risk: 82, method: "History Pattern", time: "12 min ago" },
  { id: 4, order: "ORD-0156", customer: "Invalid Phone", risk: 91, method: "Phone Pattern", time: "18 min ago" },
  { id: 5, order: "ORD-0198", customer: "Bot Pattern - Cairo", risk: 78, method: "Behavioral", time: "25 min ago" },
];

function MiniGauge({ score }: { score: number }) {
  const r = 20, circ = 2 * Math.PI * r, off = circ - (score / 100) * circ;
  const c = score >= 85 ? "#10B981" : score >= 70 ? "#F59E0B" : "#EF4444";
  return <svg width="44" height="44" className="-rotate-90"><circle cx="22" cy="22" r={r} fill="none" stroke="#1A2744" strokeWidth="4" /><circle cx="22" cy="22" r={r} fill="none" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} /></svg>;
}

export default function ModeratorAgent() {
  const [tab, setTab] = useState<"dashboard" | "orders" | "analytics" | "detection">("dashboard");
  const [selectedMod, setSelectedMod] = useState<number | null>(null);
  const mod = moderators.find((m) => m.id === selectedMod);
  const onlineCount = moderators.filter((m) => m.status === "online").length;

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#3B82F6]/15 flex items-center justify-center"><Headset className="w-5 h-5 text-[#3B82F6]" /></div>
          <div><h2 className="text-xl font-bold text-[#E8EDF5]">Moderator & Customer Service</h2><p className="text-sm text-[#8B95A8]">AI-Powered Order Confirmation & Moderation</p></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1120] border border-[#1A2744]">
          <div className="w-2 h-2 rounded-full bg-[#10B981] live-pulse" />
          <span className="text-xs text-[#8B95A8]">{onlineCount}/{moderators.length} Online</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ l: "Avg Response Time", v: "3.2 min", c: "-0.4m", i: Headset, cl: "#22D3EE", p: true }, { l: "Confirmation Rate", v: "76.8%", c: "+2.1%", i: CheckCircle, cl: "#10B981", p: true }, { l: "Orders Today", v: "193", c: "+23", i: TrendingUp, cl: "#3B82F6", p: true }, { l: "Fake Blocked", v: "42", c: "-8", i: Shield, cl: "#EF4444", p: true }].map((k) => (
          <div key={k.l} className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow hover:card-glow-hover transition-all hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${k.cl}15` }}><k.i className="w-5 h-5" style={{ color: k.cl }} /></div>
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${k.p ? "text-[#10B981] bg-[#10B981]/10" : "text-[#EF4444] bg-[#EF4444]/10"}`}>
                {k.c.startsWith("+") ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{k.c}
              </span>
            </div>
            <p className="text-xs text-[#8B95A8] uppercase tracking-wider font-medium mb-1">{k.l}</p>
            <p className="text-xl font-bold text-[#E8EDF5] font-mono-data">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 bg-[#0A1120] rounded-lg border border-[#1A2744] w-fit">
        {[{ k: "dashboard", l: "Dashboard", i: Headset }, { k: "orders", l: "Orders", i: MessageSquare }, { k: "analytics", l: "Analytics", i: BarChart3 }, { k: "detection", l: "Fake Detection", i: Shield }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t.k ? "bg-[#3B82F6]/10 text-[#3B82F6]" : "text-[#8B95A8] hover:text-[#E8EDF5]"}`}><t.i className="w-4 h-4" /><span className="hidden sm:inline">{t.l}</span></button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {moderators.map((m) => (
              <div key={m.id} onClick={() => setSelectedMod(selectedMod === m.id ? null : m.id)} className={`bg-[#0A1120] rounded-xl p-5 border cursor-pointer transition-all hover:-translate-y-0.5 ${selectedMod === m.id ? "border-[#3B82F6]/50 card-glow-hover" : "border-[#1A2744] card-glow hover:card-glow-hover"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#050A14]" style={{ backgroundColor: m.color }}>{m.avatar}</div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0A1120]" style={{ backgroundColor: m.status === "online" ? "#10B981" : m.status === "away" ? "#F59E0B" : "#5A6680" }} />
                    </div>
                    <div><h4 className="text-sm font-semibold text-[#E8EDF5]">{m.name}</h4><p className="text-xs text-[#8B95A8]">{m.role}</p></div>
                  </div>
                  <MiniGauge score={m.score} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#0F1829]"><p className="text-xs text-[#8B95A8]">Response</p><p className="text-sm font-bold text-[#22D3EE] font-mono-data">{m.responseTime}m</p></div>
                  <div className="p-2 rounded-lg bg-[#0F1829]"><p className="text-xs text-[#8B95A8]">Confirm</p><p className="text-sm font-bold text-[#10B981] font-mono-data">{m.confirmationRate}%</p></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1A2744]"><span className="text-xs text-[#8B95A8]">Today: {m.todayOrders}</span><span className={`flex items-center gap-1 text-xs ${m.trend >= 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>{m.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{m.trend}%</span></div>
              </div>
            ))}
          </div>

          {mod && (
            <div className="bg-[#0A1120] rounded-xl p-5 border border-[#3B82F6]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-[#050A14]" style={{ backgroundColor: mod.color }}>{mod.avatar}</div><div><h3 className="text-lg font-bold text-[#E8EDF5]">{mod.name}</h3><p className="text-sm text-[#8B95A8]">{mod.role} | Score: {mod.score}/100</p></div></div>
                <button onClick={() => setSelectedMod(null)} className="text-xs text-[#8B95A8] hover:text-[#E8EDF5]">Close</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[{ l: "Response Time", v: `${mod.responseTime}m`, cl: "text-[#22D3EE]" }, { l: "Confirmation Rate", v: `${mod.confirmationRate}%`, cl: "text-[#10B981]" }, { l: "Weekly Orders", v: `${mod.weeklyOrders}`, cl: "text-[#3B82F6]" }, { l: "Customer Rating", v: `${mod.rating}/5`, cl: "text-[#F59E0B]" }].map((s) => (
                  <div key={s.l} className="p-3 rounded-lg bg-[#0F1829]"><p className="text-xs text-[#8B95A8]">{s.l}</p><p className={`text-lg font-bold ${s.cl} font-mono-data`}>{s.v}</p></div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-6">
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Confirmation Pipeline</h3>
            <div className="flex flex-wrap items-center gap-2">
              {[{ s: "New", c: 45, cl: "#22D3EE" }, { s: "WhatsApp", c: 38, cl: "#3B82F6" }, { s: "Responded", c: 31, cl: "#F59E0B" }, { s: "Confirmed", c: 25, cl: "#10B981" }, { s: "Voice Conf", c: 22, cl: "#8B5CF6" }, { s: "Shipped", c: 20, cl: "#22D3EE" }, { s: "Delivered", c: 18, cl: "#10B981" }].map((s, i, arr) => (
                <div key={s.s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="px-3 py-2 rounded-lg text-center min-w-[80px]" style={{ backgroundColor: `${s.cl}15`, border: `1px solid ${s.cl}30` }}><p className="text-lg font-bold font-mono-data" style={{ color: s.cl }}>{s.c}</p><p className="text-xs text-[#8B95A8]">{s.s}</p></div>
                  </div>
                  {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-[#1A2744]" />}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ l: "Bulk WhatsApp", d: "Send to 45 pending", i: Send, cl: "#10B981" }, { l: "Voice Confirm", d: "AI voice for 12 orders", i: Headset, cl: "#8B5CF6" }, { l: "Review Fakes", d: "5 orders need review", i: Flag, cl: "#EF4444" }].map((a) => (
              <button key={a.l} className="flex items-center gap-3 p-4 rounded-xl bg-[#0A1120] border border-[#1A2744] hover:border-[#22D3EE]/30 transition-all">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${a.cl}15` }}><a.i className="w-5 h-5" style={{ color: a.cl }} /></div>
                <div className="text-left"><h4 className="text-sm font-semibold text-[#E8EDF5]">{a.l}</h4><p className="text-xs text-[#8B95A8]">{a.d}</p></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">24-Hour Confirmation Activity</h3>
              <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={hourlyActivity}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="hour" tick={{ fill: "#8B95A8", fontSize: 9 }} stroke="#1A2744" /><YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="confirmed" fill="#10B981" name="Confirmed" radius={[2, 2, 0, 0]} /><Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[2, 2, 0, 0]} /><Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer></div>
            </div>
            <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">30-Day Confirmation Rate</h3>
              <div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={confirmationTrend}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis domain={[60, 90]} tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2} fill="url(#cg)" name="Confirm Rate %" /></AreaChart></ResponsiveContainer></div>
            </div>
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Response Time Distribution</h3>
            <div className="h-[200px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={responseDist}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="range" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Bar dataKey="count" fill="#3B82F6" name="Orders" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
        </div>
      )}

      {tab === "detection" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ l: "Detection Accuracy", v: "96.2%", cl: "text-[#10B981]", i: Shield }, { l: "Flagged Today", v: "42", cl: "text-[#F59E0B]", i: Flag }, { l: "Auto-Blocked", v: "38", cl: "text-[#22D3EE]", i: Bot }].map((k) => (
              <div key={k.l} className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]"><div className="flex items-center gap-2 mb-2"><k.i className={`w-5 h-5 ${k.cl}`} /><span className="text-xs text-[#8B95A8]">{k.l}</span></div><p className={`text-2xl font-bold ${k.cl} font-mono-data`}>{k.v}</p></div>
            ))}
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center gap-2 mb-4"><Bot className="w-5 h-5 text-[#EF4444]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">AI Fake Order Detection Log</h3></div>
            <div className="space-y-3">
              {fakeLog.map((f) => (
                <div key={f.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#0F1829] border border-[#1A2744]">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${f.risk >= 90 ? "bg-[#EF4444]/15" : "bg-[#F59E0B]/15"}`}><span className={`text-sm font-bold font-mono-data ${f.risk >= 90 ? "text-[#EF4444]" : "text-[#F59E0B]"}`}>{f.risk}</span></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-semibold text-[#E8EDF5]">{f.order}</span><span className="text-xs px-2 py-0.5 rounded-full bg-[#EF4444]/10 text-[#EF4444]">{f.method}</span></div><p className="text-xs text-[#8B95A8] mt-0.5">{f.customer}</p></div>
                  <span className="text-xs text-[#8B95A8] flex-shrink-0">{f.time}</span>
                  <div className="flex gap-1 flex-shrink-0"><button className="p-1.5 rounded-lg bg-[#EF4444]/10 text-[#EF4444]"><XCircle className="w-4 h-4" /></button><button className="p-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981]"><CheckCircle className="w-4 h-4" /></button></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
