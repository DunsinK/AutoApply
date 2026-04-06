export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  placeholder: string;
  value: string;
  selector: string;
}

export type Message =
  | { type: "DETECT_FIELDS" }
  | { type: "FIELDS_DETECTED"; payload: FormField[] }
  | { type: "FILL_FORM"; payload: Record<string, string> }
  | { type: "FILL_COMPLETE"; payload: { filled: number } }
  | { type: "GET_STATUS" }
  | { type: "STATUS"; payload: { backend: boolean; ollama: boolean } }
  | {
      type: "GENERATE_ANSWERS";
      payload: { fields: FormField[]; jobDescription?: string };
    }
  | { type: "ANSWERS_READY"; payload: Record<string, string> }
  | { type: "ERROR"; payload: string };

export async function sendMessage<T = unknown>(message: Message): Promise<T> {
  return chrome.runtime.sendMessage(message);
}

export async function sendTabMessage<T = unknown>(
  tabId: number,
  message: Message
): Promise<T> {
  return chrome.tabs.sendMessage(tabId, message);
}
