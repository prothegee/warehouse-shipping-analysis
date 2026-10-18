import { Box, Skeleton, Alert } from "@mui/material";
import {
  Inbox, HourglassEmpty, LocalShipping, Warning, PauseCircle,
} from "@mui/icons-material";
import type { SvgIconComponent } from "@mui/icons-material";
import type { StatsResponse } from "@/api/types";
import { useStats } from "@/hooks/useStats";
import StatCard from "./StatCard";

interface StatConfig {
  key: keyof StatsResponse;
  label: string;
  Icon: SvgIconComponent;
  color: string;
}

const STAT_CONFIG: StatConfig[] = [
  { key: "total_received", label: "Received", Icon: Inbox, color: "#2196F3" },
  { key: "total_pending", label: "Pending", Icon: HourglassEmpty, color: "#FF9800" },
  { key: "total_dispatched", label: "Dispatched", Icon: LocalShipping, color: "#4CAF50" },
  { key: "total_delayed", label: "Delayed", Icon: Warning, color: "#F44336" },
  { key: "total_on_hold", label: "On Hold", Icon: PauseCircle, color: "#9E9E9E" },
];

export default function StatCards() {
  const { data, isLoading, isError } = useStats();

  if (isError) {
    return <Alert severity="error" sx={{ mb: 3 }}>Failed to load statistics</Alert>;
  }

  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
      {STAT_CONFIG.map(({ key, label, Icon, color }) =>
        isLoading ? (
          <Skeleton key={key} variant="rounded" width={140} height={96} />
        ) : (
          <StatCard key={key} label={label} value={data![key]} Icon={Icon} color={color} />
        )
      )}
    </Box>
  );
}
