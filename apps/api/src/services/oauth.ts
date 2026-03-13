import { randomBytes, createHash } from 'crypto';
import { requireEnv } from '@guardiboard/config';

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthState {
  tenantId?: string;
  returnTo?: string;
  nonce: string;
  createdAt: Date;
}

const stateStore = new Map<string, OAuthState>();

export function getMicrosoftOAuthConfig(): OAuthProvider {
  const tenantId = requireEnv('AZURE_TENANT_ID');
  const clientId = requireEnv('AZURE_CLIENT_ID');
  const clientSecret = requireEnv('AZURE_CLIENT_SECRET');
  const redirectUri = process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

  const tenant = tenantId || 'common';

  return {
    name: 'microsoft',
    clientId,
    clientSecret,
    authorizationEndpoint: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    redirectUri,
    scopes: [
      'openid',
      'profile',
      'email',
      'User.Read',
    ],
  };
}

export function generateState(tenantId?: string, returnTo?: string): string {
  const nonce = randomBytes(32).toString('hex');
  const state = Buffer.from(JSON.stringify({
    tenantId,
    returnTo,
    nonce,
    createdAt: new Date().toISOString(),
  })).toString('base64url');

  stateStore.set(nonce, { nonce, createdAt: new Date() });
  
  setTimeout(() => {
    stateStore.delete(nonce);
  }, 10 * 60 * 1000);

  return state;
}

export function verifyState(state: string): OAuthState | null {
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString());
    
    if (!decoded.nonce || !stateStore.has(decoded.nonce)) {
      return null;
    }

    const stored = stateStore.get(decoded.nonce);
    if (!stored) {
      return null;
    }

    stateStore.delete(decoded.nonce);

    const createdAt = new Date(decoded.createdAt);
    const now = new Date();
    const diff = now.getTime() - createdAt.getTime();
    
    if (diff > 10 * 60 * 1000) {
      return null;
    }

    return {
      tenantId: decoded.tenantId,
      returnTo: decoded.returnTo,
      nonce: decoded.nonce,
      createdAt,
    };
  } catch {
    return null;
  }
}

export function getAuthorizationUrl(config: OAuthProvider, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state,
    response_mode: 'query',
    nonce: createHash('sha256').update(state).digest('hex'),
  });

  return `${config.authorizationEndpoint}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export async function exchangeCodeForTokens(
  config: OAuthProvider,
  code: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: config.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${response.status} - ${error}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export async function refreshAccessToken(
  config: OAuthProvider,
  refreshToken: string
): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${response.status} - ${error}`);
  }

  return response.json() as Promise<TokenResponse>;
}

export interface UserInfo {
  id: string;
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
}

export async function getMicrosoftUserInfo(accessToken: string): Promise<UserInfo> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${response.status} - ${error}`);
  }

  return response.json() as Promise<UserInfo>;
}
