type Settings = {
  proxyEndpoint?: string;
  proxyToken?: string;
};

const endpointInput: HTMLInputElement = document.getElementById("endpoint") as HTMLInputElement;
const tokenInput: HTMLInputElement = document.getElementById("token") as HTMLInputElement;
const saveBtn: HTMLButtonElement = document.getElementById("save") as HTMLButtonElement;
const msg: HTMLElement = document.getElementById("msg") as HTMLElement;

async function loadSettings(): Promise<void> {
  const settings: Settings = await browser.storage.local.get(["proxyEndpoint", "proxyToken"]);
  endpointInput.value = settings.proxyEndpoint ?? "";
  tokenInput.value = settings.proxyToken ?? "";
}

async function saveSettings(): Promise<void> {
  await browser.storage.local.set({
    proxyEndpoint: endpointInput.value.trim(),
    proxyToken: tokenInput.value.trim(),
  });
  msg.textContent = "Saved!";
  setTimeout(() => (msg.textContent = ""), 2000);
}

saveBtn.addEventListener("click", saveSettings);
loadSettings();
