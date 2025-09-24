import { ComposeContext } from "../types";

interface Payload {
  prompt: string;
  context: ComposeContext;
}

interface Settings {
  proxyEndpoint?: string;
  proxyToken?: string;
}

function getElements(): {
  promptEl: HTMLTextAreaElement;
  sendBtn: HTMLButtonElement;
  spinner: HTMLElement;
} {
  return {
    promptEl: document.getElementById("prompt") as HTMLTextAreaElement,
    sendBtn: document.getElementById("send") as HTMLButtonElement,
    spinner: document.getElementById("spinner") as HTMLElement,
  };
}

async function getActiveComposeTabId(): Promise<number | undefined> {
  const tabs: browser.tabs.Tab[] = (await browser.tabs.query({
    active: true,
    currentWindow: true,
  })) as browser.tabs.Tab[];
  return tabs[0]?.id;
}

function insertAtReply(body: string, aiText: string, isHtml: boolean): string {
  if (isHtml) {
    const parser: DOMParser = new DOMParser();
    const doc: Document = parser.parseFromString(body, "text/html");
    const paragraphs: NodeListOf<HTMLParagraphElement> = doc.querySelectorAll("body > p");
    for (const p of Array.from(paragraphs)) {
      if (p.textContent && p.textContent.trim().length > 0) {
        p.insertAdjacentHTML("afterend", aiText);
        return doc.body.innerHTML;
      }
    }
    const citeDiv: HTMLElement | null = doc.querySelector("div.moz-cite-prefix");
    if (citeDiv) {
      citeDiv.insertAdjacentHTML("beforebegin", aiText);
      return doc.body.innerHTML;
    }
    doc.body.insertAdjacentHTML("afterbegin", aiText);
    return doc.body.innerHTML;
  } else {
    const replyEnd: number = body.indexOf("\nOn ");
    if (replyEnd !== -1) {
      return body.slice(0, replyEnd).trimEnd() + "\n" + aiText + "\n" + body.slice(replyEnd);
    }
    return aiText + "\n\n" + body;
  }
}

async function handleInsert(): Promise<void> {
  const { promptEl, sendBtn, spinner } = getElements();
  spinner.style.display = "block";
  sendBtn.disabled = true;
  promptEl.disabled = true;

  const ctx: ComposeContext = (await browser.runtime.sendMessage({
    type: "getComposeContext",
  })) as ComposeContext;

  const payload: Payload = {
    prompt: promptEl.value,
    context: ctx,
  };

  const settings: Settings = await browser.storage.local.get(["proxyEndpoint", "proxyToken"]);
  if (!settings.proxyEndpoint) {
    alert("Proxy endpoint is not configured in settings.");
    spinner.style.display = "none";
    sendBtn.disabled = promptEl.value.trim().length === 0;
    promptEl.disabled = false;
    return;
  }

  const tabId: number | undefined = await getActiveComposeTabId();
  if (tabId === undefined) {
    alert("No active compose tab.");
    spinner.style.display = "none";
    sendBtn.disabled = promptEl.value.trim().length === 0;
    promptEl.disabled = false;
    return;
  }

  let aiResult: string;
  try {
    const res: Response = await fetch(settings.proxyEndpoint + "/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(settings.proxyToken ? { Authorization: `Bearer ${settings.proxyToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Server responded with ${res.status}`);
    }

    const data: { response?: string } = (await res.json()) as { response?: string };
    if (!data.response) {
      throw new Error("No response field in server reply.");
    }
    aiResult = data.response;
  } catch (err) {
    alert("Failed to fetch AI response: " + (err as Error).message);
    spinner.style.display = "none";
    sendBtn.disabled = promptEl.value.trim().length === 0;
    promptEl.disabled = false;
    return;
  }

  const isHtml: boolean =
    ctx.compose.isHtml ?? Boolean(ctx.compose.bodyHTML && ctx.compose.bodyHTML.trim());
  const oldBody: string = isHtml ? (ctx.compose.bodyHTML ?? "") : (ctx.compose.bodyPlain ?? "");
  const newBody: string = insertAtReply(oldBody, aiResult, isHtml);

  await (browser as any).compose.setComposeDetails(tabId, { body: newBody });

  spinner.style.display = "none";
  sendBtn.disabled = promptEl.value.trim().length === 0;
  promptEl.disabled = false;
}

const { sendBtn, promptEl } = getElements();
sendBtn.addEventListener("click", (): void => {
  handleInsert().catch((err: unknown): void => {
    console.error("Popup insert failed:", err);
    alert("Error inserting text. See console for details.");
  });
});
promptEl.addEventListener("input", (): void => {
  sendBtn.disabled = promptEl.value.trim().length === 0;
});
