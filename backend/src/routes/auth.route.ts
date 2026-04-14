import { Elysia, t } from 'elysia';
import { githubCallbackHandler, verifyTokenHandler, logoutHandler } from '../controllers/auth.controller';

export const authRoute = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  // GitHub OAuth callback
  .post('/github/callback', githubCallbackHandler, {
    body: t.Object({ code: t.String() }),
    detail: {
      summary: 'GitHub Auth Callback',
      description: 'Exchange GitHub OAuth code for Firebase custom token',
    },
  })
  // Verify Firebase token
  .post('/verify', verifyTokenHandler, {
    detail: {
      summary: 'Verify Token',
      description: 'Check if Firebase ID token is still valid (Bearer token in Authorization header)',
      security: [{ BearerAuth: [] }],
    },
  })
  // Logout and revoke refresh tokens
  .delete('/logout', logoutHandler, {
    detail: {
      summary: 'Logout',
      description: 'Revoke Firebase refresh tokens for the logged-in user',
      security: [{ BearerAuth: [] }],
    },
  });
