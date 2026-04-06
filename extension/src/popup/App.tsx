import { useEffect, useState } from "react";
import type { FormField, Message } from "../lib/messaging";

interface Status {
  backend: boolean;
  ollama: boolean;
}

export default function App() {
  const [status, setStatus] = useState<Status>({
    backend: false,
    ollama: false,
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_STATUS" }).then((res: Message) => {
      if (res?.type === "STATUS") setStatus(res.payload);
    });
  }, []);

  async function handleDetect() {
    setMessage("");
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    const res: Message = await chrome.tabs.sendMessage(tab.id, {
      type: "DETECT_FIELDS",
    });

    if (res?.type === "FIELDS_DETECTED") {
      setFields(res.payload);
      setMessage(`Found ${res.payload.length} field(s)`);
    }
  }

  async function handleAutofill() {
    if (fields.length === 0) {
      setMessage("Detect fields first");
      return;
    }

    setLoading(true);
    setMessage("Generating answers with Ollama...");

    const res: Message = await chrome.runtime.sendMessage({
      type: "GENERATE_ANSWERS",
      payload: { fields },
    });

    if (res?.type === "ANSWERS_READY") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        setLoading(false);
        return;
      }

      const fillRes: Message = await chrome.tabs.sendMessage(tab.id, {
        type: "FILL_FORM",
        payload: res.payload,
      });

      if (fillRes?.type === "FILL_COMPLETE") {
        setMessage(`Filled ${fillRes.payload.filled} field(s)`);
      }
    } else if (res?.type === "ERROR") {
      setMessage(res.payload);
    }

    setLoading(false);
  }

  return (
    <div className="popup">
      <header className="header">
        <h1>AutoApply</h1>
        <span className="version">v0.1.0</span>
      </header>

      <div className="status-bar">
        <StatusDot label="Backend" ok={status.backend} />
        <StatusDot label="Ollama" ok={status.ollama} />
      </div>

      <div className="actions">
        <button onClick={handleDetect} disabled={loading}>
          Detect Fields
        </button>
        <button
          className="primary"
          onClick={handleAutofill}
          disabled={loading || fields.length === 0}
        >
          {loading ? "Filling..." : `Autofill${fields.length > 0 ? ` (${fields.length})` : ""}`}
        </button>
      </div>

      {fields.length > 0 && (
        <div className="fields-preview">
          <h3>Detected Fields</h3>
          <ul>
            {fields.slice(0, 8).map((f) => (
              <li key={f.selector}>
                <span className="field-label">
                  {f.label || f.name || f.placeholder || f.id}
                </span>
                <span className="field-type">{f.type}</span>
              </li>
            ))}
            {fields.length > 8 && (
              <li className="more">+{fields.length - 8} more</li>
            )}
          </ul>
        </div>
      )}

      {message && <div className="toast">{message}</div>}

      <footer className="footer">
        Powered by <strong>Ollama</strong> &mdash; your data stays local
      </footer>
    </div>
  );
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="status-dot">
      <span className={`dot ${ok ? "green" : "red"}`} />
      {label}
    </div>
  );
}
