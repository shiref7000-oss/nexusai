import { useState } from "react";
import { MessageSquare, Phone, CheckCircle, XCircle, Clock, TrendingUp, BarChart3, PhoneCall, PhoneMissed, AlertTriangle, Zap, Filter, ChevronDown } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { trpc } from "@/providers/trpc";

const statusData = [
  { name: "Confirmed", value: 78, color: "#10B981" },
  { name: "Cancelled", value: 14, color: "#EF4444" },
  { name: "No Answer", value: 8, color: "#F59E0B" },
];

export default function ConfirmationAgent() {
  const [filter, setFilter] = useState<string>("all");
  const { data: orderStats } = trpc.order.stats.useQuery();
  const { data: pipeline } = trpc.order.pipelineTrend.useQuery();
  const { data: orderList } = trpc.order.list.useQuery({ status: filter !== "all" ? filter : undefined, limit: 50 });

  const orders = orderList || [];
  const stats = orderStats || { todayTotal: 0, todayConfirmed: 0, todayCancelled: 0, todayNoAnswer: 0, todayRevenue: 0, pendingCalls: 0 };

  const kpiCards = [
    { label: "Pending Calls", value: `${stats.pendingCalls}`, change: "Needs confirmation", icon: PhoneCall, color: "#3B82F6" },
    { label: "Confirmed Today", value: `${stats.todayConfirmed}`, change: `${stats.todayTotal > 0 ? (stats.todayConfirmed / stats.todayTotal * 100).toFixed(0) : 0}% rate`, icon: CheckCircle, color: "#3B82F6" },
    { label: "Cancelled", value: `${stats.todayCancelled}`, change: `${stats.todayTotal > 0 ? (stats.todayCancelled / stats.todayTotal * 100).toFixed(0) : 0}% rate`, icon: XCircle, color: "#3B82F6" },
    { label: "Today's Revenue", value: `EGP ${stats.todayRevenue.toLocaleString()}`, change: "Live from DB", icon: TrendingUp, color: "#3B82F6" },
  ];

  const pipelineData = pipeline?.map((r: any) => ({
    day: r.day || "", total: Number(r.total || 0), confirmed: Number(r.confirmed || 0),
    cancelled: Number(r.cancelled || 0), noanswer: Number(r.noAnswer || 0),
  })) || [];

  const handleStatusChange = (id: number, status: string) => {
    // Would use trpc.order.updateStatus.useMutation() here
    console.log("Update order", id, status);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><MessageSquare className="w-6 h-6 text-blue-400" /> Order Confirmation</h1>
            <p className="text-sm text-[#8B95A8] mt-1">AI-powered order verification, customer confirmation calls, and status management</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0A1120] border border-[#1A2744] text-sm text-[#E8EDF5]">
              <option value="all">All Orders</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option><option value="no_answer">No Answer</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
              <div className="text-xs text-blue-400 mt-1">{kpi.change}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-400" />Confirmation Pipeline</h3>
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={pipelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                  <Bar dataKey="confirmed" name="Confirmed" stackId="a" fill="#10B981" /><Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#EF4444" />
                  <Bar dataKey="noanswer" name="No Answer" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-[#8B95A8] animate-pulse">Loading pipeline data...</div>}
          </div>

          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-400" />Status Distribution</h3>
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
        </div>

        <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
          <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Filter className="w-4 h-4 text-blue-400" />Orders Queue ({orders.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-[#1A2744]">
                <th className="text-left py-3 px-3 text-[#8B95A8] font-medium">Order</th>
                <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Items</th>
                <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Amount</th>
                <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Payment</th>
                <th className="text-center py-3 px-3 text-[#8B95A8] font-medium">Status</th>
                <th className="text-right py-3 px-3 text-[#8B95A8] font-medium">Actions</th>
              </tr></thead>
              <tbody>{orders.map((o: any) => (
                <tr key={o.id} className="border-b border-[#1A2744]/50 hover:bg-white/[0.02]">
                  <td className="py-3 px-3"><div><span className="text-[#E8EDF5] font-mono-data">{o.orderCode}</span></div></td>
                  <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">{o.itemCount}</td>
                  <td className="py-3 px-3 text-right text-[#E8EDF5] font-mono-data">EGP {Number(o.totalAmount).toLocaleString()}</td>
                  <td className="py-3 px-3 text-center"><span className="text-xs px-2 py-0.5 rounded bg-[#1A2744] text-[#8B95A8] uppercase">{o.paymentMethod}</span></td>
                  <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded font-medium ${o.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : o.status === "pending" ? "bg-blue-500/15 text-blue-400" : o.status === "cancelled" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"}`}>{o.status}</span></td>
                  <td className="py-3 px-3 text-right">
                    {o.status === "pending" && (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleStatusChange(o.id, "confirmed")} className="p-1.5 rounded bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"><CheckCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleStatusChange(o.id, "cancelled")} className="p-1.5 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25"><XCircle className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
