import { prisma } from '../config/prisma';

export async function listFields() {
  return prisma.field.findMany({
    include: { branch: true },
    orderBy: { name: 'asc' }
  });
}