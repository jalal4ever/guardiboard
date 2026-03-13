import { Router, Response } from 'express';
import { db, dashboardLayouts } from '@guardiboard/db';
import { createDashboardSchema, updateDashboardSchema } from '@guardiboard/validation';
import { authMiddleware, requireTenantAccess, type AuthRequest } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

router.use(authMiddleware);
router.use(requireTenantAccess);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user?.sub;
    
    const result = await db
      .select()
      .from(dashboardLayouts)
      .where(eq(dashboardLayouts.tenantId, tenantId))
      .orderBy(desc(dashboardLayouts.updatedAt));

    res.json(result);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:dashboardId', async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const tenantId = req.tenantId!;
    
    const [dashboard] = await db
      .select()
      .from(dashboardLayouts)
      .where(
        and(
          eq(dashboardLayouts.id, dashboardId),
          eq(dashboardLayouts.tenantId, tenantId)
        )
      )
      .limit(1);

    if (!dashboard) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const tenantId = req.tenantId!;
    const userId = req.user?.sub;

    const parsed = createDashboardSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const { name, widgets } = parsed.data;

    const [dashboard] = await db
      .insert(dashboardLayouts)
      .values({
        tenantId,
        userId,
        name,
        widgets,
        isDefault: false,
      })
      .returning();

    res.status(201).json(dashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:dashboardId', async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const tenantId = req.tenantId!;

    const parsed = updateDashboardSchema.safeParse(req.body);
    
    if (!parsed.success) {
      res.status(400).json({ 
        error: 'Validation error', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const [dashboard] = await db
      .update(dashboardLayouts)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dashboardLayouts.id, dashboardId),
          eq(dashboardLayouts.tenantId, tenantId)
        )
      )
      .returning();

    if (!dashboard) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.json(dashboard);
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:dashboardId', async (req: AuthRequest, res: Response) => {
  try {
    const { dashboardId } = req.params;
    const tenantId = req.tenantId!;

    const [deleted] = await db
      .delete(dashboardLayouts)
      .where(
        and(
          eq(dashboardLayouts.id, dashboardId),
          eq(dashboardLayouts.tenantId, tenantId)
        )
      )
      .returning();

    if (!deleted) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
