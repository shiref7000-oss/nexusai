import { useState } from "react";
import { ShieldCheck, MessageSquare, CheckCircle, XCircle, BarChart3, TrendingUp, Phone, PhoneMissed, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/providers/trpc";

export default function ModeratorAgent() {
  const [tab, setTab] = useState<"dashboard" | "orders" | "analytics">("dashboard");
  const { data: orderStats } = trpc.order.stats.useQuery();
  const { data: pipeline } = trpc.order.pipelineTrend.useQuery();
  const { data: alerts } = trpc.dashboard.alerts.useQuery();
  const { data: activities } = trpc.dashboard.activityStream.useQuery();

  const stats = orderStats || { todayTotal: 0, todayConfirmed: 0, todayCancelled: 0, todayNoAnswer: 0, todayRevenue: 0, pendingCalls: 0 };
  const confRate = stats.todayTotal > 0 ? (stats.todayConfirmed / stats.todayTotal * 100).toFixed(0) : 0;

  const kpiCards = [
    { label: "Pending Confirmations", value: `${stats.pendingCalls}`, icon: Phone, color: "#F59E0B", detail: "Need calling" },
    { label: "Confirmed", value: `${stats.todayConfirmed}`, icon: CheckCircle, color: "#10B981", detail: `${confRate}% rate` },
    { label: "Cancelled", value: `${stats.todayCancelled}`, icon: XCircle, color: "#EF4444", detail: "Rejected" },
    { label: "No Answer", value: `${stats.todayNoAnswer}`, icon: PhoneMissed, color: "#F59E0B", detail: "Retry needed" },
  ];

  const pipelineData = pipeline?.map((r: any) => ({
    day: r.day || "", confirmed: Number(r.confirmed || 0), cancelled: Number(r.cancelled || 0), noanswer: Number(r.noAnswer || 0),
  })) || [];

  const statusData = [
    { name: "Confirmed", value: Number(confRate), color: "#10B981" },
    { name: "Cancelled", value: stats.todayTotal > 0 ? Math.round(stats.todayCancelled / stats.todayTotal * 100) : 0, color: "#EF4444" },
    { name: "No Answer", value: stats.todayTotal > 0 ? Math.round(stats.todayNoAnswer / stats.todayTotal * 100) : 0, color: "#F59E0B" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><ShieldCheck className="w-6 h-6 text-amber-400" /> Moderator</h1>
            <p className="text-sm text-[#8B95A8] mt-1">Order confirmation pipeline, customer verification, and fake order detection</p></div>
          <div className="flex gap-2">
            {(["dashboard", "orders", "analytics"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs mt-1" style={{ color: kpi.color }}>{kpi.detail}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-amber-400" />Confirmation Pipeline</h3>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Bar dataKey="confirmed" name="Confirmed" fill="#10B981" /><Bar dataKey="cancelled" name="Cancelled" fill="#EF4444" /><Bar dataKey="noanswer" name="No Answer" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-[#8B95A8] animate-pulse">Loading...</div>}
          </div>

          <div className="space-y-4">
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-amber-400" />Status Distribution</h3>
              <ResponsiveContainer width="100%" height={160}><PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                  {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
              </PieChart></ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center">
                {statusData.map((s) => <div key={s.name} className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-[#8B95A8]">{s.name}</span><span className="text-[#E8EDF5] font-medium">{s.value}%</span></div>)}
              </div>
            </div>

            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Alerts</h3>
              <div className="space-y-2">
                {(alerts || []).slice(0, 5).map((a: any) => (
                  <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#050A14]">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div><p className="text-xs text-[#E8EDF5]">{a.title}</p><span className="text-[10px] text-[#8B95A8]">{a.impact}</span></div>
                  </div>
                )) || <div className="text-xs text-[#8B95A8]">No alerts</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
