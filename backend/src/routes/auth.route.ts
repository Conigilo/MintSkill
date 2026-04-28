import { Elysia, t } from 'elysia';
import { githubCallbackHandler, verifyTokenHandler, logoutHandler, loginHandler } from '../controllers/auth.controller';

export const authRoute = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  // GitHub OAuth callback
  .post('/github/callback', githubCallbackHandler, {
    body: t.Object({ code: t.String() }),
    detail: {
      summary: 'GitHub Auth Callback',
      description: 'Exchange GitHub OAuth code for Firebase custom token',
    },
  })
  // Email Login (Dev/Test)
  .post('/login', loginHandler, {
    body: t.Object({ 
      email: t.String(),
      password: t.Optional(t.String()) 
    }),
    detail: {
      summary: 'Email Login (Dev)',
      description: 'Login with email to get a custom token (Development only)',
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
