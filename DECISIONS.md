# Design Decisions

## State Management

I used Redux Toolkit with `createEntityAdapter` because tasks are updated from both REST APIs and WebSocket events. The entity adapter keeps updates simple and avoids manually managing arrays.

I chose `createAsyncThunk` for the REST calls since the project only has a couple of endpoints. RTK Query would also work, but it felt unnecessary for this assignment.

---

## Data Normalization

The mock API returns inconsistent values, so I normalize everything before storing it in Redux.

During normalization:

- Different status formats are mapped to a common status.
- Unknown task types are stored as `"unknown"` instead of being discarded.
- `annotationCount` is always converted to a number.
- `updatedAt` is converted to epoch milliseconds.

If a task doesn't have a valid id, it is skipped because it can't be stored safely in the entity adapter.

---

## Task Updates

REST is used for the initial data load.

After that, WebSocket events update only the fields that change instead of replacing the entire task.

If a WebSocket event references a task that hasn't been loaded yet, the app fetches that task once and stores it.

---

## Filtering and Sorting

The mock server only supports pagination.

Search, filtering, sorting, and table pagination are handled on the client using memoized selectors.

Loaded pages are merged into the store so filters work across all loaded tasks.

---

## Streamed Summary

Task summaries are streamed using Server-Sent Events.

The markdown is rendered with `react-markdown`.

Raw HTML is parsed using `rehype-raw` and sanitized using `rehype-sanitize` before rendering so injected scripts cannot execute.

Switching to another task closes the previous stream before opening a new one.

---

## Caching

The latest loaded tasks are stored in IndexedDB using `localforage`.

Cached data is shown immediately on startup while the application fetches fresh data in the background.

---

## Future Improvements

If this project were extended, I would consider:

- Virtualized table for large datasets
- Optimistic updates for task assignment
- Caching summaries per task
- Retry option for failed background fetches

---

## AI Usage

I used AI to speed up the initial implementation and boilerplate generation.

After that, I reviewed the code, cleaned it up, verified the application manually, and made changes where needed. I also tested the REST API, WebSocket updates, streamed summaries, and the included unit tests to make sure everything worked correctly.

---

# Part 2 – Bug Fixes

### A. Timer update

The interval callback captured an old value of `tick`, so the counter stopped updating correctly.

Fixed by using the functional state update.

---

### B1. Invalid request on mount

The component tried to fetch a task before any task was selected.

Added a guard for `selectedId`.

---

### B2. Duplicate updates / stale responses

A slow response from an older request could overwrite a newer selection.

Added cleanup logic and avoided mutating the existing state array.

---

### B3. Duplicate tasks

Selecting the same task multiple times created duplicate rows.

Now the existing task is replaced instead of appended.

---

### C. Sorting

`Array.sort()` mutates the original array.

Sorting is now performed on a copied array.

---

### D. React keys

The component used the array index as the key.

Replaced it with `task.id` so React can correctly identify each row.