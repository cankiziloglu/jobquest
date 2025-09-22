import { SignUp } from '@clerk/nextjs';
import { ChartLine, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className='flex min-h-dvh items-center justify-center p-6 md:p-10'>
      <SignUp />
    </div>
  );
}
