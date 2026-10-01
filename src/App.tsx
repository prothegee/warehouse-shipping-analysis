import { Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import NotificationProvider from "@/components/feedback/NotificationProvider";
import Dashboard from "@/pages/Dashboard";
import Performance from "@/pages/Performance";

export default function App() {
  return (
    <NotificationProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </AppShell>
    </NotificationProvider>
  );
}
