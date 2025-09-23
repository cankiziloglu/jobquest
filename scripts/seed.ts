import {
  PrismaClient,
  JobStatus,
  WorkArrangement,
} from '../lib/generated/prisma';

const prisma = new PrismaClient();

const userId = 'user_333Fo9GcZmoagJuBYlW0MRmfWXg';

const dummyJobs = [
  {
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc',
    description:
      'Lead frontend development using React and TypeScript. Work on cutting-edge web applications.',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    jobUrl: 'https://techcorp.com/careers/senior-frontend',
    workArrangement: WorkArrangement.HYBRID,
    status: JobStatus.INTERVIEW,
    notes: [
      'Had initial phone screening with HR. Very positive feedback.',
      'Technical interview scheduled for next Tuesday at 2 PM.',
      'Team seems really collaborative and innovative.',
    ],
  },
  {
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    description:
      'Build scalable web applications using Node.js, React, and AWS. Join a fast-growing startup.',
    location: 'Remote',
    salary: '$120k - $150k',
    jobUrl: 'https://startupxyz.io/jobs/fullstack',
    workArrangement: WorkArrangement.REMOTE,
    status: JobStatus.APPLIED,
    notes: [
      'Applied through their website. Got automated confirmation email.',
      'Seems like a great opportunity to work with modern tech stack.',
    ],
  },
  {
    title: 'React Developer',
    company: 'Digital Agency Pro',
    description:
      'Develop responsive web applications for diverse clients. Strong focus on UI/UX.',
    location: 'New York, NY',
    salary: '$100k - $130k',
    jobUrl: 'https://digitalagency.com/careers',
    workArrangement: WorkArrangement.ON_SITE,
    status: JobStatus.REJECTED,
    notes: [
      "Completed take-home assignment but didn't hear back.",
      'Eventually got rejection email. Said they went with someone more senior.',
    ],
  },
  {
    title: 'Backend Developer',
    company: 'FinTech Solutions',
    description:
      'Build secure financial APIs using Python and Django. Work with microservices architecture.',
    location: 'Austin, TX',
    salary: '$130k - $160k',
    jobUrl: 'https://fintechsolutions.com/jobs',
    workArrangement: WorkArrangement.HYBRID,
    status: JobStatus.OFFER,
    notes: [
      'Great interview process! Really impressed with the team.',
      'Received verbal offer. Waiting for official paperwork.',
      'Benefits package looks excellent - great health insurance and 401k match.',
    ],
  },
  {
    title: 'DevOps Engineer',
    company: 'CloudTech',
    description:
      'Manage CI/CD pipelines and cloud infrastructure. Experience with AWS and Kubernetes required.',
    location: 'Seattle, WA',
    salary: '$145k - $175k',
    jobUrl: 'https://cloudtech.com/careers/devops',
    workArrangement: WorkArrangement.REMOTE,
    status: JobStatus.WISHLIST,
    notes: [
      'Looks like an amazing opportunity but need to brush up on Kubernetes.',
      'Company has great reputation in the industry.',
    ],
  },
  {
    title: 'Mobile App Developer',
    company: 'AppCreators',
    description:
      'Develop iOS and Android applications using React Native. Work on consumer-facing apps.',
    location: 'Los Angeles, CA',
    salary: '$110k - $140k',
    jobUrl: 'https://appcreators.com/jobs',
    workArrangement: WorkArrangement.HYBRID,
    status: JobStatus.APPLIED,
    notes: [
      'Submitted application with portfolio of previous mobile apps.',
      'Really excited about their upcoming projects in the health space.',
    ],
  },
  {
    title: 'Software Engineer II',
    company: 'MegaCorp',
    description:
      'Join our platform team building scalable microservices. Strong emphasis on testing and code quality.',
    location: 'Chicago, IL',
    salary: '$125k - $155k',
    jobUrl: 'https://megacorp.com/careers',
    workArrangement: WorkArrangement.ON_SITE,
    status: JobStatus.INTERVIEW,
    notes: [
      'Passed the initial coding challenge.',
      'On-site interview scheduled for next week. Need to prepare system design questions.',
    ],
  },
  {
    title: 'Frontend Engineer',
    company: 'EcommercePlus',
    description:
      'Build high-performance e-commerce interfaces. Experience with Next.js and performance optimization.',
    location: 'Denver, CO',
    salary: '$115k - $145k',
    jobUrl: 'https://ecommerceplus.com/jobs',
    workArrangement: WorkArrangement.REMOTE,
    status: JobStatus.APPLIED,
    notes: [
      'Love their focus on performance and user experience.',
      'Application submitted via LinkedIn. Recruiter viewed my profile.',
    ],
  },
  {
    title: 'Tech Lead',
    company: 'InnovativeSoft',
    description:
      'Lead a team of 5 developers building next-gen SaaS platform. Mixture of hands-on coding and mentoring.',
    location: 'Boston, MA',
    salary: '$160k - $190k',
    jobUrl: 'https://innovativesoft.com/careers',
    workArrangement: WorkArrangement.HYBRID,
    status: JobStatus.WISHLIST,
    notes: [
      'Dream job opportunity but might be a stretch. Need more leadership experience.',
      'Company culture looks amazing from Glassdoor reviews.',
    ],
  },
  {
    title: 'JavaScript Developer',
    company: 'WebSolutions LLC',
    description:
      'Maintain and enhance legacy JavaScript applications. Good opportunity to modernize codebase.',
    location: 'Phoenix, AZ',
    salary: '$90k - $120k',
    jobUrl: 'https://websolutions.com/careers',
    workArrangement: WorkArrangement.ON_SITE,
    status: JobStatus.REJECTED,
    notes: [
      "Initial phone interview went well but didn't progress.",
      'Feedback was that they needed someone with more jQuery experience.',
    ],
  },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Delete existing data for this user
    // await prisma.note.deleteMany({
    //   where: {
    //     job: {
    //       userId: userId,
    //     },
    //   },
    // });

    // await prisma.job.deleteMany({
    //   where: {
    //     userId: userId,
    //   },
    // });

    // console.log('🗑️  Cleared existing data for user');

    // Create jobs with notes
    for (const jobData of dummyJobs) {
      const { notes, ...job } = jobData;

      const createdJob = await prisma.job.create({
        data: {
          ...job,
          userId: userId,
        },
      });

      // Create notes for this job
      if (notes && notes.length > 0) {
        for (const noteContent of notes) {
          await prisma.note.create({
            data: {
              content: noteContent,
              jobId: createdJob.id,
            },
          });
        }
      }

      console.log(
        `✅ Created job: ${job.title} at ${job.company} with ${
          notes?.length || 0
        } notes`
      );
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(
      `📊 Created ${dummyJobs.length} jobs with notes for user: ${userId}`
    );
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedDatabase();
