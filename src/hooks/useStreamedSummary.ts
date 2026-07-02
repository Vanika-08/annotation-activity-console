import { useEffect, useRef, useState } from "react";
import { getApiBase } from "@/lib/api";

export type StreamStatus = "idle" | "streaming" | "done" | "error";

export interface StreamedSummaryState {
  text: string;
  status: StreamStatus;
  error: string | null;
}

// Streams a task's AI summary over SSE. Switching taskId cancels the previous stream.
export function useStreamedSummary(taskId: string | null): StreamedSummaryState {
  const [state, setState] = useState<StreamedSummaryState>({
    text: "",
    status: "idle",
    error: null,
  });
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Tear down any in-flight stream before starting a new one.
    esRef.current?.close();
    esRef.current = null;

    if (!taskId) {
      setState({ text: "", status: "idle", error: null });
      return;
    }

    setState({ text: "", status: "streaming", error: null });

    const url = `${getApiBase()}/api/tasks/${encodeURIComponent(taskId)}/summary`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (event) => {
      let chunk: string;
      try {
        chunk = JSON.parse(event.data as string);
      } catch {
        return; // skip malformed frame
      }
      setState((prev) =>
        prev.status === "streaming"
          ? { ...prev, text: prev.text + chunk }
          : prev
      );
    };

    es.addEventListener("done", () => {
      setState((prev) => ({ ...prev, status: "done" }));
      es.close();
    });

    es.onerror = () => {
      // Treat errors as terminal instead of letting EventSource auto-retry.
      setState((prev) =>
        prev.status === "done"
          ? prev
          : { ...prev, status: "error", error: "Summary stream failed" }
      );
      es.close();
    };

    return () => {
      es.close();
      if (esRef.current === es) esRef.current = null;
    };
  }, [taskId]);

  return state;
}
