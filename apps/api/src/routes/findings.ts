import { Router, Response } from 'express';
import { db } from '@guardiboard/db';
import { findings } from '@guardiboard/db/src/schema';
import { updateFindingSchema } from '@guardiboard/validation';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { eq, and, desc, sql, like } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { severity, status, source, limit = 50, offset = 0 } = req.query;

    let query = db
      .select()
      .from(findings)
      .where(eq(findings.tenantId, tenantId));

    if (severity) {
      query = query.where(eq(findings.severity, severity as string)) as typeof query;
    }
    if (status) {
      query = query.where(eq(findings.status, status as string)) as typeof query;
    }
    if (source) {
      query = query.where(eq(findings.source, source as string)) as typeof query;
    }

    const result = await query
      .orderBy(desc(findings.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(findings)
      .where(eq(findings.tenantId, tenantId));

    res.json({
      findings: result,
      total: countResult[0].count,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching findings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;

    const bySeverity = await db
      .select({
        severity: findings.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(findings)
      .where(eq(findings.tenantId, tenantId))
      .groupBy(findings.severity);

    const byStatus = await db
      .select({
        status: findings.status,
        count: sql<number>`count(*)::int`,
      })
      .from(findings)
      .where(eq(findings.tenantId, tenantId))
      .groupBy(findings.status);

    const bySource = await db
      .select({
        source: findings.source,
        count: sql<number>`count(*)::int`,
      })
      .from(findings)
      .where(eq(findings.tenantId, tenantId))
      .groupBy(findings.source);

    res.json({
      bySeverity,
      byStatus,
      bySource,
    });
  } catch (error) {
    console.error('Error fetching finding stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:findingId', async (req: AuthRequest, res: Response) => {
  try {
    const { findingId } = req.params;
    const tenantId = req.tenantId!;
    
    const [finding] = await db
      .select()
      .from(findings)
      .where(
        and(
          eq(findings.id, findingId),
          eq(findings.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!finding) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(finding);
  } catch (error) {
    console.error('Error fetching finding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:findingId', async (req: AuthRequest, res: Response) => {
  try {
    const { findingId } = req.params;
    const tenantId = req.tenantId!;

    const parsed = updateFindingSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const [finding] = await db
      .update(findings)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(findings.id, findingId),
          eq(findings.tenantId, tenantId)
        )
      )
      .returning();

    if (!finding) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(finding);
  } catch (error) {
    console.error('Error updating finding:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
