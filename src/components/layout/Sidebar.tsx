import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  IconButton, Box, Divider, Typography,
} from "@mui/material";
import {
  Dashboard, BarChart, ChevronLeft, ChevronRight, Warehouse,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const DRAWER_WIDTH = 220;
const COLLAPSED_WIDTH = 64;

const NAV_ITEMS = [
  { label: "Dashboard", icon: <Dashboard />, path: "/" },
  { label: "Performance", icon: <BarChart />, path: "/performance" },
];

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  anchor?: "left" | "right";
}

export default function Sidebar({ open, onToggle, anchor = "left" }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      anchor={anchor}
      sx={{
        width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          overflowX: "hidden",
          transition: "width 0.2s ease",
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          px: 1,
          minHeight: 64,
        }}
      >
        {open && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <Warehouse sx={{ color: "primary.main" }} />
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: "bold" }}
              color="primary"
            >
              WarehouseShipment
            </Typography>
          </Box>
        )}
        <IconButton
          onClick={onToggle}
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>

      <Divider />

      <List disablePadding>
        {NAV_ITEMS.map(item => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
            sx={{ justifyContent: open ? "flex-start" : "center", px: open ? 2 : 1 }}
          >
            <ListItemIcon sx={{ minWidth: open ? 40 : "unset" }}>
              {item.icon}
            </ListItemIcon>
            {open && <ListItemText primary={item.label} />}
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}
