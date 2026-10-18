import { useEffect, useState } from "react";
import type { SSEEvent } from "@/api/types";

// NOTE: session-only - accumulated events reset on page refresh,
// opens a second EventSource connection alongside useShipmentStream.
// A shared SSE context would consolidate both into one connection.
export function useEventAccumulator(): SSEEvent[] {
  const [events, setEvents] = useState<SSEEvent[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/shipments/stream");

    es.addEventListener("new_shipment", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setEvents(prev => [...prev, { event: "new_shipment", data }]);
      } catch { /* ignore malformed events */ }
    });

    es.addEventListener("status_change", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setEvents(prev => [...prev, { event: "status_change", data }]);
      } catch { /* ignore malformed events */ }
    });

    es.addEventListener("priority_update", (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setEvents(prev => [...prev, { event: "priority_update", data }]);
      } catch { /* ignore malformed events */ }
    });

    return () => es.close();
  }, []);

  return events;
}
