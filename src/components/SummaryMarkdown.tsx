"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { useStreamedSummary } from "@/hooks/useStreamedSummary";

// Render path: react-markdown -> rehype-raw (parse embedded HTML) ->
// rehype-sanitize (strip <script> and on* handlers). Sanitize has to run
// after raw parsing, and nothing here uses dangerouslySetInnerHTML.
const sanitizeSchema = {
  ...defaultSchema,
  // Default schema already strips <script> and on* handlers.
};

export function SummaryMarkdown({ taskId }: { taskId: string | null }) {
  const { text, status, error } = useStreamedSummary(taskId);

  if (!taskId) {
    return (
      <p className="text-sm text-gray-400">
        Select a task to load its summary.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
        {status === "streaming" && (
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            streaming…
          </span>
        )}
        {status === "done" && (
          <span className="text-green-600">stream complete</span>
        )}
        {status === "error" && (
          <span className="text-red-600" role="alert">
            {error ?? "stream error"}
          </span>
        )}
      </div>
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
          components={{
            img: () => null,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
      {text.length === 0 && status === "streaming" && (
        <p className="text-sm text-gray-400">Waiting for first chunk…</p>
      )}
    </div>
  );
}
