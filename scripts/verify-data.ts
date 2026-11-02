import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../lib/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function verifyData() {
  const userId = 'user_333Fo9GcZmoagJuBYlW0MRmfWXg';

  console.log('🔍 Verifying seeded data...');

  const jobs = await prisma.job.findMany({
    where: { userId },
    include: {
      notes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log(`\n📊 Found ${jobs.length} jobs for user ${userId}:`);

  jobs.forEach((job, index) => {
    console.log(`\n${index + 1}. ${job.title} at ${job.company}`);
    console.log(
      `   Status: ${job.status} | Work: ${
        job.workArrangement || 'Not specified'
      }`
    );
    console.log(`   Location: ${job.location || 'Not specified'}`);
    console.log(`   Salary: ${job.salary || 'Not specified'}`);
    console.log(`   Notes: ${job.notes.length} note(s)`);
    if (job.notes.length > 0) {
      job.notes.forEach((note, noteIndex) => {
        console.log(
          `     ${noteIndex + 1}. ${note.content.substring(0, 60)}...`
        );
      });
    }
  });

  const totalNotes = jobs.reduce((sum, job) => sum + job.notes.length, 0);
  console.log(`\n✅ Total: ${jobs.length} jobs, ${totalNotes} notes`);

  await prisma.$disconnect();
}

verifyData();
