import { Chip } from "@mui/material";
import {
  Inbox, Sort, CheckCircle, LocalShipping, DoneAll, Pause, Cancel,
} from "@mui/icons-material";
import type { ShipmentStatus } from "@/api/types";
import { statusColors } from "@/theme/palette";

const STATUS_ICONS: Record<ShipmentStatus, React.ReactElement> = {
  received: <Inbox fontSize="small" />,
  sorting: <Sort fontSize="small" />,
  ready_to_dispatch: <CheckCircle fontSize="small" />,
  dispatched: <LocalShipping fontSize="small" />,
  delivered: <DoneAll fontSize="small" />,
  on_hold: <Pause fontSize="small" />,
  cancelled: <Cancel fontSize="small" />,
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: "Received",
  sorting: "Sorting",
  ready_to_dispatch: "Ready to Dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

interface ShipmentStatusBadgeProps {
  status: ShipmentStatus;
}

export default function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return (
    <Chip
      icon={STATUS_ICONS[status]}
      label={STATUS_LABELS[status]}
      size="small"
      sx={{
        backgroundColor: statusColors[status],
        color: "#fff",
        "& .MuiChip-icon": { color: "#fff" },
      }}
    />
  );
}
