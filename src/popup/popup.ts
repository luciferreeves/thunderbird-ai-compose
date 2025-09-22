import { ComposeContext } from "../types";

interface Payload {
  prompt: string;
  context: ComposeContext;
}

const promptEl: HTMLTextAreaElement = document.getElementById("prompt") as HTMLTextAreaElement;
const sendBtn: HTMLButtonElement = document.getElementById("send") as HTMLButtonElement;
const outputEl: HTMLElement = document.getElementById("output") as HTMLElement;

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

    let target: HTMLParagraphElement | null = null;
    for (const p of Array.from(paragraphs)) {
      if (p.textContent && p.textContent.trim().length > 0) {
        target = p;
        break;
      }
    }

    if (target) {
      target.insertAdjacentHTML("afterend", aiText);
      return doc.body.innerHTML;
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
  const ctx: ComposeContext = (await browser.runtime.sendMessage({
    type: "getComposeContext",
  })) as ComposeContext;

  const payload: Payload = {
    prompt: promptEl.value,
    context: ctx,
  };

  const tabId: number | undefined = await getActiveComposeTabId();
  if (tabId === undefined) {
    outputEl.textContent = "No active compose tab.";
    return;
  }

  const isHtml: boolean =
    ctx.compose.isHtml ?? Boolean(ctx.compose.bodyHTML && ctx.compose.bodyHTML.trim());
  const aiResult: string = isHtml
    ? "<p>This response will be inserted by AI</p>"
    : "This response will be inserted by AI";

  const replyPrefix: string | undefined =
    ctx.compose.bodyPlain?.split("\n\n")[0].trim() || undefined;
  const oldBody: string = isHtml ? (ctx.compose.bodyHTML ?? "") : (ctx.compose.bodyPlain ?? "");

  const newBody: string = insertAtReply(oldBody, aiResult, isHtml);

  await (browser as any).compose.setComposeDetails(tabId, { body: newBody });

  outputEl.textContent = JSON.stringify(payload, null, 2);
}

sendBtn.addEventListener("click", (): void => {
  handleInsert().catch((err: unknown): void => {
    console.error("Popup insert failed:", err);
    outputEl.textContent = "Error inserting text. See console.";
  });
});
