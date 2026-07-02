// TaskTicker, fixed version. See DECISIONS.md for the bug list.
import React, { useEffect, useState } from "react";

type Task = { id: string; title: string; updatedAt: number };

export function TaskTicker({ apiBase }: { apiBase: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, setTick] = useState(0);

  // (A) keep a running clock for "x seconds ago"
  useEffect(() => {
    const id = setInterval(() => {
      // functional update so we don't close over a stale tick (A)
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // (B) refetch whenever selection changes
  useEffect(() => {
    // skip the initial null selection (B1)
    if (!selectedId) return;

    // ignore a response that resolves after the selection changed (B2)
    let cancelled = false;

    fetch(`${apiBase}/api/tasks/${selectedId}`)
      .then((r) => r.json())
      .then((t: Task) => {
        if (cancelled) return;
        setTasks((prev) => {
          // new array + upsert by id: no in-place mutation, no dupes (B3/B4)
          const withoutExisting = prev.filter((existing) => existing.id !== t.id);
          return [...withoutExisting, t];
        });
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, selectedId]);

  // (C) newest first; sort a copy since Array.sort mutates in place
  const sorted = [...tasks].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <ul>
      {sorted.map((t) => (
        // key by task id, not index, since the list reorders (D)
        <li key={t.id} onClick={() => setSelectedId(t.id)}>
          {t.title} (updated {Math.floor((Date.now() - t.updatedAt) / 1000)}s ago)
        </li>
      ))}
    </ul>
  );
}
