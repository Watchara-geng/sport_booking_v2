import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as authService from '../src/services/authService';
import { prisma } from '../src/config/prisma';
import * as passwordUtil from '../src/utils/password';
import * as jwtUtil from '../src/utils/jwt';

vi.mock('../src/config/prisma', () => {
  const userDb: any[] = [];
  return {
    prisma: {
      user: {
        findUnique: vi.fn(async ({ where }: any) => userDb.find(u => u.email === where.email || u.id === where.id) || null),
        create: vi.fn(async ({ data }: any) => {
          const u = { ...data, id: `u_${Math.random().toString(36).slice(2)}`, createdAt: new Date() };
          userDb.push(u);
          return u;
        })
      }
    }
  };
});

vi.spyOn(passwordUtil, 'hashPassword').mockImplementation(async (p: string) => `hash(${p})`);
vi.spyOn(passwordUtil, 'comparePassword').mockImplementation(async (p: string, h: string) => h === `hash(${p})`);
vi.spyOn(jwtUtil, 'signToken').mockImplementation((_p: any) => 'dummy.jwt.token');

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a new user and returns token', async () => {
    const res = await authService.register({ name: 'Alice', email: 'a@example.com', password: 'secret123' });
    expect(res.user.email).toBe('a@example.com');
    expect(res.token).toBe('dummy.jwt.token');
  });

  it('fails register on duplicate email', async () => {
    await authService.register({ name: 'A', email: 'dup@example.com', password: 'x' });
    await expect(authService.register({ name: 'B', email: 'dup@example.com', password: 'y' })).rejects.toThrow('Email already registered');
  });

  it('logs in with correct credentials', async () => {
    await authService.register({ name: 'Bob', email: 'b@example.com', password: 'pw' });
    const res = await authService.login({ email: 'b@example.com', password: 'pw' });
    expect(res.user.email).toBe('b@example.com');
  });

  it('rejects invalid login', async () => {
    await expect(authService.login({ email: 'no@example.com', password: 'xx' })).rejects.toThrow('Invalid credentials');
  });
});
