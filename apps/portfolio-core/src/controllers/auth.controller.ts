import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { AuthService } from '../services/auth.service';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret } from '../config/security';

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ error: 'Email, password, first name, and last name are required' });
      return;
    }

    // Sign up the user (disabled by default, awaiting admin approval)
    const user = await AuthService.signUp(email, password, first_name, last_name);

    res.status(201).json({
      message: 'Account created successfully. Admin will enable your account, please wait.',
      user
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const loggedInUser = await AuthService.login(email, password);

    // Architectural Gold Standard: Set HttpOnly, Secure, SameSite=Strict cookie for refresh token
    if (loggedInUser.refresh_token) {
      res.cookie('refresh_token', loggedInUser.refresh_token, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json({
      access_token: loggedInUser.access_token,
      refresh_token: loggedInUser.refresh_token,
      expires_in: 900,
      user: loggedInUser
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    // Clear HttpOnly refresh token cookie
    res.clearCookie('refresh_token', {
      path: '/api/auth/refresh',
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
    });

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(400).json({ error: 'Authorization header is required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(400).json({ error: 'Invalid Authorization header format' });
      return;
    }

    const jwtSecret = getJwtSecret();
    const payload = jwt.verify(token, jwtSecret, { ignoreExpiration: true }) as { id: string };

    const result = await AuthService.logout(payload.id);
    res.status(200).json(result);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    // Check HttpOnly cookie first, then fallback to request body for non-browser/mobile/test clients
    let cookieRefreshToken: string | undefined;
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]+)/);
      if (match) {
        cookieRefreshToken = decodeURIComponent(match[1]);
      }
    }

    const refresh_token = cookieRefreshToken || (req as any).cookies?.['refresh_token'] || req.body?.refresh_token;
    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const result = await AuthService.refresh(refresh_token);

    // Refresh rotation: set updated HttpOnly cookie
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: 900,
      user: result.user
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function updateModules(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const jwtSecret = getJwtSecret();
    const payload = jwt.verify(token, jwtSecret) as { id: string };

    const paramId = req.params['id'];
    const targetUserId = (typeof paramId === 'string' ? paramId : Array.isArray(paramId) ? paramId[0] : null) || payload.id;
    const { modules } = req.body;
    if (!modules || typeof modules !== 'object') {
      res.status(400).json({ error: 'modules object is required' });
      return;
    }

    const updatedUser = await AuthService.updateUserModules(targetUserId, modules);
    res.status(200).json({ user: updatedUser });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Update modules error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

export async function getPermissions(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated' });
      return;
    }

    const user = await AuthService.getPermissions(userId);
    res.status(200).json({
      user,
      modules: user.modules,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Get permissions error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
}

