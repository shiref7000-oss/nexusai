import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, DollarSign, FileText, Receipt, Truck, ArrowDownRight, ArrowUpRight, BarChart3, Download, Coins, Percent } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from "recharts";

const COLORS = ["#22D3EE", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#3B82F6", "#F97316"];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const financeTrendData = months.map((m, i) => ({
  month: m, revenue: [320000, 380000, 410000, 520000, 780000, 847320][i],
  expenses: [290000, 340000, 360000, 450000, 650000, 680000][i],
  net: [30000, 40000, 50000, 70000, 130000, 167320][i],
}));

const cashFlowData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1, inflow: 15000 + Math.sin(i * 0.5) * 5000 + Math.random() * 3000,
  outflow: -(12000 + Math.cos(i * 0.4) * 4000 + Math.random() * 2000),
  net: 3000 + Math.sin(i * 0.3) * 2000 + Math.random() * 1000,
}));

const expenseBreakdown = [
  { name: "COGS", value: 498800, pct: 39.8 }, { name: "Ad Spend", value: 312400, pct: 24.9 },
  { name: "Shipping", value: 156200, pct: 12.4 }, { name: "Returns", value: 89400, pct: 7.1 },
  { name: "COD Fees", value: 28940, pct: 2.3 }, { name: "Taxes (14%)", value: 76200, pct: 6.1 },
  { name: "Gateway", value: 18500, pct: 1.5 }, { name: "Other", value: 74000, pct: 5.9 },
];

const codGovData = [
  { gov: "Cairo", cod: 42, rate: 92 }, { gov: "Giza", cod: 28, rate: 89 },
  { gov: "Alex", cod: 18, rate: 91 }, { gov: "Mansoura", cod: 12, rate: 85 },
  { gov: "Tanta", cod: 10, rate: 83 }, { gov: "Asyut", cod: 8, rate: 71 },
  { gov: "Minya", cod: 7, rate: 68 }, { gov: "Others", cod: 25, rate: 72 },
];

const deliveryAnalytics = [
  { category: "Electronics", delivered: 312, returned: 45, rate: 87.4 },
  { category: "Health", delivered: 289, returned: 22, rate: 92.9 },
  { category: "Home", delivered: 198, returned: 18, rate: 91.7 },
  { category: "Beauty", delivered: 156, returned: 28, rate: 84.8 },
  { category: "Accessories", delivered: 267, returned: 15, rate: 94.3 },
];

function KPICard({ title, value, change, icon: Icon, color }: { title: string; value: string; change: string; icon: React.ElementType; color: string }) {
  const isPositive = change.startsWith("+");
  return (
    <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] card-glow hover:card-glow-hover transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}><Icon className="w-5 h-5" style={{ color }} /></div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isPositive ? "text-[#10B981] bg-[#10B981]/10" : "text-[#EF4444] bg-[#EF4444]/10"}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{change}
        </span>
      </div>
      <p className="text-xs text-[#8B95A8] uppercase tracking-wider font-medium mb-1">{title}</p>
      <p className="text-xl font-bold text-[#E8EDF5] font-mono-data">{value}</p>
    </div>
  );
}

export default function FinanceAgent() {
  const [tab, setTab] = useState<"overview" | "cod" | "delivery" | "reports">("overview");

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EF4444]/15 flex items-center justify-center"><Wallet className="w-5 h-5 text-[#EF4444]" /></div>
          <div><h2 className="text-xl font-bold text-[#E8EDF5]">Finance & Accounting</h2><p className="text-sm text-[#8B95A8]">Complete P&L, COD Tracking & Financial Intelligence</p></div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium border border-[#EF4444]/30 hover:bg-[#EF4444]/20 transition-all"><Download className="w-4 h-4" /> Export Report</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Gross Revenue" value="EGP 1,247,000" change="+12.4%" icon={DollarSign} color="#10B981" />
        <KPICard title="Net Profit" value="EGP 166,560" change="+8.7%" icon={TrendingUp} color="#22D3EE" />
        <KPICard title="Total Expenses" value="EGP 1,080,440" change="+15.2%" icon={TrendingDown} color="#EF4444" />
        <KPICard title="COD Outstanding" value="EGP 480,000" change="+9.3%" icon={Coins} color="#F59E0B" />
      </div>

      <div className="flex gap-1 p-1 bg-[#0A1120] rounded-lg border border-[#1A2744] w-fit">
        {[{ k: "overview", l: "P&L Overview", i: FileText }, { k: "cod", l: "COD Tracking", i: Coins }, { k: "delivery", l: "Delivery Analytics", i: Truck }, { k: "reports", l: "Financial Reports", i: BarChart3 }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k as typeof tab)} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === t.k ? "bg-[#EF4444]/10 text-[#EF4444]" : "text-[#8B95A8] hover:text-[#E8EDF5]"}`}><t.i className="w-4 h-4" /><span className="hidden sm:inline">{t.l}</span></button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-[#E8EDF5]">Revenue vs Expenses (6 Months)</h3><span className="text-xs text-[#8B95A8]">EGP</span></div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%"><BarChart data={financeTrendData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="month" tick={{ fill: "#8B95A8", fontSize: 11 }} stroke="#1A2744" /><YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" tickFormatter={(v) => `EGP${(v/1000).toFixed(0)}K`} /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="revenue" fill="#10B981" radius={[4,4,0,0]} name="Revenue" /><Bar dataKey="expenses" fill="#EF4444" radius={[4,4,0,0]} name="Expenses" /><Bar dataKey="net" fill="#22D3EE" radius={[4,4,0,0]} name="Net Profit" /></BarChart></ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center justify-between mb-4"><h3 className="text-sm font-semibold text-[#E8EDF5]">30-Day Cash Flow</h3><span className="text-xs text-[#8B95A8]">Daily</span></div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowData}><defs><linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} /></linearGradient><linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="100%" stopColor="#EF4444" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="day" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Area type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={2} fill="url(#posGrad)" name="Inflow" /><Area type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={2} fill="url(#negGrad)" name="Outflow" /><Area type="monotone" dataKey="net" stroke="#22D3EE" strokeWidth={2} fill="transparent" name="Net" /></AreaChart></ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Expense Breakdown</h3>
              <div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value" nameKey="name">{expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /></PieChart></ResponsiveContainer></div>
              <div className="grid grid-cols-2 gap-2 mt-3">{expenseBreakdown.slice(0, 6).map((e, i) => (<div key={e.name} className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} /><span className="text-xs text-[#8B95A8]">{e.name}: {e.pct}%</span></div>))}</div>
            </div>
            <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
              <div className="flex items-center gap-2 mb-4"><Receipt className="w-4 h-4 text-[#EF4444]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">P&L Summary - April 2025</h3></div>
              <div className="space-y-2">
                {[{ l: "Gross Revenue", v: "EGP 1,247,000", c: "text-[#10B981]", b: true }, { l: "Refunds & Returns", v: "-EGP 89,400", c: "text-[#EF4444]", i: true }, { l: "Net Revenue", v: "EGP 1,157,600", c: "text-[#22D3EE]", b: true, br: true }, { l: "COGS", v: "-EGP 498,800", c: "text-[#EF4444]", i: true }, { l: "Ad Spend", v: "-EGP 312,400", c: "text-[#EF4444]", i: true }, { l: "Shipping", v: "-EGP 156,200", c: "text-[#EF4444]", i: true }, { l: "COD Fees (2.5%)", v: "-EGP 28,940", c: "text-[#EF4444]", i: true }, { l: "Gateway Fees", v: "-EGP 18,500", c: "text-[#EF4444]", i: true }, { l: "VAT (14%)", v: "-EGP 76,200", c: "text-[#EF4444]", i: true }, { l: "NET PROFIT", v: "EGP 166,560", c: "text-[#10B981]", s: "text-lg", b: true }].map((row, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 ${row.br ? "border-t border-b border-[#1A2744]" : ""}`}><span className={`${row.b ? "font-semibold text-[#E8EDF5]" : "text-[#8B95A8]"} text-sm ${row.i ? "pl-4" : ""}`}>{row.l}</span><span className={`${row.s || "text-sm"} font-mono-data ${row.c} ${row.b ? "font-bold" : ""}`}>{row.v}</span></div>
                ))}
                <div className="pt-2 flex items-center justify-between"><span className="text-sm font-semibold text-[#E8EDF5]">Profit Margin</span><span className="text-sm font-bold font-mono-data text-[#10B981]">13.4%</span></div>
              </div>
            </div>
          </div>

          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center gap-2 mb-4"><Percent className="w-5 h-5 text-[#F59E0B]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">Tax Summary (VAT 14%)</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[{ t: "Output VAT (on sales)", v: "EGP 76,200", c: "text-[#E8EDF5]", d: "14% of EGP 544,286 net sales" }, { t: "Input VAT (recoverable)", v: "EGP 32,450", c: "text-[#10B981]", d: "From supplier invoices" }, { t: "Net VAT Payable", v: "EGP 43,750", c: "text-[#EF4444]", d: "Due: May 15, 2025" }].map((t) => (
                <div key={t.t} className="p-4 rounded-lg bg-[#0F1829]"><p className="text-xs text-[#8B95A8]">{t.t}</p><p className={`text-lg font-bold ${t.c} font-mono-data`}>{t.v}</p><p className="text-xs text-[#8B95A8] mt-1">{t.d}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "cod" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{ l: "Total COD Orders", v: "1,084", c: "text-[#F59E0B]", d: "87% of total orders" }, { l: "COD Collected", v: "EGP 420,000", c: "text-[#10B981]", d: "87.5% collection rate" }, { l: "Outstanding COD", v: "EGP 60,000", c: "text-[#EF4444]", d: "12.5% uncollected" }].map((k) => (
              <div key={k.l} className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]"><p className="text-xs text-[#8B95A8]">{k.l}</p><p className={`text-2xl font-bold ${k.c} font-mono-data`}>{k.v}</p><p className="text-xs text-[#8B95A8] mt-1">{k.d}</p></div>
            ))}
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">COD Collection by Governorate</h3>
            <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={codGovData}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis dataKey="gov" tick={{ fill: "#8B95A8", fontSize: 11 }} stroke="#1A2744" /><YAxis tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="cod" fill="#F59E0B" name="COD Value (EGP x1000)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
        </div>
      )}

      {tab === "delivery" && (
        <div className="space-y-6">
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Delivery Performance by Category</h3>
            <div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={deliveryAnalytics} layout="vertical" margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" stroke="#1A2744" /><XAxis type="number" tick={{ fill: "#8B95A8", fontSize: 10 }} stroke="#1A2744" /><YAxis dataKey="category" type="category" tick={{ fill: "#8B95A8", fontSize: 11 }} stroke="#1A2744" width={80} /><Tooltip contentStyle={{ backgroundColor: "#0F1829", border: "1px solid #1A2744", borderRadius: "8px", color: "#E8EDF5", fontSize: "12px" }} /><Legend wrapperStyle={{ fontSize: "12px" }} /><Bar dataKey="delivered" fill="#10B981" name="Delivered" radius={[0, 4, 4, 0]} /><Bar dataKey="returned" fill="#EF4444" name="Returned" radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Category Delivery Rates</h3>
            <div className="space-y-3">{deliveryAnalytics.map((d) => (<div key={d.category} className="flex items-center gap-4"><span className="text-sm text-[#E8EDF5] w-24">{d.category}</span><div className="flex-1 h-3 rounded-full bg-[#1A2744] overflow-hidden"><div className="h-full rounded-full bg-[#10B981]" style={{ width: `${d.rate}%` }} /></div><span className="text-sm font-mono-data text-[#10B981] w-14 text-right">{d.rate}%</span><span className="text-xs text-[#8B95A8] w-14 text-right">{d.returned} ret</span></div>))}</div>
          </div>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ title: "Monthly P&L Report", desc: "Complete profit and loss statement", icon: FileText, color: "#22D3EE" }, { title: "Cash Flow Statement", desc: "30-day cash flow analysis", icon: TrendingUp, color: "#10B981" }, { title: "Tax Report (VAT)", desc: "Output/input VAT calculation", icon: Percent, color: "#F59E0B" }, { title: "COD Collection Report", desc: "Governorate-wise COD analysis", icon: Coins, color: "#8B5CF6" }, { title: "Expense Breakdown", desc: "Category-wise expense distribution", icon: PieChart, color: "#EF4444" }, { title: "Delivery Analytics", desc: "Category delivery & return rates", icon: Truck, color: "#F97316" }].map((r) => (
              <div key={r.title} className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744] flex items-center gap-4 hover:border-[#22D3EE]/40 transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${r.color}15` }}><r.icon className="w-6 h-6" style={{ color: r.color }} /></div>
                <div className="flex-1"><h4 className="text-sm font-semibold text-[#E8EDF5] group-hover:text-[#22D3EE] transition-all">{r.title}</h4><p className="text-xs text-[#8B95A8] mt-0.5">{r.desc}</p></div>
                <Download className="w-4 h-4 text-[#8B95A8] group-hover:text-[#22D3EE] transition-all" />
              </div>
            ))}
          </div>
          <div className="bg-[#0A1120] rounded-xl p-5 border border-[#1A2744]">
            <div className="flex items-center gap-2 mb-4"><AlertTriangle className="w-5 h-5 text-[#F59E0B]" /><h3 className="text-sm font-semibold text-[#E8EDF5]">Financial Alerts</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ s: "danger", msg: "Cash reserves below 2-month runway.", imp: "Critical" }, { s: "warning", msg: "Ad spend up 23% with only 8% revenue increase.", imp: "-EGP 8,400" }, { s: "info", msg: "VAT payment due May 15. Net payable: EGP 43,750.", imp: "EGP 43,750" }].map((a, i) => (
                <div key={i} className={`p-4 rounded-lg border ${a.s === "danger" ? "bg-[#EF4444]/5 border-[#EF4444]/20" : a.s === "warning" ? "bg-[#F59E0B]/5 border-[#F59E0B]/20" : "bg-[#3B82F6]/5 border-[#3B82F6]/20"}`}>
                  <div className="flex items-center gap-2 mb-1"><AlertTriangle className={`w-4 h-4 ${a.s === "danger" ? "text-[#EF4444]" : a.s === "warning" ? "text-[#F59E0B]" : "text-[#3B82F6]"}`} /><span className={`text-xs font-semibold ${a.s === "danger" ? "text-[#EF4444]" : a.s === "warning" ? "text-[#F59E0B]" : "text-[#3B82F6]"}`}>{a.imp}</span></div>
                  <p className="text-sm text-[#E8EDF5]">{a.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
