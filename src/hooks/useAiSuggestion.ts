import { useState, useRef, useCallback, useEffect } from "react";
import type { Shipment } from "@/api/types";
import { streamRouteSuggestion } from "@/api/route-suggestion";

export interface AiSuggestionState {
  text: string;
  isStreaming: boolean;
  isDone: boolean;
}

export function useAiSuggestion() {
  const [state, setState] = useState<AiSuggestionState>({
    text: "",
    isStreaming: false,
    isDone: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const fetchSuggestion = useCallback(async (shipment: Shipment) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ text: "", isStreaming: true, isDone: false });

    try {
      await streamRouteSuggestion(shipment, controller.signal, text => {
        setState(prev => ({ ...prev, text: prev.text + text }));
      });

      setState(prev => ({ ...prev, isStreaming: false, isDone: true }));
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.warn("Route suggestion request failed", err);
      setState(prev => ({ ...prev, isStreaming: false, isDone: true }));
    }
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setState({ text: "", isStreaming: false, isDone: false });
  }, []);

  return { ...state, fetchSuggestion, clear };
}
