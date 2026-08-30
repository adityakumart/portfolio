import { connectToDatabase } from '../utils/DB/mongodb';
import { ObjectId } from 'mongodb';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '@portfolio/shared-types';

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
      const db = await connectToDatabase();
      const userCollection = db.collection('user');

      // Check if user already exists
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(passwordRaw, saltRounds);

      const newUser = {
        email: email,
        password: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        admin: false,
        isEnabled: false,
        is_deleted: false,
        access_token: null,
        refresh_token: null,
        user_logged_in_at: null,
        updated_at: new Date().toISOString(),
      };

      const result = await userCollection.insertOne(newUser);

      // Return user without password
      const safeUser = {
        id: result.insertedId.toString(),
        ...newUser,
      };
      delete (safeUser as any).password;
      return safeUser;
    } catch (err) {
      console.error('Signup Error:', err);
      throw err;
    }
  }

  // 2. LOGIN (Updated for user_logged_in_at)
  static async login(email: string, passwordRaw: string) {
    try {
      const db = await connectToDatabase();
      const userCollection = db.collection('user');

      const user = await userCollection.findOne({ email });
      if (!user) throw new Error('Invalid email or password');
      if (user['is_deleted']) throw new Error('Account has been deleted');
      if (user['isEnabled'] === false) throw new Error('Account is disabled');

      const isMatch = await bcrypt.compare(passwordRaw, user['password']);
      if (!isMatch) throw new Error('Invalid email or password');

      const userIdStr = user._id.toString();

      const accessToken = jwt.sign({ id: userIdStr }, JWT_SECRET, {
        expiresIn: '15m',
      });
      const refreshToken = jwt.sign({ id: userIdStr }, REFRESH_SECRET, {
        expiresIn: '7d',
      });

      // Capturing the current timestamp for the updated column
      const userLoggedInAt = new Date().toISOString();

      await userCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            access_token: accessToken,
            refresh_token: refreshToken,
            user_logged_in_at: userLoggedInAt,
            updated_at: new Date().toISOString(),
          },
        },
      );

      const updatedUser = await userCollection.findOne({ _id: user._id });
      if (!updatedUser)
        throw new Error('Error retrieving updated user profile');

      const safeUser = {
        id: updatedUser._id.toString(),
        ...updatedUser,
      } as unknown as User & { password?: string; _id?: unknown };
      delete safeUser.password;
      delete (safeUser as any)._id;

      return safeUser;
    } catch (_) {
      console.error('Login Error:', _);
      throw _;
    }
  }

  // 3. REFRESH TOKEN
  static async refresh(oldRefreshToken: string) {
    try {
      const payload = jwt.verify(oldRefreshToken, REFRESH_SECRET) as {
        id: string;
      };

      const db = await connectToDatabase();
      const userCollection = db.collection('user');

      let objId: ObjectId;
      try {
        objId = new ObjectId(payload.id);
      } catch {
        throw new Error('Invalid user ID format');
      }

      const user = await userCollection.findOne({
        _id: objId,
        refresh_token: oldRefreshToken,
      });
      if (!user) throw new Error('Invalid or expired refresh token');

      const newAccessToken = jwt.sign({ id: user._id.toString() }, JWT_SECRET, {
        expiresIn: '15m',
      });
      const newRefreshToken = jwt.sign(
        { id: user._id.toString() },
        REFRESH_SECRET,
        {
          expiresIn: '7d',
        },
      );

      await userCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
            updated_at: new Date().toISOString(),
          },
        },
      );

      const updatedUser = await userCollection.findOne({ _id: user._id });
      if (!updatedUser)
        throw new Error('Error retrieving updated user profile');

      const safeUser = {
        id: updatedUser._id.toString(),
        ...updatedUser,
      } as unknown as User & { password?: string; _id?: unknown };
      delete safeUser.password;
      delete (safeUser as any)._id;

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
      const db = await connectToDatabase();
      const userCollection = db.collection('user');

      let objId: ObjectId;
      try {
        objId = new ObjectId(userId);
      } catch {
        throw new Error('Invalid user ID format');
      }

      await userCollection.updateOne(
        { _id: objId },
        {
          $set: {
            access_token: null,
            refresh_token: null,
            updated_at: new Date().toISOString(),
          },
        },
      );

      return { message: 'Logged out successfully' };
    } catch (err) {
      console.error('Logout Error:', err);
      throw err;
    }
  }
}
