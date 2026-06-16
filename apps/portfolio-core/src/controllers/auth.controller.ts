import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import * as jwt from 'jsonwebtoken';

export async function signup(req: Request, res: Response) {
  try {
    const { email, password, first_name, last_name } = req.body;
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ error: 'Email, password, first name, and last name are required' });
      return;
    }

    // Sign up the user
    await AuthService.signUp(email, password, first_name, last_name);

    // Automatically log in the user upon successful signup
    const loggedInUser = await AuthService.login(email, password);

    res.status(200).json({
      access_token: loggedInUser.access_token,
      refresh_token: loggedInUser.refresh_token,
      expires_in: 900,
      user: loggedInUser
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
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

    res.status(200).json({
      access_token: loggedInUser.access_token,
      refresh_token: loggedInUser.refresh_token,
      expires_in: 900,
      user: loggedInUser
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
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

    const JWT_SECRET = process.env['JWT_SECRET'] || 'your-super-secret-jwt-key';
    const payload = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as { id: string };

    const result = await AuthService.logout(payload.id);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    const result = await AuthService.refresh(refresh_token);
    res.status(200).json({
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      expires_in: 900,
      user: result.user
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}
