import { useState } from "react";
import { MessageSquare, Phone, CheckCircle, XCircle, Clock, TrendingUp, BarChart3, PhoneCall, PhoneMissed, AlertTriangle, Zap, Filter, ChevronDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const confirmationTrend = [
  { day: "Mon", total: 120, confirmed: 98, cancelled: 12, noanswer: 10 },
  { day: "Tue", total: 145, confirmed: 115, cancelled: 18, noanswer: 12 },
  { day: "Wed", total: 132, confirmed: 108, cancelled: 14, noanswer: 10 },
  { day: "Thu", total: 168, confirmed: 132, cancelled: 22, noanswer: 14 },
  { day: "Fri", total: 190, confirmed: 152, cancelled: 25, noanswer: 13 },
  { day: "Sat", total: 155, confirmed: 125, cancelled: 18, noanswer: 12 },
  { day: "Sun", total: 112, confirmed: 92, cancelled: 12, noanswer: 8 },
];

const responseTimeData = [
  { hour: "9AM", avgTime: 45 },
  { hour: "10AM", avgTime: 52 },
  { hour: "11AM", avgTime: 48 },
  { hour: "12PM", avgTime: 65 },
  { hour: "1PM", avgTime: 58 },
  { hour: "2PM", avgTime: 42 },
  { hour: "3PM", avgTime: 38 },
  { hour: "4PM", avgTime: 44 },
  { hour: "5PM", avgTime: 50 },
  { hour: "6PM", avgTime: 55 },
];

const statusData = [
  { name: "Confirmed", value: 78, color: "#10B981" },
  { name: "Cancelled", value: 14, color: "#EF4444" },
  { name: "No Answer", value: 8, color: "#F59E0B" },
];

const orders = [
  { id: "ORD-2401", customer: "Ahmed Hassan", phone: "+20 10x xxx xxxx", governorate: "Cairo", items: 3, amount: 2850, status: "confirmed", agent: "AI Bot", time: "2 min ago" },
  { id: "ORD-2402", customer: "Sara Mohamed", phone: "+20 11x xxx xxxx", governorate: "Giza", items: 1, amount: 1200, status: "pending", agent: "-", time: "5 min ago" },
  { id: "ORD-2403", customer: "Mahmoud Ali", phone: "+20 12x xxx xxxx", governorate: "Alexandria", items: 2, amount: 3400, status: "confirmed", agent: "AI Bot", time: "8 min ago" },
  { id: "ORD-2404", customer: "Nour Ibrahim", phone: "+20 10x xxx xxxx", governorate: "Cairo", items: 1, amount: 890, status: "cancelled", agent: "AI Bot", time: "12 min ago" },
  { id: "ORD-2405", customer: "Omar Khaled", phone: "+20 11x xxx xxxx", governorate: "Qalyubia", items: 4, amount: 5600, status: "noanswer", agent: "-", time: "15 min ago" },
  { id: "ORD-2406", customer: "Laila Ahmad", phone: "+20 12x xxx xxxx", governorate: "Giza", items: 2, amount: 2100, status: "confirmed", agent: "AI Bot", time: "18 min ago" },
  { id: "ORD-2407", customer: "Youssef Samir", phone: "+20 10x xxx xxxx", governorate: "Cairo", items: 1, amount: 750, status: "pending", agent: "-", time: "22 min ago" },
  { id: "ORD-2408", customer: "Fatima Hassan", phone: "+20 11x xxx xxxx", governorate: "Sharqia", items: 3, amount: 4200, status: "confirmed", agent: "AI Bot", time: "25 min ago" },
];

const kpiCards = [
  { label: "Pending Calls", value: "12", change: "5 urgent", icon: PhoneCall, color: "#3B82F6" },
  { label: "Confirmed Today", value: "814", change: "78.2% rate", icon: CheckCircle, color: "#3B82F6" },
  { label: "Cancelled", value: "103", change: "9.9% rate", icon: XCircle, color: "#3B82F6" },
  { label: "Avg Response", value: "48s", change: "-12s improvement", icon: Clock, color: "#3B82F6" },
];

const alerts = [
  { id: 1, message: "Order ORD-2412: Customer requested callback", type: "callback", time: "2 min ago" },
  { id: 2, message: "3 orders from Alexandria need manual review", type: "review", time: "5 min ago" },
  { id: 3, message: "High-value order ORD-2409 (EGP 8,500) confirmed", type: "success", time: "8 min ago" },
];

export default function ConfirmationAgent() {
  const [filter, setFilter] = useState<string>("all");
  const [orderList, setOrderList] = useState(orders);

  const handleStatusChange = (id: string, newStatus: string) => {
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const filteredOrders = filter === "all" ? orderList : orderList.filter(o => o.status === filter);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-400" />
              Order Confirmation
            </h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered order verification, customer confirmation calls, and status management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[#0A1120] border border-[#1A2744] text-sm text-[#E8EDF5] focus:outline-none focus:border-blue-500/50">
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="noanswer">No Answer</option>
              </select>
              <ChevronDown className="w-4 h-4 text-[#8B95A8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
              <Zap className="w-4 h-4" /> Bulk Confirm
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
              <div className="text-xs text-blue-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        {/* Confirmation Trend + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Confirmation Pipeline (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={confirmationTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" />
                <XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#EF4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="noanswer" name="No Answer" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[#8B95A8]">{s.name}</span>
                    <span className="text-[#E8EDF5] font-medium">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Alerts
              </h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="flex items-start gap-2 p-2 rounded-lg bg-[#050A14]">
                    {a.type === "callback" ? <PhoneCall className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> : a.type === "review" ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-xs text-[#E8EDF5]">{a.message}</p>
                      <span className="text-[10px] text-[#8B95A8]">{a.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
          <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            Orders Queue
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1A2744]">
                  <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Order ID</th>
                  <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Customer</th>
                  <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Governorate</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Items</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Amount</th>
                  <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Status</th>
                  <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Agent</th>
                  <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-[#E8EDF5] font-mono-data">{o.id}</td>
                    <td className="py-3 px-3">
                      <div>
                        <div className="text-[#E8EDF5]">{o.customer}</div>
                        <div className="text-xs text-[#8B95A8]">{o.phone}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#E8EDF5]">{o.governorate}</td>
                    <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{o.items}</td>
                    <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{o.amount.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${o.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : o.status === "pending" ? "bg-blue-500/15 text-blue-400" : o.status === "cancelled" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs text-[#8B95A8]">{o.agent}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-1 justify-end">
                        {o.status === "pending" && (
                          <>
                            <button onClick={() => handleStatusChange(o.id, "confirmed")} className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleStatusChange(o.id, "cancelled")} className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {o.status === "noanswer" && (
                          <button className="px-2 py-1 rounded bg-blue-500/15 text-blue-400 text-xs hover:bg-blue-500/25 transition-colors">
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
