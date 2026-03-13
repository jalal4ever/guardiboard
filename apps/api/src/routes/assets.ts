import { Router, Response } from 'express';
import { db, identityUsers, identityGroups, connectors } from '@guardiboard/db';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { eq, sql, and, like, desc, or } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);

router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { search, limit = 50, offset = 0 } = req.query;

    const conditions = [eq(identityUsers.tenantId, tenantId)];
    if (search) {
      conditions.push(
        or(
          like(identityUsers.displayName, `%${String(search)}%`),
          like(identityUsers.userPrincipalName, `%${String(search)}%`)
        ) as any
      );
    }

    const users = await db
      .select()
      .from(identityUsers)
      .where(and(...conditions))
      .orderBy(desc(identityUsers.lastSeenAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(identityUsers)
      .where(eq(identityUsers.tenantId, tenantId));

    res.json({
      users,
      total: count[0]?.count || 0,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/groups', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const { search, limit = 50, offset = 0 } = req.query;

    const conditions = [eq(identityGroups.tenantId, tenantId)];
    if (search) {
      conditions.push(like(identityGroups.displayName, `%${String(search)}%`) as any);
    }

    const groups = await db
      .select()
      .from(identityGroups)
      .where(and(...conditions))
      .orderBy(desc(identityGroups.lastSeenAt))
      .limit(Number(limit))
      .offset(Number(offset));

    const count = await db
      .select({ count: sql<number>`count(*)` })
      .from(identityGroups)
      .where(eq(identityGroups.tenantId, tenantId));

    res.json({
      groups,
      total: count[0]?.count || 0,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/connectors', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;

    const result = await db
      .select()
      .from(connectors)
      .where(eq(connectors.tenantId, tenantId))
      .orderBy(desc(connectors.createdAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching connectors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
