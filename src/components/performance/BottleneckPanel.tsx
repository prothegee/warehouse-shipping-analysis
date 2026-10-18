import { Paper, Typography, Box, Table, TableHead, TableBody, TableRow, TableCell, Chip } from "@mui/material";
import type { Shipment, ShipmentStatus } from "@/api/types";
import { statusColors } from "@/theme/palette";

interface BottleneckPanelProps {
  shipments: Shipment[];
}

interface StatusDwell {
  status: ShipmentStatus;
  count: number;
  avgDwellMinutes: number;
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: "Received",
  sorting: "Sorting",
  ready_to_dispatch: "Ready to Dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function computeBottleneck(shipments: Shipment[]): StatusDwell[] {
  const groups: Partial<Record<ShipmentStatus, number[]>> = {};

  for (const s of shipments) {
    const dwellMs =
      new Date(s.updated_at).getTime() - new Date(s.created_at).getTime();
    if (!groups[s.status]) groups[s.status] = [];
    groups[s.status]!.push(dwellMs);
  }

  return (Object.entries(groups) as [ShipmentStatus, number[]][])
    .map(([status, dwells]) => ({
      status,
      count: dwells.length,
      avgDwellMinutes: Math.round(
        dwells.reduce((a, b) => a + b, 0) / dwells.length / 60000,
      ),
    }))
    .sort((a, b) => b.avgDwellMinutes - a.avgDwellMinutes);
}

export default function BottleneckPanel({ shipments }: BottleneckPanelProps) {
  const data = computeBottleneck(shipments);
  const max = Math.max(...data.map(d => d.avgDwellMinutes), 1);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Bottleneck - Average Dwell Time per Status
      </Typography>
      <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mb: 1.5,
          }}
      >
        Dwell time = updated_at minus created_at. Approximation - full status history not available.
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell align="center">Shipments</TableCell>
            <TableCell>Avg Dwell</TableCell>
            <TableCell sx={{ width: "35%" }}>Relative</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ status, count, avgDwellMinutes }) => (
            <TableRow key={status}>
              <TableCell>
                <Chip
                  label={STATUS_LABELS[status]}
                  size="small"
                  sx={{
                    backgroundColor: statusColors[status],
                    color: "#fff",
                    fontSize: 11,
                  }}
                />
              </TableCell>
              <TableCell align="center">{count}</TableCell>
              <TableCell>{formatDuration(avgDwellMinutes)}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    height: 10,
                    width: `${(avgDwellMinutes / max) * 100}%`,
                    bgcolor: avgDwellMinutes === max ? "error.main" : "warning.main",
                    borderRadius: 1,
                    minWidth: 4,
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
