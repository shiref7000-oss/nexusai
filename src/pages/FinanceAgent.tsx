import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText, Receipt, Truck, ArrowDownRight, ArrowUpRight, BarChart3, Download, Coins, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { trpc } from "@/providers/trpc";

const COLORS = ["#22D3EE", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#3B82F6", "#F97316"];

const expenseColors: Record<string, string> = { COGS: "#22D3EE", "Ad Spend": "#EF4444", Shipping: "#10B981", Returns: "#F59E0B", "COD Fees": "#8B5CF6", "Taxes (14%)": "#3B82F6", Gateway: "#F97316", Other: "#6366F1" };

export default function FinanceAgent() {
  const [tab, setTab] = useState<"overview" | "cod" | "delivery" | "reports">("overview");
  const { data: summary } = trpc.finance.summary.useQuery();
  const { data: trend } = trpc.finance.trend.useQuery();
  const { data: govData } = trpc.finance.byGovernorate.useQuery();

  const s = summary || { totalRevenue: 0, adSpend: 0, productCost: 0, shippingCost: 0, vatCollected: 0, refunds: 0, grossProfit: 0, netProfit: 0, profitMargin: "0" };

  const trendData = trend?.map((r: any) => ({ date: r.date?.slice(5) || "", revenue: Number(r.revenue || 0), adSpend: Number(r.adSpend || 0), shipping: Number(r.shipping || 0), profit: Number(r.profit || 0) })) || [];

  const expenseBreakdown = [
    { name: "COGS", value: s.productCost }, { name: "Ad Spend", value: Math.abs(s.adSpend) },
    { name: "Shipping", value: Math.abs(s.shippingCost) }, { name: "Returns", value: Math.abs(s.refunds) },
    { name: "Taxes (14%)", value: Math.abs(s.vatCollected) },
  ].filter(e => e.value > 0);

  const codGovData = govData?.map((g: any) => ({ gov: g.governorate, cod: Number(g.revenue || 0) })) || [];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-bold text-[#E8EDF5] flex items-center gap-3"><Wallet className="w-6 h-6 text-red-400" /> Finance</h1>
            <p className="text-sm text-[#8B95A8] mt-1">Complete P&L, COD tracking, delivery cost analytics, and financial reporting</p></div>
          <div className="flex gap-2">
            {(["overview", "cod", "delivery", "reports"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-red-500/15 text-red-400 border border-red-500/30" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04] border border-transparent"}`}>{t === "cod" ? "COD" : t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Revenue", value: `EGP ${s.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "#10B981" },
            { label: "Net Profit", value: `EGP ${s.netProfit.toLocaleString()}`, icon: Wallet, color: s.netProfit >= 0 ? "#10B981" : "#EF4444" },
            { label: "Profit Margin", value: `${s.profitMargin}%`, icon: Percent, color: parseFloat(s.profitMargin) >= 20 ? "#10B981" : "#F59E0B" },
            { label: "Ad Spend", value: `EGP ${Math.abs(s.adSpend).toLocaleString()}`, icon: TrendingDown, color: "#EF4444" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-[#8B95A8]">{kpi.label}</span><kpi.icon className="w-5 h-5" style={{ color: kpi.color }} /></div>
              <div className="text-2xl font-bold text-[#E8EDF5] font-mono-data">{kpi.value}</div>
            </div>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow mb-6">
              <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-red-400" />P&L Statement (This Month)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  {[{ l: "Revenue", v: s.totalRevenue, c: "text-[#E8EDF5]" }, { l: "Product Cost (COGS)", v: -s.productCost, c: "text-red-400" }, { l: "Shipping & Delivery", v: -Math.abs(s.shippingCost), c: "text-red-400" }, { l: "Ad Spend", v: -Math.abs(s.adSpend), c: "text-red-400" }, { l: "VAT (14%)", v: -Math.abs(s.vatCollected), c: "text-amber-400" }, { l: "Refunds", v: -Math.abs(s.refunds), c: "text-red-400" }].map((row) => (
                    <div key={row.l} className="flex justify-between py-2 border-b border-[#1A2744]/50"><span className="text-sm text-[#8B95A8]">{row.l}</span><span className={`text-sm font-mono-data font-medium ${row.c}`}>EGP {Math.abs(row.v).toLocaleString()}</span></div>
                  ))}
                </div>
                <div className="flex flex-col justify-center gap-3">
                  <div className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]"><span className="text-xs text-[#8B95A8]">Gross Profit</span><div className={`text-xl font-bold font-mono-data ${s.grossProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>EGP {s.grossProfit.toLocaleString()}</div></div>
                  <div className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]"><span className="text-xs text-[#8B95A8]">Net Profit</span><div className={`text-xl font-bold font-mono-data ${s.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>EGP {s.netProfit.toLocaleString()}</div></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-red-400" />Revenue vs Expenses</h3>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="date" tick={{ fill: "#8B95A8", fontSize: 11 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="adSpend" name="Ad Spend" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <div className="text-sm text-[#8B95A8] animate-pulse">Loading trend data...</div>}
              </div>

              <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
                <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Receipt className="w-4 h-4 text-red-400" />Expense Breakdown</h3>
                {expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}><PieChart>
                    <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                      {expenseBreakdown.map((e, i) => <Cell key={i} fill={expenseColors[e.name] || COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `EGP ${v.toLocaleString()}`} />
                  </PieChart></ResponsiveContainer>
                ) : <div className="text-sm text-[#8B95A8]">No expense data</div>}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {expenseBreakdown.map((e) => <div key={e.name} className="flex items-center gap-1.5 text-xs"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: expenseColors[e.name] }} /><span className="text-[#8B95A8]">{e.name}</span></div>)}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === "cod" && (
          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Coins className="w-4 h-4 text-red-400" />Revenue by Governorate</h3>
            {codGovData.length > 0 ? (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={codGovData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="gov" tick={{ fill: "#8B95A8", fontSize: 12 }} /><YAxis tick={{ fill: "#8B95A8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: "#0A1120", borderColor: "#1A2744", borderRadius: "8px", color: "#E8EDF5" }} formatter={(v: number) => `EGP ${v.toLocaleString()}`} />
                  <Bar dataKey="cod" name="Revenue" fill="#22D3EE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="text-sm text-[#8B95A8]">Loading governorate data...</div>}
          </div>
        )}

        {tab === "delivery" && (
          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><Truck className="w-4 h-4 text-red-400" />Delivery Cost Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ l: "Shipping Cost", v: Math.abs(s.shippingCost), c: "text-[#E8EDF5]" }, { l: "VAT Collected", v: Math.abs(s.vatCollected), c: "text-amber-400" }, { l: "Refunds", v: Math.abs(s.refunds), c: "text-red-400" }].map((r) => (
                <div key={r.l} className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744]"><span className="text-xs text-[#8B95A8]">{r.l}</span><div className={`text-xl font-bold font-mono-data ${r.c}`}>EGP {r.v.toLocaleString()}</div></div>
              ))}
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="bg-[#0A1120] border border-[#1A2744] rounded-xl p-5 card-glow">
            <h3 className="text-base font-semibold text-[#E8EDF5] mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-red-400" />Financial Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["P&L Statement", "Cash Flow", "Balance Sheet", "VAT Report", "COD Reconciliation", "Delivery Cost Report"].map((r) => (
                <div key={r} className="p-4 rounded-lg bg-[#050A14] border border-[#1A2744] flex items-center justify-between"><span className="text-sm text-[#E8EDF5]">{r}</span><Download className="w-4 h-4 text-[#8B95A8]" /></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
