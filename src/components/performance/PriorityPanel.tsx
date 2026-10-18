import { Paper, Typography, Box, Table, TableHead, TableBody, TableRow, TableCell, Divider } from "@mui/material";
import type { Shipment, Priority, SSEEvent } from "@/api/types";
import { priorityColors } from "@/theme/palette";

interface PriorityPanelProps {
  shipments: Shipment[];
  // NOTE: session-only - priority_update events accumulated since page mount.
  // Resets on page refresh. Populated by useEventAccumulator in Performance.tsx.
  sessionEvents: SSEEvent[];
}

interface PriorityBucket {
  priority: Priority;
  count: number;
  percentage: number;
}

const PRIORITY_LABELS: Record<Priority, string> = {
  normal: "Normal",
  urgent: "Urgent",
  critical: "Critical",
};

const PRIORITIES: Priority[] = ["normal", "urgent", "critical"];

function computePriorityDistribution(shipments: Shipment[]): PriorityBucket[] {
  const total = shipments.length || 1;
  return PRIORITIES.map(priority => ({
    priority,
    count: shipments.filter(s => s.priority === priority).length,
    percentage: Math.round((shipments.filter(s => s.priority === priority).length / total) * 100),
  }));
}

function computeSessionChanges(events: SSEEvent[]): Record<Priority, number> {
  const counts: Record<Priority, number> = { normal: 0, urgent: 0, critical: 0 };
  for (const ev of events) {
    if (ev.event === "priority_update") {
      counts[ev.data.priority] = (counts[ev.data.priority] ?? 0) + 1;
    }
  }
  return counts;
}

export default function PriorityPanel({ shipments, sessionEvents }: PriorityPanelProps) {
  const data = computePriorityDistribution(shipments);
  const sessionChanges = computeSessionChanges(sessionEvents);
  const totalSessionChanges = Object.values(sessionChanges).reduce((a, b) => a + b, 0);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Priority Distribution
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Priority</TableCell>
            <TableCell align="center">Count</TableCell>
            <TableCell sx={{ width: "50%" }}>Share</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ priority, count, percentage }) => (
            <TableRow key={priority}>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: priorityColors[priority],
                    textTransform: "capitalize",
                  }}
                >
                  {PRIORITY_LABELS[priority]}
                </Typography>
              </TableCell>
              <TableCell align="center">{count}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      height: 10,
                      width: `${percentage}%`,
                      bgcolor: priorityColors[priority],
                      borderRadius: 1,
                      minWidth: percentage > 0 ? 4 : 0,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {percentage}%
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 1.5 }} />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontWeight: "bold",
          display: "block",
          mb: 1,
        }}
      >
        Priority Changes This Session ({totalSessionChanges})
      </Typography>

      {totalSessionChanges === 0 ? (
        <Typography variant="caption" color="text.disabled">
          No priority updates received yet - changes will appear as SSE events arrive.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {PRIORITIES.map(priority => (
            <Box key={priority} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: priorityColors[priority] }} />
              <Typography variant="caption">
                {PRIORITY_LABELS[priority]}: <strong>{sessionChanges[priority]}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
}
