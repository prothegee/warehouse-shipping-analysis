import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { ShipmentStatus, Priority } from "@/api/types";

const STATUSES: ShipmentStatus[] = [
  "received", "sorting", "ready_to_dispatch", "dispatched", "delivered", "on_hold", "cancelled",
];

const PRIORITIES: Priority[] = ["normal", "urgent", "critical"];

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: "Received",
  sorting: "Sorting",
  ready_to_dispatch: "Ready to Dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

interface ShipmentFiltersProps {
  status: ShipmentStatus | "";
  priority: Priority | "";
  onStatusChange: (v: ShipmentStatus | "") => void;
  onPriorityChange: (v: Priority | "") => void;
}

export default function ShipmentFilters({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
}: ShipmentFiltersProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e: SelectChangeEvent) =>
            onStatusChange(e.target.value as ShipmentStatus | "")
          }
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUSES.map(s => (
            <MenuItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e: SelectChangeEvent) =>
            onPriorityChange(e.target.value as Priority | "")
          }
        >
          <MenuItem value="">All priorities</MenuItem>
          {PRIORITIES.map(p => (
            <MenuItem key={p} value={p} sx={{ textTransform: "capitalize" }}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}
