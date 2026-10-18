import { TableRow, TableCell, Chip, Button, Box, Typography } from "@mui/material";
import type { Shipment } from "@/api/types";
import { priorityColors } from "@/theme/palette";
import ShipmentStatusBadge from "./ShipmentStatusBadge";

const PRIORITY_LABELS: Record<string, string> = {
  normal: "Normal",
  urgent: "Urgent",
  critical: "Critical",
};

interface ShipmentRowProps {
  shipment: Shipment;
  selected: boolean;
  onSelect: () => void;
  onDetails: () => void;
}

export default function ShipmentRow({ shipment, selected, onSelect, onDetails }: ShipmentRowProps) {
  return (
    <TableRow selected={selected} hover>
      <TableCell>
        <Typography
          variant="body2"
          sx={{ fontWeight: "bold" }}
        >
          {shipment.id}
        </Typography>
      </TableCell>
      <TableCell>
        <ShipmentStatusBadge status={shipment.status} />
      </TableCell>
      <TableCell>
        <Chip
          label={PRIORITY_LABELS[shipment.priority]}
          size="small"
          sx={{
            backgroundColor: priorityColors[shipment.priority],
            color: "#fff",
            textTransform: "capitalize",
          }}
        />
      </TableCell>
      <TableCell>{shipment.carrier.name}</TableCell>
      <TableCell>{shipment.destination}</TableCell>
      <TableCell align="center">{shipment.package_count}</TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant={selected ? "contained" : "outlined"} onClick={onSelect}>
            {selected ? "Deselect" : "AI Route"}
          </Button>
          <Button size="small" variant="contained" color="primary" onClick={onDetails}>
            Details
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}
