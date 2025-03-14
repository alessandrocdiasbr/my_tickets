import prisma from '../src/database/index';

beforeAll(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE "events" RESTART IDENTITY CASCADE;`;
  await prisma.$executeRaw`TRUNCATE TABLE "tickets" RESTART IDENTITY CASCADE;`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
