import { supabase } from '../utils/DB/supabase';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env['JWT_SECRET'] || '';
const REFRESH_SECRET = process.env['REFRESH_SECRET'] || '';

export class AuthService {
  // 1. SIGNUP
  static async signUp(
    email: string,
    passwordRaw: string,
    firstName: string,
    lastName: string,
  ) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(passwordRaw, saltRounds);

      const { data, error } = await supabase
        .from('user')
        .insert([
          {
            email: email,
            password: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);

      const { password, ...safeUser } = data;
      return safeUser;
    } catch (err) {
      console.error('Signup Error:', err);
      throw err;
    }
  }

  // 2. LOGIN (Updated for user_logged_in_at)
  static async login(email: string, passwordRaw: string) {
    try {
      const { data: user, error } = await supabase
        .from('user')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) throw new Error('Invalid email or password');
      if (user.is_deleted) throw new Error('Account has been deleted');
      if (!user.isEnabled) throw new Error('Account is disabled');

      const isMatch = await bcrypt.compare(passwordRaw, user.password);
      if (!isMatch) throw new Error('Invalid email or password');

      const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
        expiresIn: '7d',
      });

      // Capturing the current timestamp for the updated column
      const userLoggedInAt = new Date().toISOString();

      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({
          access_token: accessToken,
          refresh_token: refreshToken,
          user_logged_in_at: userLoggedInAt, // <-- Updated mapping here
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      const { password, ...safeUser } = updatedUser;
      return safeUser;
    } catch (err) {
      console.error('Login Error:', err);
      throw err;
    }
  }

  // 3. REFRESH TOKEN
  static async refresh(oldRefreshToken: string) {
    try {
      const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET) as {
        id: string;
      };

      const { data: user, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', payload.id)
        .eq('refresh_token', oldRefreshToken)
        .single();

      if (error || !user) throw new Error('Invalid or expired refresh token');

      const newAccessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
        expiresIn: '15m',
      });
      const newRefreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
        expiresIn: '7d',
      });

      const { data: updatedUser, error: updateError } = await supabase
        .from('user')
        .update({
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) throw new Error(updateError.message);

      const { password, ...safeUser } = updatedUser;
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        user: safeUser,
      };
    } catch (err) {
      console.error('Refresh Error:', err);
      throw err;
    }
  }

  // 4. LOGOUT
  static async logout(userId: string) {
    try {
      const { error } = await supabase
        .from('user')
        .update({
          access_token: null,
          refresh_token: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw new Error(error.message);

      return { message: 'Logged out successfully' };
    } catch (err) {
      console.error('Logout Error:', err);
      throw err;
    }
  }
}
