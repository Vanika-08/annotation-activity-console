import { makeStore, type AppStore } from "@/store";
import { hydrateFromCache } from "@/store/slices/tasksSlice";
import { setFilterStatus, setFilterType, setSearch } from "@/store/slices/uiSlice";
import { selectFilteredTasks, selectPagedTasks } from "@/store/selectors";
import { task } from "@/lib/__tests__/fixtures";

function seed(store: AppStore) {
  store.dispatch(
    hydrateFromCache({
      page: 1,
      pageSize: 50,
      total: 3,
      items: [
        task({ id: "t1", title: "Cat photo review", type: "image", status: "todo" }),
        task({ id: "t2", title: "Podcast transcript", type: "audio", status: "in_progress" }),
        task({ id: "t3", title: "Article summary", type: "text", status: "done" }),
      ],
    })
  );
}

describe("selectFilteredTasks", () => {
  let store: AppStore;

  beforeEach(() => {
    store = makeStore();
    seed(store);
  });

  it("returns all tasks with no filters applied", () => {
    expect(selectFilteredTasks(store.getState())).toHaveLength(3);
  });

  it("filters by type", () => {
    store.dispatch(setFilterType("audio"));
    const result = selectFilteredTasks(store.getState());
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("t2");
  });

  it("filters by status", () => {
    store.dispatch(setFilterStatus("done"));
    const result = selectFilteredTasks(store.getState());
    expect(result.map((t) => t.id)).toEqual(["t3"]);
  });

  it("filters by case-insensitive title search", () => {
    store.dispatch(setSearch("cat"));
    const result = selectFilteredTasks(store.getState());
    expect(result.map((t) => t.id)).toEqual(["t1"]);
  });

  it("combines filters, and selectPagedTasks reflects the same filtered set", () => {
    store.dispatch(setFilterType("text"));
    store.dispatch(setSearch("summary"));
    expect(selectFilteredTasks(store.getState()).map((t) => t.id)).toEqual(["t3"]);
    expect(selectPagedTasks(store.getState()).map((t) => t.id)).toEqual(["t3"]);
  });
});
