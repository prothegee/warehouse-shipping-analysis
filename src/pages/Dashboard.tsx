import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import type { Shipment, ShipmentStatus } from "@/api/types";
import { useShipments } from "@/hooks/useShipments";
import { useShipmentStream } from "@/hooks/useShipmentStream";
import { useNotification } from "@/components/feedback/NotificationProvider";
import StatCards from "@/components/stats/StatCards";
import ShipmentList from "@/components/shipment/ShipmentList";
import AiSuggestionPanel from "@/components/ai/AiSuggestionPanel";
import ShipmentDetailModal from "@/components/ai-generated-component";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: initialShipments, isLoading, isError } = useShipments();
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments ?? []);
  const [syncedShipments, setSyncedShipments] = useState<Shipment[] | undefined>(initialShipments);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);
  const { notify } = useNotification();

  // Adopt the server list once the query delivers new data.
  if (initialShipments && initialShipments !== syncedShipments) {
    setSyncedShipments(initialShipments);
    setShipments(initialShipments);
  }

  // Derive the selected shipment so SSE updates reach the suggestion panel.
  const selectedShipment = shipments.find(s => s.id === selectedId) ?? null;

  useShipmentStream({
    onNewShipment: (s) => {
      setShipments(prev => [s, ...prev]);
      notify(`New shipment ${s.id} arrived`, "info");
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onStatusChange: (e) => {
      setShipments(prev =>
        prev.map(s =>
          s.id === e.id ? { ...s, status: e.status, updated_at: e.timestamp } : s,
        ),
      );
      notify(`${e.id} > ${e.status.replace(/_/g, " ")}`, "info");
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
    onPriorityUpdate: (e) => {
      setShipments(prev =>
        prev.map(s => (s.id === e.id ? { ...s, priority: e.priority } : s)),
      );
      notify(`${e.id} priority changed to ${e.priority}`, "info");
    },
  });

  function handleStatusUpdate(id: string, status: ShipmentStatus) {
    setShipments(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s)),
    );
    queryClient.invalidateQueries({ queryKey: ["stats"] });
  }

  return (
    <>
      <Typography
        variant="h5"
        sx={{ fontWeight: "bold" }}
        gutterBottom
      >
        Shipment Tracking Dashboard
      </Typography>

      <StatCards />

      {selectedShipment && <AiSuggestionPanel shipment={selectedShipment} />}

      <ShipmentList
        shipments={shipments}
        isLoading={isLoading}
        isError={isError}
        selectedId={selectedShipment?.id ?? null}
        onSelect={shipment => setSelectedId(shipment?.id ?? null)}
        onDetails={setDetailShipment}
      />

      {detailShipment && (
        <ShipmentDetailModal
          key={detailShipment.id}
          shipment={detailShipment}
          open
          onClose={() => setDetailShipment(null)}
          onStatusUpdate={(id, status) => {
            handleStatusUpdate(id, status);
            setDetailShipment(null);
          }}
        />
      )}
    </>
  );
}
