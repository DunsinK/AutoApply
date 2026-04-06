import type { Message, FormField } from "../lib/messaging";

const API_BASE = "http://localhost:8080";

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    switch (message.type) {
      case "GET_STATUS":
        checkStatus().then(sendResponse);
        return true;

      case "GENERATE_ANSWERS":
        generateAnswers(
          message.payload.fields,
          message.payload.jobDescription
        ).then(sendResponse);
        return true;
    }
  }
);

async function checkStatus(): Promise<Message> {
  try {
    const [backendRes, ollamaRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/health`, { method: "GET" }),
      fetch("http://localhost:11434/api/tags", { method: "GET" }),
    ]);

    return {
      type: "STATUS",
      payload: {
        backend: backendRes.status === "fulfilled" && backendRes.value.ok,
        ollama: ollamaRes.status === "fulfilled" && ollamaRes.value.ok,
      },
    };
  } catch {
    return { type: "STATUS", payload: { backend: false, ollama: false } };
  }
}

async function generateAnswers(
  fields: FormField[],
  jobDescription?: string
): Promise<Message> {
  try {
    const res = await fetch(`${API_BASE}/api/autofill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields, jobDescription }),
    });

    if (!res.ok) {
      return { type: "ERROR", payload: `Backend returned ${res.status}` };
    }

    const data = await res.json();
    return { type: "ANSWERS_READY", payload: data };
  } catch {
    return {
      type: "ERROR",
      payload: "Failed to connect to AutoApply backend",
    };
  }
}
