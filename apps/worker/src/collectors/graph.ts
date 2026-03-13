import { db, connectors, collectionJobs } from '@guardiboard/db';
import { eq, and } from 'drizzle-orm';

export interface GraphCollectorConfig {
  tenantId: string;
  connectorId: string;
  accessToken: string;
}

export interface CollectResult {
  success: boolean;
  itemsCollected: number;
  error?: string;
  checkpoint?: string;
}

export class GraphCollector {
  private tenantId: string;
  private connectorId: string;
  private accessToken: string;
  private baseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(config: GraphCollectorConfig) {
    this.tenantId = config.tenantId;
    this.connectorId = config.connectorId;
    this.accessToken = config.accessToken;
  }

  private async request<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Graph API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }

  async collectOrganization(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/organization');
      
      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'organization',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: data.value?.length || 0 };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async collectUsers(): Promise<CollectResult> {
    try {
      const users: any[] = [];
      let nextLink: string | undefined = '/users?$select=id,displayName,userPrincipalName,accountEnabled,createdDateTime,userType,assignedLicenses,onPremisesSyncEnabled&$top=999';

      while (nextLink) {
        const endpoint: string = nextLink.startsWith('http') 
          ? nextLink.replace('https://graph.microsoft.com/v1.0', '') 
          : nextLink;
        
        const data: any = await this.request(endpoint);
        users.push(...(data.value || []));
        nextLink = data['@odata.nextLink'];
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'users',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: users.length };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async collectGroups(): Promise<CollectResult> {
    try {
      const groups: any[] = [];
      let nextLink: string | undefined = '/groups?$select=id,displayName,groupTypes,securityEnabled,mailEnabled,onPremisesSyncEnabled&$top=999';

      while (nextLink) {
        const endpoint: string = nextLink.startsWith('http') 
          ? nextLink.replace('https://graph.microsoft.com/v1.0', '') 
          : nextLink;
        
        const data: any = await this.request(endpoint);
        groups.push(...(data.value || []));
        nextLink = data['@odata.nextLink'];
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'groups',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: groups.length };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async collectDirectoryRoles(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/directoryRoles');
      
      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'directoryRoles',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: data.value?.length || 0 };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async collectConditionalAccess(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/identity/conditionalAccess/policies');
      
      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'conditionalAccess',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: data.value?.length || 0 };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async collectSecureScore(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/security/secureScores');
      
      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'secureScore',
        itemsCollected: true,
        completedAt: new Date(),
      });

      return { success: true, itemsCollected: data.value?.length || 0 };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, error: error.message };
    }
  }

  async runFullCollection(): Promise<CollectResult[]> {
    const results: CollectResult[] = [];

    console.log(`[GraphCollector] Starting full collection for tenant ${this.tenantId}`);

    results.push(await this.collectOrganization());
    results.push(await this.collectUsers());
    results.push(await this.collectGroups());
    results.push(await this.collectDirectoryRoles());
    results.push(await this.collectConditionalAccess());
    results.push(await this.collectSecureScore());

    const successCount = results.filter(r => r.success).length;
    console.log(`[GraphCollector] Completed ${successCount}/${results.length} collections`);

    return results;
  }
}

export async function getActiveConnectors() {
  return db
    .select()
    .from(connectors)
    .where(
      and(
        eq(connectors.status, 'authorized'),
        eq(connectors.type, 'microsoft_graph')
      )
    );
}
