import { useState } from "react";
import { Settings, Bell, Shield, Users, CreditCard, Globe, Palette, Database, Save } from "lucide-react";

function Toggle({ enabled, onChange, label, desc }: { enabled: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#1A2744]/50 last:border-0">
      <div><p className="text-sm text-[#E8EDF5]">{label}</p><p className="text-xs text-[#8B95A8] mt-0.5">{desc}</p></div>
      <button onClick={onChange} className="flex-shrink-0 ml-4">
        {enabled ? <div className="w-11 h-6 rounded-full bg-[#10B981] flex items-center justify-end px-1"><div className="w-4 h-4 rounded-full bg-white" /></div> : <div className="w-11 h-6 rounded-full bg-[#1A2744] flex items-center justify-start px-1"><div className="w-4 h-4 rounded-full bg-[#5A6680]" /></div>}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [section, setSection] = useState("general");
  const [toggles, setToggles] = useState({ liveMode: true, autoConfirm: true, voiceAI: true, fakeDetection: true, emailAlerts: true, whatsappNotif: true, twoFactor: false, auditLog: true, darkMode: true, autoBackup: true });
  const toggle = (key: string) => setToggles((p: Record<string, boolean>) => ({ ...p, [key]: !p[key] }));
  const sections = [{ key: "general", label: "General", icon: Settings }, { key: "notifications", label: "Notifications", icon: Bell }, { key: "security", label: "Security", icon: Shield }, { key: "team", label: "Team & Roles", icon: Users }, { key: "billing", label: "Billing", icon: CreditCard }, { key: "integrations", label: "Integrations", icon: Globe }, { key: "appearance", label: "Appearance", icon: Palette }, { key: "system", label: "System", icon: Database }];

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#5A6680]/15 flex items-center justify-center"><Settings className="w-5 h-5 text-[#5A6680]" /></div>
        <div><h2 className="text-xl font-bold text-[#E8EDF5]">Settings</h2><p className="text-sm text-[#8B95A8]">Configure your AI Operating System</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1"><div className="bg-[#0A1120] rounded-xl border border-[#1A2744] overflow-hidden">
          {sections.map((s) => <button key={s.key} onClick={() => setSection(s.key)} className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${section === s.key ? "bg-[#22D3EE]/5 text-[#22D3EE] border-l-2 border-[#22D3EE]" : "text-[#8B95A8] hover:bg-[#0F1829] hover:text-[#E8EDF5]"}`}><s.icon className="w-4 h-4" />{s.label}</button>)}
        </div></div>
        <div className="lg:col-span-3">
          {section === "general" && (
            <div className="bg-[#0A1120] rounded-xl p-6 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">General Configuration</h3>
              <div className="space-y-4">
                <div><label className="text-xs text-[#8B95A8] mb-1.5 block">Company Name</label><input defaultValue="NexusAI E-Commerce" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs text-[#8B95A8] mb-1.5 block">Base Currency</label><select className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]"><option>EGP (Egyptian Pound)</option><option>USD (US Dollar)</option></select></div>
                  <div><label className="text-xs text-[#8B95A8] mb-1.5 block">VAT Rate (%)</label><input type="number" defaultValue="14" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-xs text-[#8B95A8] mb-1.5 block">COD Fee (%)</label><input type="number" defaultValue="2.5" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div>
                  <div><label className="text-xs text-[#8B95A8] mb-1.5 block">Gateway Fee (%)</label><input type="number" defaultValue="2.0" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div>
                </div>
              </div>
              <div className="mt-6 space-y-1">
                <Toggle enabled={toggles.liveMode} onChange={() => toggle("liveMode")} label="Live Dashboard Mode" desc="Real-time data refresh every 10 seconds" />
                <Toggle enabled={toggles.autoConfirm} onChange={() => toggle("autoConfirm")} label="Auto-Confirm Low Risk" desc="Automatically confirm orders with risk score below 20" />
                <Toggle enabled={toggles.voiceAI} onChange={() => toggle("voiceAI")} label="AI Voice Confirmation" desc="Enable automated voice confirmation calls" />
                <Toggle enabled={toggles.fakeDetection} onChange={() => toggle("fakeDetection")} label="Fake Order Detection" desc="AI-powered fake order blocking" />
              </div>
              <button className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22D3EE] text-[#050A14] text-sm font-semibold hover:brightness-110"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}
          {section === "notifications" && (
            <div className="bg-[#0A1120] rounded-xl p-6 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Notification Settings</h3>
              <Toggle enabled={toggles.emailAlerts} onChange={() => toggle("emailAlerts")} label="Email Alerts" desc="Receive critical alerts via email" />
              <Toggle enabled={toggles.whatsappNotif} onChange={() => toggle("whatsappNotif")} label="WhatsApp Notifications" desc="Get order updates via WhatsApp" />
              <div className="mt-6 space-y-3"><div><label className="text-xs text-[#8B95A8] mb-1.5 block">Alert Email</label><input type="email" defaultValue="admin@nexusai.com" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div></div>
            </div>
          )}
          {section === "security" && (
            <div className="bg-[#0A1120] rounded-xl p-6 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Security Settings</h3>
              <Toggle enabled={toggles.twoFactor} onChange={() => toggle("twoFactor")} label="Two-Factor Authentication" desc="Require 2FA for all admin access" />
              <Toggle enabled={toggles.auditLog} onChange={() => toggle("auditLog")} label="Full Audit Logging" desc="Log all agent actions and data changes" />
              <div className="mt-6"><label className="text-xs text-[#8B95A8] mb-1.5 block">Session Timeout (hours)</label><input type="number" defaultValue="8" className="w-full px-3 py-2 rounded-lg bg-[#0F1829] border border-[#1A2744] text-sm text-[#E8EDF5]" /></div>
            </div>
          )}
          {section === "billing" && (
            <div className="bg-[#0A1120] rounded-xl p-6 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">Plan & Billing</h3>
              <div className="p-4 rounded-lg bg-gradient-to-r from-[#22D3EE]/10 to-[#8B5CF6]/10 border border-[#22D3EE]/20 mb-4">
                <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[#E8EDF5]">Business Plan</p><p className="text-xs text-[#8B95A8]">Up to 5,000 shipments/month</p></div><div className="text-right"><p className="text-lg font-bold text-[#22D3EE] font-mono-data">EGP 2,999/mo</p><span className="text-xs px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Active</span></div></div>
              </div>
              <div className="space-y-2">
                {[{ l: "Shipments Used", v: "1,247 / 5,000" }, { l: "Team Members", v: "8 / 20" }, { l: "Next Billing", v: "May 1, 2025" }].map((r) => (
                  <div key={r.l} className="flex items-center justify-between py-2 border-b border-[#1A2744]/50 last:border-0"><span className="text-sm text-[#8B95A8]">{r.l}</span><span className="text-sm text-[#E8EDF5] font-mono-data">{r.v}</span></div>
                ))}
              </div>
            </div>
          )}
          {!["general", "notifications", "security", "billing"].includes(section) && (
            <div className="bg-[#0A1120] rounded-xl p-6 border border-[#1A2744]">
              <h3 className="text-sm font-semibold text-[#E8EDF5] mb-4">{sections.find((s) => s.key === section)?.label}</h3>
              <p className="text-sm text-[#8B95A8]">Configure your {sections.find((s) => s.key === section)?.label.toLowerCase()} settings here.</p>
              <div className="mt-4 space-y-1"><Toggle enabled={false} onChange={() => {}} label="Feature A" desc="Enable this feature" /><Toggle enabled={true} onChange={() => {}} label="Feature B" desc="Enable this feature" /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
