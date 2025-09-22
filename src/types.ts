export interface Identity {
  id?: string;
  email?: string;
  name?: string;
}

export interface ComposeDetails {
  subject?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  bodyPlain?: string;
  bodyHTML?: string;
  identityId?: string;
  isHtml?: boolean;
}

export interface ComposeContext {
  account: Identity;
  compose: ComposeDetails;
}
