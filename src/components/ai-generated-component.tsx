import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Modal,
  Box,
  Typography,
  Chip,
  Divider,
  Button,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import type { Shipment, ShipmentStatus } from "@/api/types";
import { VALID_TRANSITIONS } from "@/api/types";
import { statusColors } from "@/theme/palette";
import { useAiSuggestion } from "@/hooks/useAiSuggestion";

interface ShipmentDetailModalProps {
  shipment: Shipment;
  open: boolean;
  onClose: () => void;
  onStatusUpdate?: (id: string, status: ShipmentStatus) => void;
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({
  shipment,
  open,
  onClose,
  onStatusUpdate,
}) => {
  const {
    text: aiSuggestion,
    isDone: isSuggestionDone,
    fetchSuggestion,
  } = useAiSuggestion();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Ref keeps latest shipment available inside the effect without adding it to
  // deps (which would re-trigger the fetch on every SSE update to the shipment).
  const shipmentRef = useRef(shipment);
  useEffect(() => {
    shipmentRef.current = shipment;
  }, [shipment]);

  useEffect(() => {
    if (!open) return;

    fetchSuggestion(shipmentRef.current);
  }, [open, shipment.id, fetchSuggestion]);

  const isLoadingSuggestion = !isSuggestionDone && !aiSuggestion;

  // Fix 2: guard against undefined carrier.phone (e.g. AnterAja)
  const carrierPhoneFormatted = useMemo(() => {
    if (!shipment.carrier.phone) return "N/A";
    const parts = shipment.carrier.phone.split("-");
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`;
  }, [shipment.carrier.phone]);

  // Fix 6 (useMemo deps): include shipment.status so display updates on change
  const statusDisplay = useMemo(
    () => shipment.status.replace(/_/g, " ").toUpperCase(),
    [shipment.status],
  );

  // Fix 4: replace direct prop mutation with a PATCH call
  async function handleStatusAdvance(nextStatus: ShipmentStatus) {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/shipments/${shipment.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        onStatusUpdate?.(shipment.id, nextStatus);
        onClose();
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const validNextStates = VALID_TRANSITIONS[shipment.status].slice(0, 3);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 540,
          bgcolor: "background.paper",
          borderRadius: 2,
          p: 4,
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Fix 10: accessible close button with IconButton and aria-label */}
        <IconButton
          onClick={onClose}
          aria-label="Close shipment details"
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <Close />
        </IconButton>

        <Typography variant="h5" gutterBottom>
          Shipment Details
        </Typography>

        <Chip
          label={statusDisplay}
          sx={{
            backgroundColor: statusColors[shipment.status],
            color: "#fff",
            fontWeight: "bold",
            mb: 2,
          }}
        />

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={1.5}>
          <div>
            <Typography variant="caption" color="text.secondary">Shipment ID</Typography>
            <Typography variant="body1">{shipment.id}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Tracking ID</Typography>
            <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
              {shipment.tracking_id}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Carrier</Typography>
            <Typography variant="body1">{shipment.carrier.name}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Carrier Phone</Typography>
            <Typography variant="body1">{carrierPhoneFormatted}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Sender - Recipient</Typography>
            <Typography variant="body1">
              {shipment.sender} - {shipment.recipient}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Destination</Typography>
            <Typography variant="body1">{shipment.destination}</Typography>
          </div>
          <div>
            <Typography variant="caption" color="text.secondary">Created At</Typography>
            <Typography variant="body1">{formatTimestamp(shipment.created_at)}</Typography>
          </div>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Notes</Typography>
        {/* Fix 5: render as plain text to prevent XSS from HTML in notes field */}
        <Typography variant="body2" color="text.secondary">
          {shipment.notes ?? "-"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>AI Routing Suggestion</Typography>
        <Typography variant="body2" color="text.secondary">
          {isLoadingSuggestion ? "Fetching suggestion..." : aiSuggestion || "No suggestion available"}
        </Typography>

        {validNextStates.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Advance Status</Typography>
            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: "wrap" }}
            >
              {validNextStates.map(next => (
                <Button
                  key={next}
                  variant="outlined"
                  size="small"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusAdvance(next)}
                  sx={{ textTransform: "none" }}
                >
                  {isUpdatingStatus ? <CircularProgress size={14} /> : next.replace(/_/g, " ")}
                </Button>
              ))}
            </Stack>
          </>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ShipmentDetailModal;
