import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.create({
    data: {
      name: 'Main Branch',
      lat: 13.7563,
      lng: 100.5018,
      fields: {
        create: [
          { name: 'Football Field' },
          { name: 'Basketball Court' }
        ]
      }
    }
  });
  console.log('Seed complete:', branch);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());