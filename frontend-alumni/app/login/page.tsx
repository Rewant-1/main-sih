"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Welcome!', description: 'Signed in successfully.' });
      router.push('/feed');
    } catch (err: unknown) {
      let message = 'Login failed';
      if (typeof err === 'object' && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      import Link from 'next/link';
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
                    Don&apos;t have an account? <Link href="/register" className="font-bold text-[#051025] hover:underline">Join Sarthak</Link>
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative font-sans">
      {/* Background Split */}
      <div className="absolute inset-0 z-0 flex">
        {/* Left side white with subtle gradient/shadow effect */}
        <div className="w-1/2 h-full bg-white relative">
          <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-gray-100 to-transparent opacity-50"></div>
        </div>
        {/* Right side dark navy */}
        <div className="w-1/2 h-full bg-[#020c25]"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-[1000px] h-[600px] bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex overflow-hidden">
        
        {/* Left Column: Logo Area */}
        <div className="w-1/2 bg-white flex flex-col items-center justify-center relative p-8">
          <div className="grow flex items-center justify-center w-full">
            {/* Logo Placeholder */}
            <Image
              src="/sarthak.png"
              alt="Sarthak Logo"
              width={450}
              height={120}
              className="w-full max-w-[450px] object-contain mb-8"
            />
          </div>
          
          {/* Footer Text */}
          <div className="absolute bottom-8 text-[#0f172a] font-bold text-[11px] tracking-wide">
            Sarthak © 2025 | Built at SIH | De-bugs_
          </div>
        </div>

        {/* Right Column: Form Area */}
        <div className="w-1/2 bg-[#f6f9fc] p-12 flex flex-col justify-center items-center text-[#1e293b]">
          <div className="w-full max-w-sm">
            {/* Headers */}
            <h2 className="text-2xl font-bold text-[#051025] mb-2">
              Welcome to Sarthak !
            </h2>
            <p className="text-sm text-slate-500 mb-8">
              Your network. Your opportunities. Your legacy.
            </p>

            <p className="text-sm font-semibold text-[#051025] mb-6">
              Sign in to access your alumni network.
            </p>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email Here"
                  className="w-full px-4 py-3 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* Password Input */}
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your Password Here"
                  className="w-full px-4 py-3 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs text-[#0f172a]">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="w-3 h-3 border-slate-400 rounded text-[#051025] focus:ring-[#051025]"
                  />
                  <label htmlFor="remember" className="font-medium cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <a href="#" className="font-medium hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || isLoading}
                  className="block w-40 mx-auto bg-[#051025] text-white font-bold py-2.5 rounded-full hover:bg-[#061637] transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading || isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            {/* Bottom Link */}
            <p className="text-center text-xs text-slate-600 mt-8">
              Don&apos;t have an account? <a href="#" className="font-bold text-[#051025] hover:underline">Join Sarthak</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;