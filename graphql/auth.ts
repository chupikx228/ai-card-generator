import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import { UserModel, type UserDocument } from './db.ts';

const readSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
};

export const JWT_SECRET = readSecret();

type TokenPayload = {
  userId: string;
};

const isTokenPayload = (value: unknown): value is TokenPayload =>
  typeof value === 'object' && value !== null && typeof Reflect.get(value, 'userId') === 'string';

export const createToken = (user: UserDocument): string =>
  jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

export const getUserFromToken = async (token: string): Promise<UserDocument | null> => {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (!isTokenPayload(payload) || !isValidObjectId(payload.userId)) {
      return null;
    }
    return await UserModel.findById(payload.userId).exec();
  } catch {
    return null;
  }
};

export const getUserFromAuthHeader = async (authHeader: string | undefined): Promise<UserDocument | null> => {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return getUserFromToken(authHeader.slice('Bearer '.length).trim());
};
