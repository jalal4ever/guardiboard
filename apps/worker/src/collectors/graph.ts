import { db, collectionJobs, rawDocuments, identityUsers, identityGroups, secureScores, findings, connectors } from '@guardiboard/db';
import { eq, and } from 'drizzle-orm';

export interface GraphCollectorConfig {
  tenantId: string;
  connectorId: string;
  accessToken: string;
}

export interface CollectResult {
  success: boolean;
  itemsCollected: number;
  resourceType: string;
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

  private async storeRawDocument(resourceType: string, data: any): Promise<void> {
    try {
      await db.insert(rawDocuments).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        resourceType,
        graphId: data.id || null,
        payload: data,
        collectedAt: new Date(),
      }).onConflictDoNothing();
    } catch (error) {
      console.warn(`Failed to store raw document for ${resourceType}:`, error);
    }
  }

  async collectOrganization(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/organization');
      
      for (const org of data.value || []) {
        await this.storeRawDocument('organization', org);
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'organization',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: data.value?.length || 0, resourceType: 'organization' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'organization', error: error.message };
    }
  }

  async collectUsers(): Promise<CollectResult> {
    try {
      const users: any[] = [];
      let nextLink: string | undefined = '/users?$select=id,displayName,userPrincipalName,accountEnabled,createdDateTime,userType,assignedLicenses,onPremisesSyncEnabled,mobilePhone,mail,department,jobTitle&$top=999';

      while (nextLink) {
        const endpoint: string = nextLink.startsWith('http') 
          ? nextLink.replace('https://graph.microsoft.com/v1.0', '') 
          : nextLink;
        
        const data: any = await this.request(endpoint);
        users.push(...(data.value || []));
        nextLink = data['@odata.nextLink'];
      }

      for (const user of users) {
        await this.storeRawDocument('users', user);

        await db
          .insert(identityUsers)
          .values({
            tenantId: this.tenantId,
            source: 'microsoft_graph',
            sourceId: user.id,
            displayName: user.displayName,
            userPrincipalName: user.userPrincipalName,
            accountEnabled: user.accountEnabled,
            createdDateTime: user.createdDateTime ? new Date(user.createdDateTime) : null,
            userType: user.userType,
            onPremisesSyncEnabled: user.onPremisesSyncEnabled,
            raw: user,
            lastSeenAt: new Date(),
          })
          .onConflictDoNothing();
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'users',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: users.length, resourceType: 'users' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'users', error: error.message };
    }
  }

  async collectGroups(): Promise<CollectResult> {
    try {
      const groups: any[] = [];
      let nextLink: string | undefined = '/groups?$select=id,displayName,groupTypes,securityEnabled,mailEnabled,onPremisesSyncEnabled,description,mailEnabled&$top=999';

      while (nextLink) {
        const endpoint: string = nextLink.startsWith('http') 
          ? nextLink.replace('https://graph.microsoft.com/v1.0', '') 
          : nextLink;
        
        const data: any = await this.request(endpoint);
        groups.push(...(data.value || []));
        nextLink = data['@odata.nextLink'];
      }

      for (const group of groups) {
        await this.storeRawDocument('groups', group);

        await db
          .insert(identityGroups)
          .values({
            tenantId: this.tenantId,
            source: 'microsoft_graph',
            sourceId: group.id,
            displayName: group.displayName,
            groupTypes: group.groupTypes || [],
            securityEnabled: group.securityEnabled,
            mailEnabled: group.mailEnabled,
            raw: group,
            lastSeenAt: new Date(),
          })
          .onConflictDoNothing();
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'groups',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: groups.length, resourceType: 'groups' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'groups', error: error.message };
    }
  }

  async collectDirectoryRoles(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/directoryRoles');
      
      for (const role of data.value || []) {
        await this.storeRawDocument('directoryRoles', role);
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'directoryRoles',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: data.value?.length || 0, resourceType: 'directoryRoles' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'directoryRoles', error: error.message };
    }
  }

  async collectConditionalAccess(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/identity/conditionalAccess/policies');
      
      for (const policy of data.value || []) {
        await this.storeRawDocument('conditionalAccess', policy);
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'conditionalAccess',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: data.value?.length || 0, resourceType: 'conditionalAccess' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'conditionalAccess', error: error.message };
    }
  }

  async collectSecureScore(): Promise<CollectResult> {
    try {
      const data = await this.request<any>('/security/secureScores?$top=1');
      
      if (data.value && data.value.length > 0) {
        const score = data.value[0];
        await this.storeRawDocument('secureScores', score);

        await db
          .insert(secureScores)
          .values({
            tenantId: this.tenantId,
            score: score.score?.toString() || '0',
            maxScore: score.maxScore?.toString() || '100',
            vendorName: 'Microsoft',
            createdAt: new Date(),
          })
          .onConflictDoNothing();

        await this.generateFindingsFromSecureScore(score);
      }

      await db.insert(collectionJobs).values({
        tenantId: this.tenantId,
        connectorId: this.connectorId,
        status: 'completed',
        resourceType: 'secureScore',
        itemsCollected: true,
        completedAt: new Date(),
      }).onConflictDoNothing();

      return { success: true, itemsCollected: 1, resourceType: 'secureScore' };
    } catch (error: any) {
      return { success: false, itemsCollected: 0, resourceType: 'secureScore', error: error.message };
    }
  }

  private async generateFindingsFromSecureScore(score: any): Promise<void> {
    const currentScore = parseFloat(score.score) || 0;
    const maxScore = parseFloat(score.maxScore) || 100;
    const percentage = (currentScore / maxScore) * 100;

    if (percentage < 30) {
      await db.insert(findings).values({
        tenantId: this.tenantId,
        scope: 'm365',
        severity: 'critical',
        status: 'open',
        title: 'Secure Score tres bas',
        description: `Le score de securite Microsoft est de ${percentage.toFixed(1)}%, ce qui indique un niveau de protection insuffisant.`,
        source: 'microsoft_graph',
        assetType: 'tenant',
        assetId: this.tenantId,
        recommendation: 'Revoir les recommandations Microsoft Secure Score et implenter les actions correctives prioritaires.',
      }).onConflictDoNothing();
    } else if (percentage < 50) {
      await db.insert(findings).values({
        tenantId: this.tenantId,
        scope: 'm365',
        severity: 'high',
        status: 'open',
        title: 'Secure Score faible',
        description: `Le score de securite Microsoft est de ${percentage.toFixed(1)}%.`,
        source: 'microsoft_graph',
        assetType: 'tenant',
        assetId: this.tenantId,
        recommendation: 'Consulter les recommendations Microsoft pour ameliorer le score.',
      }).onConflictDoNothing();
    }
  }

  async collectAllResources(): Promise<CollectResult[]> {
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

export async function collectAllResources(collector: GraphCollector): Promise<CollectResult[]> {
  return collector.collectAllResources();
}

export async function getActiveGraphConnectors() {
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
