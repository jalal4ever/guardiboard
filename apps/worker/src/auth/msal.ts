import { requireEnv } from '@guardiboard/config';

let cachedToken: { accessToken: string; expiresAt: Date } | null = null;

export interface TokenResult {
  accessToken: string;
  expiresAt: Date;
  scope: string[];
}

async function getTokenEndpoint(): Promise<string> {
  const tenantId = requireEnv('AZURE_TENANT_ID');
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
}

export async function acquireTokenForTenant(azureTenantId: string): Promise<TokenResult> {
  const tenantId = requireEnv('AZURE_TENANT_ID');
  const clientId = requireEnv('AZURE_CLIENT_ID');
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  
  if (!clientSecret) {
    throw new Error('AZURE_CLIENT_SECRET is required');
  }

  if (cachedToken && cachedToken.expiresAt > new Date()) {
    return {
      accessToken: cachedToken.accessToken,
      expiresAt: cachedToken.expiresAt,
      scope: ['https://graph.microsoft.com/.default'],
    };
  }

  const tokenUrl = await getTokenEndpoint();
  
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    tenant: tenantId,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to acquire token: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  const expiresAt = new Date(Date.now() + (data.expires_in - 60) * 1000);
  
  cachedToken = {
    accessToken: data.access_token,
    expiresAt,
  };

  return {
    accessToken: data.access_token,
    expiresAt,
    scope: ['https://graph.microsoft.com/.default'],
  };
}

export async function getValidTokenForConnector(
  connectorId: string,
  azureTenantId: string,
  tokenExpiresAt?: Date
): Promise<TokenResult> {
  if (tokenExpiresAt && tokenExpiresAt > new Date(Date.now() + 60 * 1000)) {
    throw new Error('Token still valid');
  }

  return acquireTokenForTenant(azureTenantId);
}

export const GRAPH_SCOPES = [
  'Organization.Read.All',
  'User.Read.All',
  'Group.Read.All',
  'RoleManagement.Read.Directory',
  'Policy.Read.All',
  'Security.Read.All',
];

export function getRequiredScopes(): string[] {
  return GRAPH_SCOPES;
}
