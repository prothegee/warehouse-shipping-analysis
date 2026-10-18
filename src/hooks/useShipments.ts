import { useQuery } from "@tanstack/react-query";
import type { Shipment } from "@/api/types";

export function useShipments() {
  return useQuery<Shipment[]>({
    queryKey: ["shipments"],
    queryFn: async () => {
      const res = await fetch("/api/shipments");
      if (!res.ok) throw new Error("Failed to fetch shipments");
      return res.json();
    },
  });
}
