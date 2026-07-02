import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { hydrateFromCache, loadTasksPage } from "@/store/slices/tasksSlice";
import { selectAllTasks, selectCacheStatus, selectServerPage, selectServerPageSize, selectServerTotal, selectTasksStatus } from "@/store/selectors";
import { readTasksCache, writeTasksCache } from "@/lib/cache";

const INITIAL_PAGE_SIZE = 50;

// On mount: hydrate from cache, revalidate with a fetch, then persist fresh pages.
export function useBootstrapTasks(): void {
  const dispatch = useAppDispatch();
  const hydratedRef = useRef(false);
  const status = useAppSelector(selectTasksStatus);
  const cacheStatus = useAppSelector(selectCacheStatus);
  const tasks = useAppSelector(selectAllTasks);
  const page = useAppSelector(selectServerPage);
  const pageSize = useAppSelector(selectServerPageSize);
  const total = useAppSelector(selectServerTotal);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await readTasksCache();
      if (!cancelled && cached && cached.items.length > 0) {
        dispatch(
          hydrateFromCache({
            items: cached.items,
            page: cached.page,
            pageSize: cached.pageSize,
            total: cached.total,
          })
        );
      }
      hydratedRef.current = true;
      if (!cancelled) {
        void dispatch(loadTasksPage({ page: 1, pageSize: INITIAL_PAGE_SIZE }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Persist to IndexedDB whenever a fresh fetch succeeds.
  useEffect(() => {
    if (status !== "succeeded" || cacheStatus !== "fresh") return;
    void writeTasksCache({
      items: tasks,
      page,
      pageSize,
      total,
      cachedAt: Date.now(),
    });
  }, [status, cacheStatus, tasks, page, pageSize, total]);
}
