"use client";

import { useAppSelector } from "@/store/hooks";
import { selectCacheStatus, selectTasksWarnings } from "@/store/selectors";
import type { FeedStatus } from "@/hooks/useTaskFeed";

function feedLabel(status: FeedStatus): { text: string; color: string } {
  switch (status) {
    case "open":
      return { text: "Live", color: "bg-green-500" };
    case "connecting":
      return { text: "Connecting…", color: "bg-yellow-500" };
    case "reconnecting":
      return { text: "Reconnecting…", color: "bg-yellow-500" };
    case "closed":
      return { text: "Disconnected", color: "bg-gray-400" };
  }
}

function cacheLabel(status: ReturnType<typeof selectCacheStatus>): string {
  switch (status) {
    case "cached":
      return "Showing cached data (revalidating…)";
    case "revalidating":
      return "Revalidating…";
    case "fresh":
      return "Live data";
    case "none":
      return "";
  }
}

export function StatusBar({ feedStatus }: { feedStatus: FeedStatus }) {
  const cacheStatus = useAppSelector(selectCacheStatus);
  const warnings = useAppSelector(selectTasksWarnings);
  const feed = feedLabel(feedStatus);
  const cacheText = cacheLabel(cacheStatus);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2 text-xs text-gray-500">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${feed.color}`} />
          {feed.text}
        </span>
        {cacheText && (
          <span className={cacheStatus === "cached" ? "text-amber-600" : ""}>{cacheText}</span>
        )}
      </div>
      {warnings.length > 0 && (
        <span className="text-amber-600" title={warnings.slice(0, 5).map((w) => w.message).join("\n")}>
          {warnings.length} data warning{warnings.length === 1 ? "" : "s"} (hover)
        </span>
      )}
    </div>
  );
}
