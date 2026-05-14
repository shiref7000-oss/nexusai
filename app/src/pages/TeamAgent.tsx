import { useState } from "react";
import { Users, UserCheck, Clock, TrendingUp, BarChart3, Calendar, Briefcase, Award, AlertTriangle, ChevronDown, Zap, Plus, Mail, Phone } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const attendanceTrend = [
  { day: "Mon", present: 42, absent: 3, late: 2, wfh: 8 },
  { day: "Tue", present: 43, absent: 2, late: 1, wfh: 9 },
  { day: "Wed", present: 40, absent: 4, late: 3, wfh: 8 },
  { day: "Thu", present: 44, absent: 2, late: 1, wfh: 8 },
  { day: "Fri", present: 38, absent: 5, late: 2, wfh: 10 },
  { day: "Sat", present: 15, absent: 1, late: 0, wfh: 4 },
  { day: "Sun", present: 12, absent: 2, late: 0, wfh: 3 },
];

const deptData = [
  { name: "Operations", count: 18, color: "#6366F1" },
  { name: "Marketing", count: 12, color: "#8B5CF6" },
  { name: "Sales", count: 10, color: "#10B981" },
  { name: "Tech", count: 8, color: "#22D3EE" },
  { name: "Finance", count: 5, color: "#F59E0B" },
  { name: "HR", count: 3, color: "#F97316" },
];

const performanceData = [
  { month: "Jan", score: 78 },
  { month: "Feb", score: 80 },
  { month: "Mar", score: 82 },
  { month: "Apr", score: 85 },
  { month: "May", score: 83 },
  { month: "Jun", score: 88 },
];

const teamMembers = [
  { id: 1, name: "Omar Hassan", role: "Operations Manager", dept: "Operations", status: "active", performance: 92, attendance: 98, joinDate: "2022-03-15" },
  { id: 2, name: "Nour Ahmed", role: "Marketing Lead", dept: "Marketing", status: "active", performance: 88, attendance: 95, joinDate: "2022-06-01" },
  { id: 3, name: "Khaled Samir", role: "Senior Developer", dept: "Tech", status: "active", performance: 95, attendance: 92, joinDate: "2021-11-20" },
  { id: 4, name: "Sara Mahmoud", role: "Sales Supervisor", dept: "Sales", status: "on_leave", performance: 82, attendance: 88, joinDate: "2023-01-10" },
  { id: 5, name: "Ahmed Youssef", role: "Finance Analyst", dept: "Finance", status: "active", performance: 90, attendance: 96, joinDate: "2022-09-05" },
  { id: 6, name: "Mariam Khaled", role: "HR Specialist", dept: "HR", status: "active", performance: 87, attendance: 94, joinDate: "2023-03-12" },
  { id: 7, name: "Hassan Ibrahim", role: "Logistics Coordinator", dept: "Operations", status: "active", performance: 85, attendance: 90, joinDate: "2023-06-20" },
  { id: 8, name: "Laila Omar", role: "Creative Designer", dept: "Marketing", status: "active", performance: 91, attendance: 97, joinDate: "2022-12-01" },
];

const shifts = [
  { id: 1, name: "Morning Shift", time: "8:00 AM - 4:00 PM", staff: 24, coverage: 92 },
  { id: 2, name: "Evening Shift", time: "4:00 PM - 12:00 AM", staff: 18, coverage: 85 },
  { id: 3, name: "Night Shift", time: "12:00 AM - 8:00 AM", staff: 6, coverage: 78 },
];

const alerts = [
  { id: 1, message: "Sara Mahmoud (Sales) requested leave approval", type: "leave", time: "1h ago" },
  { id: 2, message: "Night shift coverage below 80% - recommend scheduling", type: "coverage", time: "2h ago" },
  { id: 3, message: "Khaled Samir performance review due next week", type: "review", time: "3h ago" },
];

const kpiCards = [
  { label: "Total Team", value: "56", change: "+4 this quarter", icon: Users, color: "#6366F1" },
  { label: "Present Today", value: "48", change: "85.7% attendance", icon: UserCheck, color: "#6366F1" },
  { label: "Avg Performance", value: "88.2", change: "+3.5 this month", icon: TrendingUp, color: "#6366F1" },
  { label: "On Leave", value: "3", change: "5.4% of team", icon: Calendar, color: "#6366F1" },
];

export default function TeamAgent() {
  const [tab, setTab] = useState<"team" | "attendance" | "shifts">("team");
  const [deptFilter, setDeptFilter] = useState<string>("all");

  const filteredMembers = deptFilter === "all" ? teamMembers : teamMembers.filter(m => m.dept === deptFilter);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              HR & Team Agent
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">Team management, attendance tracking, shift scheduling, and performance analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {(["team", "attendance", "shifts"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>
                  {t}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors">
              <Plus className="w-4 h-4" /> Add Member
            </button>
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
              <div className="text-xs text-indigo-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {tab === "team" && (
          <>
            {/* Dept Distribution + Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" />
                  Department Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={deptData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count" stroke="none">
                      {deptData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 justify-center">
                  {deptData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[#8B95A8]">{d.name}</span>
                      <span className="text-[#E8EDF5] font-medium">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Team Performance Trend
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="tmPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                    <XAxis dataKey="month" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <YAxis domain={[70, 95]} tick={{ fill: "#8B95A8", fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                    <Area type="monotone" dataKey="score" name="Avg Score" stroke="#6366F1" strokeWidth={2} fill="url(#tmPerf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow mb-6">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                HR Alerts
              </h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 p-3 rounded-lg bg-[#050A14] border border-[#1A2744]">
                    {a.type === "leave" ? <Calendar className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> : a.type === "coverage" ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> : <Award className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm text-[#E8EDF5]">{a.message}</p>
                      <span className="text-xs text-[#8B95A8]">{a.time}</span>
                    </div>
                    <button className="px-3 py-1 rounded bg-indigo-500/15 text-indigo-400 text-xs hover:bg-indigo-500/25 transition-colors">
                      Action
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members Table */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-[#E8EDF5] flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Team Members
                </h3>
                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#050A14] border border-[#1A2744] text-sm text-[#E8EDF5] focus:outline-none focus:border-indigo-500/50">
                  <option value="all">All Departments</option>
                  {deptData.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1A2744]">
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Name</th>
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Role</th>
                      <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Department</th>
                      <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Status</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Performance</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Attendance</th>
                      <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1A2744] flex items-center justify-center text-xs font-medium text-[#E8EDF5]">
                              {m.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-[#E8EDF5] font-medium">{m.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#E8EDF5]">{m.role}</td>
                        <td className="py-3 px-3">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#E8EDF5]">{m.dept}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${m.status === "active" ? "bg-emerald-500/15 text-emerald-400" : m.status === "on_leave" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                            {m.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`font-mono-data font-medium ${m.performance >= 90 ? "text-emerald-400" : m.performance >= 85 ? "text-amber-400" : "text-red-400"}`}>{m.performance}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono-data text-[#E8EDF5]">{m.attendance}%</span>
                        </td>
                        <td className="py-3 px-3 text-right text-xs text-[#8B95A8]">{m.joinDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "attendance" && (
          <>
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow mb-6">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Weekly Attendance Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                  <XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Bar dataKey="present" name="Present" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="wfh" name="Work From Home" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="late" name="Late" stackId="a" fill="#F59E0B" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                {[
                  { label: "Present", color: "#10B981" },
                  { label: "Work From Home", color: "#3B82F6" },
                  { label: "Late", color: "#F59E0B" },
                  { label: "Absent", color: "#EF4444" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                    <span className="text-[#8B95A8]">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Attendance Rate", value: "91.2%", sub: "Target: 95%", color: "text-amber-400" },
                { label: "Late Arrivals", value: "8", sub: "This week", color: "text-red-400" },
                { label: "WFH Days", value: "50", sub: "This week", color: "text-blue-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                  <span className="text-sm text-[#8B95A8]">{stat.label}</span>
                  <div className={`text-2xl font-bold font-mono-data mt-2 ${stat.color}`}>{stat.value}</div>
                  <span className="text-xs text-[#8B95A8]">{stat.sub}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "shifts" && (
          <div className="space-y-4">
            {shifts.map((s) => (
              <div key={s.id} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A2744] flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#E8EDF5]">{s.name}</h4>
                      <p className="text-xs text-[#8B95A8]">{s.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-lg font-medium ${s.coverage >= 90 ? "bg-emerald-500/15 text-emerald-400" : s.coverage >= 80 ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"}`}>
                    {s.coverage}% coverage
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#050A14]">
                    <span className="text-xs text-[#8B95A8]">Staff Assigned</span>
                    <div className="text-lg font-semibold text-[#E8EDF5] font-mono-data mt-1">{s.staff}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#050A14]">
                    <span className="text-xs text-[#8B95A8]">Coverage</span>
                    <div className="text-lg font-semibold text-[#E8EDF5] font-mono-data mt-1">{s.coverage}%</div>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-[#1A2744] overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${s.coverage}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
