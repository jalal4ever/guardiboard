import { Router, Response } from 'express';
import { db, secureScores, identityUsers, identityGroups, findings } from '@guardiboard/db';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { eq, sql, and } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);
router.use(requireTenantAccess);

router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;

    const scores = await db
      .select()
      .from(secureScores)
      .where(eq(secureScores.tenantId, tenantId))
      .orderBy(sql`${secureScores.createdAt} DESC`)
      .limit(1);

    const userCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(identityUsers)
      .where(eq(identityUsers.tenantId, tenantId));

    const groupCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(identityGroups)
      .where(eq(identityGroups.tenantId, tenantId));

    const findingsCount = await db
      .select({ 
        critical: sql<number>`count(case when ${findings.severity} = 'critical' then 1 end)`,
        high: sql<number>`count(case when ${findings.severity} = 'high' then 1 end)`,
        total: sql<number>`count(*)`
      })
      .from(findings)
      .where(
        and(
          eq(findings.tenantId, tenantId),
          eq(findings.status, 'open')
        )
      );

    const latestScore = scores[0];
    
    res.json({
      globalScore: latestScore ? Math.round((parseFloat(latestScore.score || '0') / parseFloat(latestScore.maxScore || '100')) * 100) : 0,
      userCount: userCount[0]?.count || 0,
      groupCount: groupCount[0]?.count || 0,
      criticalFindings: Number(findingsCount[0]?.critical || 0),
      highFindings: Number(findingsCount[0]?.high || 0),
      totalFindings: Number(findingsCount[0]?.total || 0),
      scoreHistory: scores,
    });
  } catch (error) {
    console.error('Error fetching posture overview:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/ad', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;

    const privilegedUsers = await db
      .select({ count: sql<number>`count(*)` })
      .from(identityUsers)
      .where(
        and(
          eq(identityUsers.tenantId, tenantId),
          eq(identityUsers.source, 'ad_collector')
        )
      );

    res.json({
      score: 72,
      domainCount: 1,
      privilegedAccounts: privilegedUsers[0]?.count || 0,
      trusts: [],
      gpoCount: 0,
    });
  } catch (error) {
    console.error('Error fetching AD posture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/m365', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;

    const scores = await db
      .select()
      .from(secureScores)
      .where(eq(secureScores.tenantId, tenantId))
      .orderBy(sql`${secureScores.createdAt} DESC`)
      .limit(1);

    res.json({
      score: scores[0] ? Math.round((parseFloat(scores[0].score || '0') / parseFloat(scores[0].maxScore || '100')) * 100) : 0,
      usersWithMFA: 0,
      conditionalAccessPolicies: 0,
      applications: 0,
    });
  } catch (error) {
    console.error('Error fetching M365 posture:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
