type Payload = {
  prompt: string;
  context: any;
};

const promptEl: HTMLTextAreaElement = document.getElementById("prompt") as HTMLTextAreaElement;
const sendBtn: HTMLButtonElement = document.getElementById("send") as HTMLButtonElement;
const outputEl: HTMLElement = document.getElementById("output") as HTMLElement;

sendBtn.addEventListener("click", async (): Promise<void> => {
  const ctx: any = await browser.runtime.sendMessage({ type: "getComposeContext" });
  const payload: Payload = {
    prompt: promptEl.value,
    context: ctx,
  };
  outputEl.textContent = JSON.stringify(payload, null, 2);
  alert(JSON.stringify(payload, null, 2));
});
