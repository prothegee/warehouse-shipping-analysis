import { useState } from "react";
import {
  Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Paper, CircularProgress, Alert, Typography, Box,
} from "@mui/material";
import type { Shipment, ShipmentStatus, Priority } from "@/api/types";
// ShipmentStatus is used by ShipmentFilters state type
import ShipmentRow from "./ShipmentRow";
import ShipmentFilters from "./ShipmentFilters";

interface ShipmentListProps {
  shipments: Shipment[];
  isLoading: boolean;
  isError: boolean;
  selectedId: string | null;
  onSelect: (shipment: Shipment | null) => void;
  onDetails: (shipment: Shipment) => void;
}

export default function ShipmentList({
  shipments,
  isLoading,
  isError,
  selectedId,
  onSelect,
  onDetails,
}: ShipmentListProps) {
  const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "">("");

  const filtered = shipments.filter(
    s =>
      (!statusFilter || s.status === statusFilter) &&
      (!priorityFilter || s.priority === priorityFilter),
  );

  return (
    <Box>
      <ShipmentFilters
        status={statusFilter}
        priority={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">Failed to load shipments. Please refresh the page.</Alert>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Typography color="text.secondary" sx={{ textAlign: "center", mt: 6 }}>
          No shipments match the current filters.
        </Typography>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Carrier</TableCell>
                <TableCell>Destination</TableCell>
                <TableCell align="center">Packages</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(shipment => (
                <ShipmentRow
                  key={shipment.id}
                  shipment={shipment}
                  selected={shipment.id === selectedId}
                  onSelect={() =>
                    onSelect(shipment.id === selectedId ? null : shipment)
                  }
                  onDetails={() => onDetails(shipment)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

    </Box>
  );
}
