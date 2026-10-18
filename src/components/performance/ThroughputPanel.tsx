import { Paper, Typography, Box, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import type { Shipment } from "@/api/types";

interface ThroughputPanelProps {
  shipments: Shipment[];
}

interface HourlyBucket {
  hour: string;
  count: number;
}

function computeHourlyThroughput(shipments: Shipment[]): HourlyBucket[] {
  const buckets: Record<string, number> = {};

  for (const s of shipments) {
    const h = new Date(s.created_at).getHours();
    const key = `${h.toString().padStart(2, "0")}:00`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({ hour, count }));
}

export default function ThroughputPanel({ shipments }: ThroughputPanelProps) {
  const data = computeHourlyThroughput(shipments);
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Throughput - Shipments Received per Hour
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Hour</TableCell>
            <TableCell>Count</TableCell>
            <TableCell sx={{ width: "50%" }}>Volume</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ hour, count }) => (
            <TableRow key={hour}>
              <TableCell>{hour}</TableCell>
              <TableCell>{count}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      height: 10,
                      width: `${(count / max) * 100}%`,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      minWidth: 4,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {Math.round((count / shipments.length) * 100)}%
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
