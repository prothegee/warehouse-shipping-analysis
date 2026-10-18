import { useEffect, useRef } from "react";
import type { Shipment, StatusChangeEvent, PriorityUpdateEvent } from "@/api/types";

interface StreamHandlers {
  onNewShipment: (shipment: Shipment) => void;
  onStatusChange: (event: StatusChangeEvent) => void;
  onPriorityUpdate: (event: PriorityUpdateEvent) => void;
}

export function useShipmentStream(handlers: StreamHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
    const es = new EventSource("/api/shipments/stream");

    es.addEventListener("new_shipment", (e: MessageEvent) => {
      handlersRef.current.onNewShipment(JSON.parse(e.data) as Shipment);
    });

    es.addEventListener("status_change", (e: MessageEvent) => {
      handlersRef.current.onStatusChange(JSON.parse(e.data) as StatusChangeEvent);
    });

    es.addEventListener("priority_update", (e: MessageEvent) => {
      handlersRef.current.onPriorityUpdate(JSON.parse(e.data) as PriorityUpdateEvent);
    });

    return () => es.close();
  }, [handlers]);
}
