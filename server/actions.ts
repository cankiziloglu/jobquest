import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function createJob(data: { title: string; description: string }) {
  return prisma.job.create({
    data,
  });
}
