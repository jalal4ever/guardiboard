export type Scope = 'hybrid' | 'ad' | 'm365';

export type TenantStatus = 'active' | 'suspended' | 'pending';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  scope: Scope;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = 
  | 'platform_admin'
  | 'tenant_admin'
  | 'analyst'
  | 'viewer';

export interface Membership {
  id: string;
  tenantId: string;
  userId: string;
  role: Role;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export type ConnectorType = 'microsoft_graph' | 'ad_collector';

export type ConnectorStatus = 
  | 'pending'
  | 'authorized'
  | 'collecting'
  | 'error'
  | 'disabled';

export interface Connector {
  id: string;
  tenantId: string;
  type: ConnectorType;
  status: ConnectorStatus;
  config: Record<string, unknown>;
  lastCollectedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 'open' | 'in_progress' | 'resolved' | 'accepted_risk';

export interface Finding {
  id: string;
  tenantId: string;
  scope: Scope;
  severity: FindingSeverity;
  status: FindingStatus;
  title: string;
  description: string;
  source: ConnectorType;
  assetType: string;
  assetId: string;
  recommendation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionJob {
  id: string;
  tenantId: string;
  connectorId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt: Date | null;
  error: string | null;
}

export interface CollectionCheckpoint {
  id: string;
  tenantId: string;
  connectorId: string;
  resourceType: string;
  checkpoint: string;
  lastCollectedAt: Date;
}

export type WidgetType = 
  | 'score_overview'
  | 'score_ad'
  | 'score_m365'
  | 'findings_list'
  | 'findings_by_severity'
  | 'assets_list'
  | 'connectors_status'
  | 'posture_timeline';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface DashboardLayout {
  id: string;
  tenantId: string;
  name: string;
  widgets: WidgetConfig[];
  createdAt: Date;
  updatedAt: Date;
}
