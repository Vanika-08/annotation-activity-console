import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  taskUpdated,
  taskAssigned,
  annotationCreated,
  loadMissingTask,
} from "@/store/slices/tasksSlice";
import { parseSocketEvent } from "@/lib/normalize";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

export type FeedStatus = "connecting" | "open" | "reconnecting" | "closed";

const MAX_BACKOFF_MS = 15_000;
const BASE_BACKOFF_MS = 500;

// WebSocket subscription: dispatches events, reconnects with capped backoff,
// and backfills tasks referenced by events before they've been loaded.
export function useTaskFeed(): FeedStatus {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<FeedStatus>("connecting");
  const pendingIds = useAppSelector((s) => s.tasks.pendingIds);
  const fetchingIds = useAppSelector((s) => s.tasks.fetchingIds);
  const attemptRef = useRef(0);
  const closedByUsRef = useRef(false);

  useEffect(() => {
    closedByUsRef.current = false;
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      setStatus(attemptRef.current === 0 ? "connecting" : "reconnecting");
      ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        attemptRef.current = 0;
        setStatus("open");
      };

      ws.onmessage = (event) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(event.data as string);
        } catch {
          return; // ignore malformed frame
        }
        const socketEvent = parseSocketEvent(parsed);
        if (!socketEvent) return; // unrecognized shape

        switch (socketEvent.kind) {
          case "task.updated":
            dispatch(taskUpdated(socketEvent.payload));
            break;
          case "task.assigned":
            dispatch(taskAssigned(socketEvent.payload));
            break;
          case "annotation.created":
            dispatch(annotationCreated(socketEvent.payload));
            break;
        }
      };

      ws.onclose = () => {
        if (closedByUsRef.current) return;
        setStatus("reconnecting");
        const delay = Math.min(
          MAX_BACKOFF_MS,
          BASE_BACKOFF_MS * 2 ** attemptRef.current
        );
        attemptRef.current += 1;
        reconnectTimer = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // onclose fires next and drives the reconnect.
        ws?.close();
      };
    }

    connect();

    return () => {
      closedByUsRef.current = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
      setStatus("closed");
    };
  }, [dispatch]);

  // Fetch any task an event referenced but that we haven't loaded yet.
  useEffect(() => {
    for (const id of pendingIds) {
      if (!fetchingIds.includes(id)) {
        void dispatch(loadMissingTask(id));
      }
    }
  }, [pendingIds, fetchingIds, dispatch]);

  return status;
}
