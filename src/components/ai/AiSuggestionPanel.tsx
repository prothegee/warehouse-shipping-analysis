import { useEffect } from "react";
import { Paper, Typography, Box, CircularProgress, Alert, Chip } from "@mui/material";
import { SmartToy, Warning } from "@mui/icons-material";
import type { Shipment } from "@/api/types";
import { useAiSuggestion } from "@/hooks/useAiSuggestion";

const CONTRADICTION_KEYWORDS = [
  "no priority handling",
  "low-priority",
  "economy batch",
  "no rush",
  "delay acceptable",
  "overflow storage",
  "48 hours",
  "ground routing",
];

function detectsContradiction(text: string, priority: Shipment["priority"]): boolean {
  if (priority === "normal") return false;
  const lower = text.toLowerCase();
  return CONTRADICTION_KEYWORDS.some(k => lower.includes(k));
}

interface AiSuggestionPanelProps {
  shipment: Shipment;
}

export default function AiSuggestionPanel({ shipment }: AiSuggestionPanelProps) {
  const { text, isStreaming, isDone, fetchSuggestion } = useAiSuggestion();

  useEffect(() => {
    fetchSuggestion(shipment);
    // re-fetch only when selected shipment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipment.id]);

  const showWarning = isDone && detectsContradiction(text, shipment.priority);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <SmartToy fontSize="small" color="primary" />
        <Typography variant="subtitle2">AI Route Suggestion</Typography>
        <Chip label={shipment.id} size="small" variant="outlined" />
        {isStreaming && <CircularProgress size={14} />}
      </Box>

      {showWarning && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 1.5 }}>
          This suggestion may conflict with the shipment&apos;s{" "}
          <strong>{shipment.priority}</strong> priority. Verify before acting.
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
        {text || (isStreaming ? "Generating suggestion..." : "No suggestion available")}
      </Typography>
    </Paper>
  );
}
