import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(prev => !prev)} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
        {children}
      </Box>
    </Box>
  );
}
