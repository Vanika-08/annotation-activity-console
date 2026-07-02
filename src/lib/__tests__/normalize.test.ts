import { normalizeTask, normalizeTasksResponse } from "@/lib/normalize";
import type { NormalizationWarning } from "@/types/task";
import { rawTask } from "./fixtures";

describe("normalizeTask", () => {
  it("normalizes inconsistent status casing/spelling", () => {
    const warnings: NormalizationWarning[] = [];
    expect(normalizeTask(rawTask({ status: "InProgress" }), warnings)?.status).toBe(
      "in_progress"
    );
    expect(normalizeTask(rawTask({ status: "QA" }), warnings)?.status).toBe("qa");
    expect(normalizeTask(rawTask({ status: "BLOCKED" }), warnings)?.status).toBe(
      "blocked"
    );
  });

  it("coerces an unrecognized status to unknown and records a warning, without dropping the task", () => {
    const warnings: NormalizationWarning[] = [];
    const result = normalizeTask(rawTask({ status: "totally-bogus" }), warnings);
    expect(result).not.toBeNull();
    expect(result?.status).toBe("unknown");
    expect(result?.rawStatus).toBe("totally-bogus");
    expect(warnings.some((w) => w.field === "status")).toBe(true);
  });

  it("coerces an unrecognized type to the unknown variant and preserves rawType", () => {
    const warnings: NormalizationWarning[] = [];
    const result = normalizeTask(rawTask({ type: "video" }), warnings);
    expect(result?.type).toBe("unknown");
    if (result?.type === "unknown") {
      expect(result.rawType).toBe("video");
    } else {
      throw new Error("expected unknown-type task");
    }
  });

  it("parses a stringified annotationCount into a number", () => {
    const warnings: NormalizationWarning[] = [];
    const result = normalizeTask(rawTask({ annotationCount: "42" }), warnings);
    expect(result?.annotationCount).toBe(42);
    expect(typeof result?.annotationCount).toBe("number");
  });

  it("normalizes both ISO-string and epoch-ms updatedAt to the same epoch-ms value", () => {
    const warnings: NormalizationWarning[] = [];
    const ms = 1719600000000;
    const fromMs = normalizeTask(rawTask({ updatedAt: ms }), warnings);
    const fromIso = normalizeTask(
      rawTask({ updatedAt: new Date(ms).toISOString() }),
      warnings
    );
    expect(fromMs?.updatedAt).toBe(ms);
    expect(fromIso?.updatedAt).toBe(ms);
  });

  it("keeps a null assignee as null rather than throwing", () => {
    const warnings: NormalizationWarning[] = [];
    const result = normalizeTask(rawTask({ assignee: null }), warnings);
    expect(result?.assignee).toBeNull();
  });

  it("drops a task with a missing id and records why, instead of throwing", () => {
    const warnings: NormalizationWarning[] = [];
    const result = normalizeTask(rawTask({ id: undefined as unknown as string }), warnings);
    expect(result).toBeNull();
    expect(warnings.some((w) => w.field === "id")).toBe(true);
  });
});

describe("normalizeTasksResponse", () => {
  it("normalizes a full page and aggregates warnings without throwing on messy rows", () => {
    const { data, warnings } = normalizeTasksResponse({
      page: 1,
      pageSize: 2,
      total: 2,
      items: [
        rawTask({ id: "a", status: "InProgress", annotationCount: "5" }),
        rawTask({ id: "b", type: "video", status: "weird-status" }),
      ],
    });
    expect(data.items).toHaveLength(2);
    expect(data.items[0]?.status).toBe("in_progress");
    expect(data.items[1]?.type).toBe("unknown");
    expect(warnings.length).toBeGreaterThan(0);
  });
});
