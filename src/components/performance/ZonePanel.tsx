import { Paper, Typography, Box, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import type { Shipment } from "@/api/types";

interface ZonePanelProps {
  shipments: Shipment[];
}

interface ZoneBucket {
  zone: string;
  count: number;
  percentage: number;
}

// NOTE: Zone extracted by matching "Zone A/B/C/D" prefix in destination string.
// Destinations without this prefix (street addresses) are grouped as "External".
// If the destination format changes, this regex must be updated.
function extractZone(destination: string): string {
  const match = destination.match(/^Zone ([A-D])\b/);
  return match ? `Zone ${match[1]}` : "External";
}

function computeZoneLoad(shipments: Shipment[]): ZoneBucket[] {
  const counts: Record<string, number> = {};
  const total = shipments.length || 1;

  for (const s of shipments) {
    const zone = extractZone(s.destination);
    counts[zone] = (counts[zone] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([zone, count]) => ({
      zone,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function ZonePanel({ shipments }: ZonePanelProps) {
  const data = computeZoneLoad(shipments);
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Zone Load Distribution
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Zone</TableCell>
            <TableCell align="center">Shipments</TableCell>
            <TableCell sx={{ width: "45%" }}>Load</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ zone, count, percentage }) => (
            <TableRow key={zone}>
              <TableCell>{zone}</TableCell>
              <TableCell align="center">{count}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      height: 10,
                      width: `${(count / max) * 100}%`,
                      bgcolor: zone === "External" ? "text.secondary" : "secondary.main",
                      borderRadius: 1,
                      minWidth: 4,
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
    </Paper>
  );
}
