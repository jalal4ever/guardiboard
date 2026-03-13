import { describe, it, expect } from 'vitest';
import {
  createTenantSchema,
  updateTenantSchema,
  createFindingSchema,
  updateFindingSchema,
  connectorTypeSchema,
  findingSeveritySchema,
  findingStatusSchema,
  roleSchema,
  scopeSchema,
  createDashboardSchema,
} from '../index';

describe('Validation Schemas', () => {
  describe('Tenant Schema', () => {
    it('should validate a valid tenant', () => {
      const validTenant = {
        name: 'Acme Corp',
        slug: 'acme-corp',
        scope: 'hybrid',
      };

      const result = createTenantSchema.safeParse(validTenant);
      expect(result.success).toBe(true);
    });

    it('should reject invalid slug format', () => {
      const invalidTenant = {
        name: 'Acme Corp',
        slug: 'ACME_CORP',
        scope: 'hybrid',
      };

      const result = createTenantSchema.safeParse(invalidTenant);
      expect(result.success).toBe(false);
    });

    it('should reject slug too long', () => {
      const invalidTenant = {
        name: 'Acme Corp',
        slug: 'a'.repeat(64),
        scope: 'hybrid',
      };

      const result = createTenantSchema.safeParse(invalidTenant);
      expect(result.success).toBe(false);
    });

    it('should validate update schema (all fields optional)', () => {
      const update = {
        name: 'New Name',
      };

      const result = updateTenantSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe('Finding Schema', () => {
    const validFinding = {
      tenantId: '550e8400-e29b-41d4-a716-446655440000',
      scope: 'm365',
      severity: 'high',
      title: 'MFA not enabled for privileged users',
      description: 'Some users with admin roles do not have MFA enabled',
      source: 'microsoft_graph',
      assetType: 'user',
      assetId: 'user-123',
      recommendation: 'Enable MFA for all privileged accounts',
    };

    it('should validate a valid finding', () => {
      const result = createFindingSchema.safeParse(validFinding);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID for tenantId', () => {
      const invalid = { ...validFinding, tenantId: 'invalid-uuid' };
      const result = createFindingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject title too long', () => {
      const invalid = { ...validFinding, title: 'a'.repeat(501) };
      const result = createFindingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should use default status in create schema', () => {
      const { status, ...withoutStatus } = validFinding;
      const result = createFindingSchema.safeParse(withoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('open');
      }
    });

    it('should validate update schema with optional fields', () => {
      const update = {
        status: 'in_progress',
        severity: 'medium',
      };

      const result = updateFindingSchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });

  describe('Enum Schemas', () => {
    it('should validate scope enum', () => {
      expect(scopeSchema.safeParse('hybrid').success).toBe(true);
      expect(scopeSchema.safeParse('ad').success).toBe(true);
      expect(scopeSchema.safeParse('m365').success).toBe(true);
      expect(scopeSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate connector type enum', () => {
      expect(connectorTypeSchema.safeParse('microsoft_graph').success).toBe(true);
      expect(connectorTypeSchema.safeParse('ad_collector').success).toBe(true);
      expect(connectorTypeSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate finding severity enum', () => {
      expect(findingSeveritySchema.safeParse('critical').success).toBe(true);
      expect(findingSeveritySchema.safeParse('high').success).toBe(true);
      expect(findingSeveritySchema.safeParse('medium').success).toBe(true);
      expect(findingSeveritySchema.safeParse('low').success).toBe(true);
      expect(findingSeveritySchema.safeParse('info').success).toBe(true);
      expect(findingSeveritySchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate finding status enum', () => {
      expect(findingStatusSchema.safeParse('open').success).toBe(true);
      expect(findingStatusSchema.safeParse('in_progress').success).toBe(true);
      expect(findingStatusSchema.safeParse('resolved').success).toBe(true);
      expect(findingStatusSchema.safeParse('accepted_risk').success).toBe(true);
      expect(findingStatusSchema.safeParse('invalid').success).toBe(false);
    });

    it('should validate role enum', () => {
      expect(roleSchema.safeParse('platform_admin').success).toBe(true);
      expect(roleSchema.safeParse('tenant_admin').success).toBe(true);
      expect(roleSchema.safeParse('analyst').success).toBe(true);
      expect(roleSchema.safeParse('viewer').success).toBe(true);
      expect(roleSchema.safeParse('invalid').success).toBe(false);
    });
  });

  describe('Dashboard Schema', () => {
    const validDashboard = {
      name: 'Security Overview',
      widgets: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          type: 'score_overview',
          title: 'Global Score',
          enabled: true,
          config: {},
        },
      ],
    };

    it('should validate a valid dashboard', () => {
      const result = createDashboardSchema.safeParse(validDashboard);
      expect(result.success).toBe(true);
    });

    it('should reject dashboard without name', () => {
      const invalid = { widgets: validDashboard.widgets };
      const result = createDashboardSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should validate dashboard with empty widgets array', () => {
      const valid = { name: 'Test', widgets: [] };
      const result = createDashboardSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid widget type', () => {
      const invalid = {
        ...validDashboard,
        widgets: [{ ...validDashboard.widgets[0], type: 'invalid_type' }],
      };
      const result = createDashboardSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
