import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/store";
import { hydrateFromCache } from "@/store/slices/tasksSlice";
import { FilterBar } from "@/components/FilterBar";
import { TaskTable } from "@/components/TaskTable";
import { task } from "@/lib/__tests__/fixtures";

function renderWithStore() {
  const store: AppStore = makeStore();
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
  render(
    <Provider store={store}>
      <FilterBar />
      <TaskTable />
    </Provider>
  );
  return store;
}

describe("Task list filtering (FilterBar + TaskTable)", () => {
  it("shows all seeded tasks initially", () => {
    renderWithStore();
    expect(screen.getByText("Cat photo review")).toBeInTheDocument();
    expect(screen.getByText("Podcast transcript")).toBeInTheDocument();
    expect(screen.getByText("Article summary")).toBeInTheDocument();
  });

  it("filters visible rows when the user types in the search box", async () => {
    const user = userEvent.setup();
    renderWithStore();

    const search = screen.getByLabelText("Search tasks by title");
    await user.type(search, "podcast");

    expect(screen.queryByText("Cat photo review")).not.toBeInTheDocument();
    expect(screen.getByText("Podcast transcript")).toBeInTheDocument();
    expect(screen.queryByText("Article summary")).not.toBeInTheDocument();
  });

  it("filters visible rows when the user changes the type dropdown", async () => {
    const user = userEvent.setup();
    renderWithStore();

    await user.selectOptions(screen.getByLabelText(/type/i), "text");

    expect(screen.queryByText("Cat photo review")).not.toBeInTheDocument();
    expect(screen.queryByText("Podcast transcript")).not.toBeInTheDocument();
    expect(screen.getByText("Article summary")).toBeInTheDocument();
  });
});
