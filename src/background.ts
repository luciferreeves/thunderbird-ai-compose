type Identity = {
  id?: string;
  email?: string;
  name?: string;
};

type ComposeContext = {
  account: Identity;
  compose: {
    subject?: string;
    to?: string[];
    cc?: string[];
    bcc?: string[];
    bodyPlain?: string;
    bodyHTML?: string;
    identityId?: string;
  };
};

async function getComposeContext(): Promise<ComposeContext> {
  const data: ComposeContext = { account: {}, compose: {} };

  try {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (!tabId) return data;

    const details: any = await (browser as any).compose.getComposeDetails(tabId);

    data.compose.subject = details?.subject ?? "";
    data.compose.to = details?.to ?? [];
    data.compose.cc = details?.cc ?? [];
    data.compose.bcc = details?.bcc ?? [];
    data.compose.identityId = details?.identityId ?? undefined;
    data.compose.bodyPlain = details?.plainTextBody ?? "";
    data.compose.bodyHTML = details?.body ?? "";

    const accounts: any[] = (browser as any).accounts?.list
      ? await (browser as any).accounts.list()
      : [];

    if (data.compose.identityId) {
      for (const acc of accounts) {
        for (const ident of acc.identities) {
          if (ident.id === data.compose.identityId) {
            data.account = {
              id: ident.id,
              email: ident.email,
              name: ident.name,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("getComposeContext failed:", err);
  }

  return data;
}

// Handle requests from popup/options
browser.runtime.onMessage.addListener(async (message: any) => {
  if (message?.type === "getComposeContext") {
    return await getComposeContext();
  }
  return { error: "unknown message" };
});
