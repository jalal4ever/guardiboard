import { ConfidentialClientApplication, ClientCredentialRequest, Configuration } from '@azure/msal-node';
import { requireEnv } from '@guardiboard/config';
import fs from 'fs';
import path from 'path';

let msalInstance: ConfidentialClientApplication | null = null;

export interface TokenResult {
  accessToken: string;
  expiresAt: Date;
  scope: string[];
}

export async function getMsalInstance(): Promise<ConfidentialClientApplication> {
  if (msalInstance) {
    return msalInstance;
  }

  const clientId = requireEnv('AZURE_CLIENT_ID');
  const tenantId = requireEnv('AZURE_TENANT_ID');
  const certPath = process.env.AZURE_CLIENT_CERT_PATH;
  const certPassword = process.env.AZURE_CLIENT_CERT_PASSWORD;

  const msalConfig: Configuration = {
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientCapabilities: ['CP1'],
    },
  };

  if (certPath && fs.existsSync(certPath)) {
    msalConfig.auth.clientCertificate = {
      path: certPath,
      password: certPassword,
    };
  } else {
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    if (clientSecret) {
      msalConfig.auth.clientSecret = clientSecret;
    } else {
      throw new Error('Either AZURE_CLIENT_CERT_PATH or AZURE_CLIENT_SECRET must be provided');
    }
  }

  msalInstance = new ConfidentialClientApplication(msalConfig);
  return msalInstance;
}

export async function acquireTokenForTenant(azureTenantId: string): Promise<TokenResult> {
  const msal = await getMsalInstance();
  
  const clientCredentialRequest: ClientCredentialRequest = {
    scopes: ['https://graph.microsoft.com/.default'],
    azureTenantId,
  };

  const result = await msal.acquireTokenByClientCredential(clientCredentialRequest);

  if (!result.accessToken) {
    throw new Error('Failed to acquire access token');
  }

  const expiresAt = new Date(result.expiresOn?.getTime() || Date.now() + 3600 * 1000);

  return {
    accessToken: result.accessToken,
    expiresAt,
    scope: clientCredentialRequest.scopes,
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
