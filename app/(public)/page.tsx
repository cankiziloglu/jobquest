import { Button } from '@/components/ui/button';
import { SignInButton, SignUpButton, SignedOut } from '@clerk/nextjs';
import {
  CheckCircle,
  Kanban,
  BarChart3,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  // Automatically redirect signed-in users to dashboard
  const { userId } = await auth();

  if (userId) {
    redirect('/dashboard');
  }

  return (
    <div className='flex-1'>
      {/* Landing page for signed-out users */}
      {/* Hero Section */}
      <section className='py-20 px-4 text-center bg-gradient-to-b from-background to-secondary/20'>
        <div className='max-w-4xl mx-auto'>
          <h1 className='text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
            Track Your Job Applications Like a Pro
          </h1>
          <p className='text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            JobQuest is the minimalist job application tracker designed
            specifically for software developers. Stay organized, track
            progress, and land your dream job.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <SignUpButton mode='modal'>
              <Button size='lg' className='text-lg px-8 py-3'>
                Get Started Free
              </Button>
            </SignUpButton>
            <SignInButton mode='modal'>
              <Button size='lg' variant='outline' className='text-lg px-8 py-3'>
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-4'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>
            Everything you need to manage your job search
          </h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <div className='text-center p-6 rounded-lg border bg-card'>
              <div className='flex justify-center mb-4'>
                <FileText className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-3'>Job Applications</h3>
              <p className='text-muted-foreground'>
                Keep track of all your job applications in one place. Add
                company details, position info, and application dates.
              </p>
            </div>

            <div className='text-center p-6 rounded-lg border bg-card'>
              <div className='flex justify-center mb-4'>
                <Kanban className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-3'>Kanban Board</h3>
              <p className='text-muted-foreground'>
                Visualize your application pipeline with an intuitive
                drag-and-drop kanban board. Move jobs from wishlist to offer.
              </p>
            </div>

            <div className='text-center p-6 rounded-lg border bg-card'>
              <div className='flex justify-center mb-4'>
                <BarChart3 className='h-12 w-12 text-primary' />
              </div>
              <h3 className='text-xl font-semibold mb-3'>
                Analytics & Insights
              </h3>
              <p className='text-muted-foreground'>
                Get insights into your job search progress with analytics and
                visualizations to help you optimize your strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Status Flow Section */}
      <section className='py-20 px-4 bg-secondary/10'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-12'>
            Your Job Application Journey
          </h2>
          <div className='flex flex-col md:flex-row items-center justify-center gap-4 mb-8'>
            <div className='flex items-center gap-3 p-4 rounded-lg bg-card border'>
              <div className='w-3 h-3 rounded-full bg-blue-500'></div>
              <span className='font-medium'>Wishlist</span>
            </div>
            <ArrowRight className='h-6 w-6 text-muted-foreground rotate-90 md:rotate-0' />

            <div className='flex items-center gap-3 p-4 rounded-lg bg-card border'>
              <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
              <span className='font-medium'>Applied</span>
            </div>
            <ArrowRight className='h-6 w-6 text-muted-foreground rotate-90 md:rotate-0' />

            <div className='flex items-center gap-3 p-4 rounded-lg bg-card border'>
              <div className='w-3 h-3 rounded-full bg-purple-500'></div>
              <span className='font-medium'>Interview</span>
            </div>
            <ArrowRight className='h-6 w-6 text-muted-foreground rotate-90 md:rotate-0' />

            <div className='flex items-center gap-3 p-4 rounded-lg bg-card border'>
              <div className='w-3 h-3 rounded-full bg-green-500'></div>
              <span className='font-medium'>Offer</span>
            </div>
          </div>
          <p className='text-lg text-muted-foreground'>
            Track each application through every stage of the hiring process
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-12'>
            Why developers choose JobQuest
          </h2>
          <div className='grid md:grid-cols-2 gap-8'>
            <div className='flex gap-4'>
              <CheckCircle className='h-6 w-6 text-green-500 mt-1 flex-shrink-0' />
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Clean & Minimalist
                </h3>
                <p className='text-muted-foreground'>
                  No clutter, no distractions. Focus on what matters most -
                  landing your next role.
                </p>
              </div>
            </div>

            <div className='flex gap-4'>
              <CheckCircle className='h-6 w-6 text-green-500 mt-1 flex-shrink-0' />
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Developer-Focused
                </h3>
                <p className='text-muted-foreground'>
                  Built by developers, for developers. Understands the unique
                  needs of tech job searches.
                </p>
              </div>
            </div>

            <div className='flex gap-4'>
              <CheckCircle className='h-6 w-6 text-green-500 mt-1 flex-shrink-0' />
              <div>
                <h3 className='text-lg font-semibold mb-2'>
                  Notes & Documentation
                </h3>
                <p className='text-muted-foreground'>
                  Keep detailed notes for each application. Remember interview
                  questions, company culture, and more.
                </p>
              </div>
            </div>

            <div className='flex gap-4'>
              <CheckCircle className='h-6 w-6 text-green-500 mt-1 flex-shrink-0' />
              <div>
                <h3 className='text-lg font-semibold mb-2'>Free to Use</h3>
                <p className='text-muted-foreground'>
                  Start tracking your applications immediately. No payment
                  required, no hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4 bg-primary/5'>
        <div className='max-w-2xl mx-auto text-center'>
          <h2 className='text-3xl md:text-4xl font-bold mb-6'>
            Ready to organize your job search?
          </h2>
          <p className='text-xl text-muted-foreground mb-8'>
            Join developers who are already using JobQuest to land their dream
            jobs.
          </p>
          <SignUpButton mode='modal'>
            <Button size='lg' className='text-lg px-8 py-4'>
              Start Tracking Applications
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-8 px-4 border-t bg-background'>
        <div className='max-w-4xl mx-auto text-center text-sm text-muted-foreground'>
          <p>&copy; 2025 JobQuest. Built with ❤️ for developers.</p>
        </div>
      </footer>
    </div>
  );
}
