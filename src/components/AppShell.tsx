import { Link, useLocation, Outlet } from "react-router";
import { useState } from "react";
import { LayoutDashboard, Crown, Search, Palette, FileCode, MessageSquare, Headset, Truck, Wallet, Users, Settings, Menu, Zap, Bell } from "lucide-react";

const navItems = [
  { path: "/", label: "Command Center", icon: LayoutDashboard },
  { path: "/ceo", label: "CEO Agent", icon: Crown },
  { path: "/products", label: "Product Hunter", icon: Search },
  { path: "/creative", label: "Creative Director", icon: Palette },
  { path: "/landing", label: "Landing Page", icon: FileCode },
  { path: "/orders", label: "Orders", icon: MessageSquare },
  { path: "/moderator", label: "Moderator", icon: Headset },
  { path: "/shipping", label: "Shipping", icon: Truck },
  { path: "/finance", label: "Finance", icon: Wallet },
  { path: "/team", label: "HR & Team", icon: Users },
  { path: "/settings", label: "Settings", icon: Settings },
];

const agentColors: Record<string, string> = {
  "/": "#22D3EE", "/ceo": "#22D3EE", "/products": "#10B981",
  "/creative": "#8B5CF6", "/landing": "#F59E0B", "/orders": "#3B82F6",
  "/moderator": "#F97316", "/shipping": "#F97316", "/finance": "#EF4444",
  "/team": "#6366F1", "/settings": "#5A6680",
};

export function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const color = agentColors[location.pathname] || "#22D3EE";

  return (
    <div className="flex h-screen w-full bg-[#050A14] overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] bg-[#0A1120] border-r border-[#1A2744] flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="flex items-center gap-3 px-5 h-14 border-b border-[#1A2744]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
            <Zap className="w-5 h-5" style={{ color }} />
          </div>
          <span className="text-lg font-bold text-[#E8EDF5] tracking-tight">NexusAI</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const c = agentColors[item.path] || "#22D3EE";
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? "text-white" : "text-[#8B95A8] hover:text-[#E8EDF5] hover:bg-white/[0.04]"}`}
                style={isActive ? { backgroundColor: `${c}12`, borderLeft: `3px solid ${c}` } : {}}>
                <Icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: c } : {}} />
                <span>{item.label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full live-pulse" style={{ backgroundColor: c }} />}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-[#1A2744]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22D3EE] to-[#3B82F6] flex items-center justify-center text-xs font-bold text-[#050A14]">AK</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#E8EDF5] truncate">Admin</p>
              <p className="text-xs text-[#8B95A8] truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-[#050A14]/90 backdrop-blur-xl border-b border-[#1A2744] z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-white/[0.04] text-[#8B95A8]"><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-sm font-semibold text-[#E8EDF5]">{navItems.find((n) => n.path === location.pathname)?.label || "NexusAI"}</h1>
              <p className="text-xs text-[#8B95A8] hidden sm:block">Egyptian E-Commerce AI Operating System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1120] border border-[#1A2744]">
              <div className="w-2 h-2 rounded-full bg-[#22D3EE] live-pulse" />
              <span className="text-xs text-[#8B95A8]">Live</span>
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/[0.04] text-[#8B95A8]"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" /></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden"><Outlet /></main>
      </div>
    </div>
  );
}
