import { Router, Response, Request } from 'express';
import { db, tenants, memberships, users } from '@guardiboard/db';
import { createToken } from '@guardiboard/auth';
import { requireEnv } from '@guardiboard/config';
import {
  getMicrosoftOAuthConfig,
  generateState,
  getAuthorizationUrl,
  verifyState,
  exchangeCodeForTokens,
  getMicrosoftUserInfo,
} from '../services/oauth';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/microsoft', async (req: Request, res: Response) => {
  try {
    const config = getMicrosoftOAuthConfig();
    const tenantId = req.query.tenantId as string | undefined;
    const returnTo = req.query.returnTo as string | undefined;

    const state = generateState(tenantId, returnTo);

    const authUrl = getAuthorizationUrl(config, state);
    res.json({ url: authUrl });
  } catch (error) {
    console.error('OAuth init error:', error);
    res.status(500).json({ error: 'Failed to initialize OAuth' });
  }
});

router.get('/microsoft/callback', async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      console.error('OAuth error:', oauthError);
      return res.redirect(`/login?error=${oauthError}`);
    }

    if (!code || !state) {
      return res.redirect('/login?error=missing_params');
    }

    const verifiedState = verifyState(state as string);
    if (!verifiedState) {
      return res.redirect('/login?error=invalid_state');
    }

    const config = getMicrosoftOAuthConfig();
    const tokens = await exchangeCodeForTokens(config, code as string);

    if (!tokens.access_token) {
      return res.redirect('/login?error=no_token');
    }

    const userInfo = await getMicrosoftUserInfo(tokens.access_token);
    const email = userInfo.mail || userInfo.userPrincipalName;

    if (!email) {
      return res.redirect('/login?error=no_email');
    }

    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      const [newUser] = await db
        .insert(users)
        .values({
          email,
          name: userInfo.displayName || email.split('@')[0],
        })
        .returning();
      
      user = [newUser];
    }

    const userMemberships = await db
      .select({
        tenant: tenants,
        membership: memberships,
      })
      .from(memberships)
      .innerJoin(tenants, eq(tenants.id, memberships.tenantId))
      .where(eq(memberships.userId, user[0].id));

    const secret = requireEnv('SESSION_SECRET');

    if (userMemberships.length === 0) {
      if (verifiedState.tenantId) {
        const [tenant] = await db
          .select()
          .from(tenants)
          .where(eq(tenants.id, verifiedState.tenantId))
          .limit(1);

        if (tenant) {
          await db.insert(memberships).values({
            tenantId: tenant.id,
            userId: user[0].id,
            role: 'tenant_admin',
          });

          userMemberships.push({
            tenant,
            membership: {
              id: crypto.randomUUID(),
              tenantId: tenant.id,
              userId: user[0].id,
              role: 'tenant_admin',
              createdAt: new Date(),
            },
          });
        }
      } else {
        const [tenant] = await db
          .insert(tenants)
          .values({
            name: `${email.split('@')[1]} Workspace`,
            slug: email.split('@')[0].replace(/[^a-z0-9]/g, '-').toLowerCase(),
            scope: 'hybrid',
            status: 'active',
          })
          .returning();

        await db.insert(memberships).values({
          tenantId: tenant.id,
          userId: user[0].id,
          role: 'tenant_admin',
        });

        userMemberships.push({
          tenant,
          membership: {
            id: crypto.randomUUID(),
            tenantId: tenant.id,
            userId: user[0].id,
            role: 'tenant_admin',
            createdAt: new Date(),
          },
        });
      }
    }

    const firstTenant = userMemberships[0];
    const token = createToken(
      {
        sub: user[0].id,
        email: user[0].email,
        tenantId: firstTenant.tenant.id,
        role: firstTenant.membership.role,
        scope: firstTenant.tenant.scope,
      },
      secret
    );

    const returnUrl = verifiedState.returnTo || '/overview';
    res.redirect(`/api/auth/oauth/session?token=${token}&returnTo=${encodeURIComponent(returnUrl)}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/login?error=callback_failed');
  }
});

router.get('/session', async (req: Request, res: Response) => {
  const { token, returnTo } = req.query;

  if (!token) {
    return res.redirect('/login?error=no_token');
  }

  res.cookie('auth_token', token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.redirect(returnTo as string || '/overview');
});

router.post('/logout', async (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

export default router;
