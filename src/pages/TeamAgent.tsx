import { useState } from "react";
import { Users, UserCheck, Clock, TrendingUp, BarChart3, Calendar, Briefcase, Award, AlertTriangle, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/providers/trpc";

const deptColors: Record<string, string> = { operations: "#6366F1", marketing: "#8B5CF6", sales: "#10B981", tech: "#22D3EE", finance: "#F59E0B", hr: "#F97316" };

export default function TeamAgent() {
  const [tab, setTab] = useState<"team" | "attendance" | "shifts">("team");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const { data: stats } = trpc.team.stats.useQuery();
  const { data: members } = trpc.team.list.useQuery({ department: deptFilter !== "all" ? deptFilter : undefined });

  const teamMembers = members || [];
  const s = stats || { total: 0, present: 0, onLeave: 0, avgPerformance: "0", avgAttendance: "0", byDepartment: [], byShift: [] };

  const kpiCards = [
    { label: "Total Team", value: `${s.total}`, change: "Active members", icon: Users, color: "#6366F1" },
    { label: "Present Today", value: `${s.present}`, change: "On duty", icon: UserCheck, color: "#6366F1" },
    { label: "Avg Performance", value: `${s.avgPerformance}`, change: "Out of 100", icon: TrendingUp, color: "#6366F1" },
    { label: "On Leave", value: `${s.onLeave}`, change: "Absent", icon: Calendar, color: "#6366F1" },
  ];

  const deptData = s.byDepartment?.map((d: any) => ({ name: d.department, count: Number(d.count), color: deptColors[d.department] || "#6366F1" })) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><Users className="w-6 h-6 text-indigo-400" /> HR & Team Agent</h1>
            <p className="text-sm text-[#8B95A8] mt-1">Team management, attendance tracking, shift scheduling, and performance analytics</p></div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["team", "attendance", "shifts"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-indigo-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "team" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-400" />Department Distribution</h3>
                <ResponsiveContainer width="100%" height={200}><PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" stroke="none">
                    {deptData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                </PieChart></ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {deptData.map((d: any) => <div key={d.name} className="flex items-center gap-1 text-xs"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-[#8B95A8] capitalize">{d.name}</span><span className="text-[#E8EDF5] font-medium">{d.count}</span></div>)}
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-[#E8EDF5] flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" />Team Members</h3>
                  <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#050A14] border border-[#1A2744] text-sm text-[#E8EDF5]">
                    <option value="all">All Departments</option><option value="operations">Operations</option><option value="marketing">Marketing</option>
                    <option value="sales">Sales</option><option value="tech">Tech</option><option value="finance">Finance</option><option value="hr">HR</option>
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-[#1A2744]">
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Name</th>
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Role</th>
                      <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Dept</th>
                      <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Status</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Perf</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Attendance</th>
                    </tr></thead>
                    <tbody>{teamMembers.map((m: any) => (
                      <tr key={m.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02]">
                        <td className="py-3 px-3"><div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1A2744] flex items-center justify-center text-xs font-medium text-[#E8EDF5]">{m.name?.split(" ").map((n: string) => n[0]).join("")}</div>
                          <span className="text-[#E8EDF5] font-medium">{m.name}</span>
                        </div></td>
                        <td className="py-3 px-3 text-[#E8EDF5]">{m.role}</td>
                        <td className="py-3 px-3 text-center"><span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#E8EDF5] capitalize">{m.department}</span></td>
                        <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded font-medium ${m.status === "active" ? "bg-emerald-500/15 text-emerald-400" : m.status === "on_leave" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>{m.status?.replace(/_/g, " ")}</span></td>
                        <td className="py-3 px-3 text-right"><span className={`font-mono-data font-medium ${m.performance >= 90 ? "text-emerald-400" : m.performance >= 85 ? "text-amber-400" : "text-red-400"}`}>{m.performance}</span></td>
                        <td className="py-3 px-3 text-right font-mono-data text-[#E8EDF5]">{m.attendance}%</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "attendance" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[{ label: "Attendance Rate", value: `${s.avgAttendance}%`, sub: "Team average", color: "text-amber-400" },
              { label: "Present", value: `${s.present}`, sub: "Active now", color: "text-emerald-400" },
              { label: "On Leave", value: `${s.onLeave}`, sub: "Unavailable", color: "text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <span className="text-sm text-[#8B95A8]">{stat.label}</span>
                <div className={`text-2xl font-bold font-mono-data mt-2 ${stat.color}`}>{stat.value}</div>
                <span className="text-xs text-[#8B95A8]">{stat.sub}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "shifts" && (
          <div className="space-y-4">
            {s.byShift?.map((shift: any) => (
              <div key={shift.shift} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-[#E8EDF5] capitalize">{shift.shift} Shift</h4>
                  <span className="text-xs text-[#8B95A8]">{shift.count} staff</span>
                </div>
                <div className="h-2 rounded-full bg-[#1A2744] overflow-hidden"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(shift.count * 10, 100)}%` }} /></div>
              </div>
            )) || <div className="text-sm text-[#8B95A8]">No shift data</div>}
          </div>
        )}
      </div>
    </div>
  );
}
