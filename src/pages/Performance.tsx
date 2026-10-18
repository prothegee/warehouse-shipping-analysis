import { Typography, Box, Alert, CircularProgress, Grid } from "@mui/material";
import { useShipments } from "@/hooks/useShipments";
import { useEventAccumulator } from "@/hooks/useEventAccumulator";
import ThroughputPanel from "@/components/performance/ThroughputPanel";
import BottleneckPanel from "@/components/performance/BottleneckPanel";
import CarrierPanel from "@/components/performance/CarrierPanel";
import PriorityPanel from "@/components/performance/PriorityPanel";
import ZonePanel from "@/components/performance/ZonePanel";

export default function Performance() {
  const { data: shipments, isLoading, isError } = useShipments();
  const sessionEvents = useEventAccumulator();

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !shipments) {
    return <Alert severity="error">Failed to load shipment data for analytics.</Alert>;
  }

  const shiftDate = shipments.length > 0
    ? new Date(shipments[0].created_at).toLocaleDateString("id-ID", { dateStyle: "long" })
    : "-";

  return (
    <>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Shift Performance Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Shift date: {shiftDate} - {shipments.length} shipments total
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ThroughputPanel shipments={shipments} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PriorityPanel shipments={shipments} sessionEvents={sessionEvents} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ZonePanel shipments={shipments} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BottleneckPanel shipments={shipments} />
        </Grid>
        <Grid size={12}>
          <CarrierPanel shipments={shipments} />
        </Grid>
      </Grid>
    </>
  );
}
