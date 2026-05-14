import { Routes, Route } from "react-router";
import { AppShell } from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import CeoAgent from "./pages/CeoAgent";
import ProductHunter from "./pages/ProductHunter";
import CreativeDirector from "./pages/CreativeDirector";
import LandingPageAgent from "./pages/LandingPageAgent";
import ConfirmationAgent from "./pages/ConfirmationAgent";
import ModeratorAgent from "./pages/ModeratorAgent";
import ShippingAgent from "./pages/ShippingAgent";
import FinanceAgent from "./pages/FinanceAgent";
import TeamAgent from "./pages/TeamAgent";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ceo" element={<CeoAgent />} />
        <Route path="/products" element={<ProductHunter />} />
        <Route path="/creative" element={<CreativeDirector />} />
        <Route path="/landing" element={<LandingPageAgent />} />
        <Route path="/orders" element={<ConfirmationAgent />} />
        <Route path="/moderator" element={<ModeratorAgent />} />
        <Route path="/shipping" element={<ShippingAgent />} />
        <Route path="/finance" element={<FinanceAgent />} />
        <Route path="/team" element={<TeamAgent />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
