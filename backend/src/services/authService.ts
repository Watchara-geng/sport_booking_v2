import { prisma } from '../config/prisma';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    const err: any = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: 'USER'
    }
  });

  const token = signToken({ userId: user.id, role: user.role as 'USER' | 'ADMIN' });

  const { password, ...safeUser } = user as any;
  return { user: safeUser, token };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const ok = await comparePassword(input.password, user.password);
  if (!ok) {
    const err: any = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user.id, role: user.role as 'USER' | 'ADMIN' });

  const { password, ...safeUser } = user as any;
  return { user: safeUser, token };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err: any = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  const { password, ...safeUser } = user as any;
  return safeUser;
}
