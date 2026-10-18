import { Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip } from "@mui/material";
import type { Shipment } from "@/api/types";

interface CarrierPanelProps {
  shipments: Shipment[];
}

interface CarrierStats {
  name: string;
  total: number;
  delivered: number;
  onHoldOrCancelled: number;
  avgDeliveryHours: number | null;
  // NOTE: efficiency score = (delivery_rate * 100) - (problem_rate * 30).
  // Heuristic weights - not empirically calibrated. Carriers with no delivered
  // shipments yet will score 0 until deliveries are recorded.
  efficiencyScore: number;
}

function computeCarrierStats(shipments: Shipment[]): CarrierStats[] {
  const groups: Record<string, {
    total: number;
    delivered: number;
    onHoldOrCancelled: number;
    deliveryTimes: number[];
  }> = {};

  for (const s of shipments) {
    const name = s.carrier.name;
    if (!groups[name]) {
      groups[name] = { total: 0, delivered: 0, onHoldOrCancelled: 0, deliveryTimes: [] };
    }
    groups[name].total++;
    if (s.status === "delivered" && s.delivered_at) {
      groups[name].delivered++;
      const ms = new Date(s.delivered_at).getTime() - new Date(s.created_at).getTime();
      groups[name].deliveryTimes.push(ms);
    }
    if (s.status === "on_hold" || s.status === "cancelled") {
      groups[name].onHoldOrCancelled++;
    }
  }

  return Object.entries(groups)
    .map(([name, d]) => {
      const deliveryRate = d.total > 0 ? d.delivered / d.total : 0;
      const problemRate = d.total > 0 ? d.onHoldOrCancelled / d.total : 0;
      const score = Math.max(0, Math.min(100, Math.round(deliveryRate * 100 - problemRate * 30)));
      return {
        name,
        total: d.total,
        delivered: d.delivered,
        onHoldOrCancelled: d.onHoldOrCancelled,
        avgDeliveryHours:
          d.deliveryTimes.length > 0
            ? Math.round(
                (d.deliveryTimes.reduce((a, b) => a + b, 0) / d.deliveryTimes.length / 3600000) * 10,
              ) / 10
            : null,
        efficiencyScore: score,
      };
    })
    .sort((a, b) => b.efficiencyScore - a.efficiencyScore);
}

function scoreColor(score: number): string {
  if (score >= 70) return "#4CAF50";
  if (score >= 40) return "#FF9800";
  return "#F44336";
}

export default function CarrierPanel({ shipments }: CarrierPanelProps) {
  const data = computeCarrierStats(shipments);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Carrier Performance
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Carrier</TableCell>
            <TableCell align="center">Total</TableCell>
            <TableCell align="center">Delivered</TableCell>
            <TableCell align="center">On Hold / Cancelled</TableCell>
            <TableCell align="center">Avg Delivery Time</TableCell>
            <TableCell align="center">Efficiency</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(({ name, total, delivered, onHoldOrCancelled, avgDeliveryHours, efficiencyScore }) => (
            <TableRow key={name}>
              <TableCell>{name}</TableCell>
              <TableCell align="center">{total}</TableCell>
              <TableCell align="center">
                <Chip
                  label={delivered}
                  size="small"
                  sx={{ bgcolor: "#4CAF50", color: "#fff", minWidth: 32 }}
                />
              </TableCell>
              <TableCell align="center">
                {onHoldOrCancelled > 0 ? (
                  <Chip
                    label={onHoldOrCancelled}
                    size="small"
                    sx={{ bgcolor: "#F44336", color: "#fff", minWidth: 32 }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">-</Typography>
                )}
              </TableCell>
              <TableCell align="center">
                {avgDeliveryHours !== null
                  ? `${avgDeliveryHours}h`
                  : <Typography variant="body2" color="text.secondary">No data</Typography>}
              </TableCell>
              <TableCell align="center">
                <Chip
                  label={`${efficiencyScore}%`}
                  size="small"
                  sx={{ bgcolor: scoreColor(efficiencyScore), color: "#fff", minWidth: 44, fontWeight: "bold" }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
