/**
 * sseClient.ts
 *
 * A lightweight Server-Sent Events (SSE) client for React Native that uses
 * XMLHttpRequest (which supports `onprogress` streaming in RN) instead of
 * the Fetch/ReadableStream API that isn't available on Hermes/JSC.
 */

export interface SSEOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  onopen?: (status: number, headers: string) => void;
  onmessage?: (event: { event: string; data: string; id?: string }) => void;
  onerror?: (error: Error) => void;
  onclose?: () => void;
}

/**
 * Opens an SSE connection using XMLHttpRequest.
 * Returns a cleanup function to abort manually (also respects AbortSignal).
 */
export function fetchEventSourceRN(
  url: string,
  options: SSEOptions,
): Promise<void> {
  const {
    method = "POST",
    headers = {},
    body,
    signal,
    onopen,
    onmessage,
    onerror,
    onclose,
  } = options;

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let lastIndex = 0; // Tracks how far we've read in responseText

    // If the caller already aborted, bail immediately.
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    // Wire up abort signal.
    const onAbort = () => {
      xhr.abort();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort);

    xhr.open(method, url);

    // Set headers.
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Crucial for streaming in React Native:
    // @ts-ignore — RN-specific property
    xhr.responseType = "text";

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
        if (xhr.status >= 200 && xhr.status < 300) {
          onopen?.(xhr.status, xhr.getAllResponseHeaders());
        } else {
          const err = new Error(`Server responded with ${xhr.status}`);
          onerror?.(err);
          xhr.abort();
          reject(err);
        }
      }
    };

    xhr.onprogress = () => {
      // Read the new chunk from responseText since last read.
      const newText = xhr.responseText.substring(lastIndex);
      lastIndex = xhr.responseText.length;

      if (newText) {
        console.log("📥 Received SSE chunk:", newText);
        parseSSEChunk(newText, onmessage);
      }
    };

    xhr.onload = () => {
      // Process any remaining data.
      const remaining = xhr.responseText.substring(lastIndex);
      if (remaining) {
        parseSSEChunk(remaining, onmessage);
      }
      signal?.removeEventListener("abort", onAbort);
      onclose?.();
      resolve();
    };

    xhr.onerror = () => {
      signal?.removeEventListener("abort", onAbort);
      const err = new Error("Network request failed");
      onerror?.(err);
      reject(err);
    };

    xhr.ontimeout = () => {
      signal?.removeEventListener("abort", onAbort);
      const err = new Error("Request timed out");
      onerror?.(err);
      reject(err);
    };

    xhr.send(body ?? null);
  });
}

// ─── SSE Text Parser ──────────────────────────────────────────────────────────

// Buffer for partial lines across chunks.
let _lineBuffer = "";

/**
 * Parses raw SSE text (potentially arriving in arbitrary chunks) and invokes
 * the callback for each complete event.
 */
function parseSSEChunk(
  chunk: string,
  onmessage?: SSEOptions["onmessage"],
): void {
  // Prepend any leftover from the previous chunk.
  const text = _lineBuffer + chunk;
  const lines = text.split("\n");

  // The last element might be an incomplete line — buffer it.
  _lineBuffer = lines.pop() ?? "";

  let currentEvent = "";
  let currentData = "";
  let currentId: string | undefined;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, ""); // strip CR

    if (line === "") {
      // Empty line = end of an event block; dispatch.
      if (currentData) {
        console.log(
          "📤 Dispatching SSE message - event:",
          currentEvent,
          "data:",
          currentData,
        );
        onmessage?.({
          event: currentEvent || "message",
          data: currentData,
          id: currentId,
        });
      }
      currentEvent = "";
      currentData = "";
      currentId = undefined;
      continue;
    }

    if (line.startsWith(":")) {
      // Comment line — ignore.
      continue;
    }

    const colonIdx = line.indexOf(":");
    let field: string;
    let value: string;

    if (colonIdx === -1) {
      field = line;
      value = "";
    } else {
      field = line.substring(0, colonIdx);
      // Skip optional space after colon.
      value =
        line[colonIdx + 1] === " "
          ? line.substring(colonIdx + 2)
          : line.substring(colonIdx + 1);
    }

    switch (field) {
      case "event":
        currentEvent = value;
        break;
      case "data":
        currentData = currentData ? currentData + "\n" + value : value;
        break;
      case "id":
        currentId = value;
        break;
      // 'retry' is intentionally ignored for now.
    }
  }
}

/**
 * Call this before starting a new SSE session to reset the internal
 * line buffer (e.g. when a previous stream was aborted mid-chunk).
 */
export function resetSSEParser(): void {
  _lineBuffer = "";
}
