"use client";
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// icons unused in this page

// removed unused ui imports to reduce bundle and linter noise
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Tabs unused; using Select to toggle user type
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/stores';
import { useToast } from '@/hooks/use-toast';
// useAuthStore and useToast already imported above

const CreateAccountPage: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { isLoading, registerAlumni, registerStudent } = useAuthStore();
  
  const [loading, setLoading] = React.useState(false);
  const [userType, setUserType] = React.useState<'alumni' | 'student'>('alumni');
  
  // Common fields
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  // phone is not required on signup currently
  
  // Alumni specific fields
  const [graduationYear, setGraduationYear] = React.useState('');
  const [course, setCourse] = React.useState('');
  const [currentCompany, setCurrentCompany] = React.useState('');
  const [jobTitle, setJobTitle] = React.useState('');
  const [industry, setIndustry] = React.useState('');
  const [bio, setBio] = React.useState('');
  
  // Student specific fields
  const [enrollmentYear, setEnrollmentYear] = React.useState('');
  const [expectedGraduation, setExpectedGraduation] = React.useState('');
  const [studentCourse, setStudentCourse] = React.useState('');
  const [rollNumber, setRollNumber] = React.useState('');

  const handleAlumniRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use auth store to register and set auth state
      if (registerAlumni) {
        await registerAlumni({
        name,
        email,
        password,
        graduationYear: parseInt(graduationYear),
        course,
        currentCompany,
        jobTitle,
        industry,
        bio,
        });
      }
      
      toast({
        title: 'Registration successful!',
        description: 'Please verify your email and wait for admin approval.',
      });
      router.push('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (registerStudent) {
        await registerStudent({
        name,
        email,
        password,
        enrollmentYear: parseInt(enrollmentYear),
        expectedGraduation: parseInt(expectedGraduation),
        course: studentCourse,
        rollNumber,
        });
      }
      
      toast({
        title: 'Registration successful!',
        description: 'Please verify your email to continue.',
      });
      router.push('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        title: 'Registration failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  // Note: The form-specific handlers above are used for each tab (alumni/student)

  const handleSubmit = async (e: React.FormEvent) => {
    if (userType === 'alumni') return handleAlumniRegister(e);
    return handleStudentRegister(e);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative font-sans">
      <div className="absolute inset-0 z-0 flex">
        <div className="w-1/2 h-full bg-white relative">
          <div className="absolute right-0 top-0 h-full w-24 bg-linear-to-l from-gray-100 to-transparent opacity-50"></div>
        </div>
        <div className="w-1/2 h-full bg-[#020c25]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] h-[600px] bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex overflow-hidden">
        <div className="w-1/2 bg-white flex flex-col items-center justify-center relative p-8">
          <div className="grow flex items-center justify-center w-full">
            <Image src="/sarthak.png" alt="Sarthak Logo" width={450} height={120} className="w-full max-w-[450px] object-contain mb-8" />
          </div>
          <div className="absolute bottom-8 text-[#0f172a] font-bold text-[11px] tracking-wide">Sarthak © 2025 | Built at SIH | De-bugs_</div>
        </div>

        <div className="w-1/2 bg-[#f6f9fc] p-10 flex flex-col justify-center text-[#1e293b]">
          <div className="w-full max-w-[380px] mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#051025] mb-1">Join Sarthak !</h2>
              <p className="text-sm text-slate-500">Connect with your legacy. Build your future.</p>
            </div>

            <form className="grid grid-cols-2 gap-3" onSubmit={handleSubmit}>

              {/* User Type Select (full width) */}
              <div className="col-span-2">
                <Select value={userType} onValueChange={(v) => setUserType(v as 'alumni'|'student')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="I am a..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumni">Alumni</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 1. Name (Full Width) */}
              <div className="col-span-2 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* 2. Email (Full Width) */}
              <div className="col-span-2 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* 3. Password (Half Width) */}
              <div className="col-span-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* 4. Graduation Year (Half Width) */}
              <div className="col-span-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <input
                  type="number"
                  min="1950"
                  max="2030"
                  placeholder="Grad. Year"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                />
              </div>

              {/* 5. Degree URL (Full Width - Visual Drop Zone) */}
              <div className="col-span-2 mt-1">
                 <label className="flex flex-col items-center justify-center w-full h-20 px-4 bg-white border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:border-[#001245] hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-3 text-slate-500 group-hover:text-[#001245] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm font-medium">Upload Degree Certificate</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Supports PDF, JPG, PNG</span>
                    <input type="file" className="hidden" />
                 </label>
              </div>

              {/* Sign Up Button */}
              {/* Additional Fields - Alumni / Student */}
              {userType === 'alumni' ? (
                <>
                  {/* Course */}
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Course (e.g., B.Tech, MBA)"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>

                  {/* Current Company */}
                  <div className="col-span-1 relative">
                    <input
                      type="text"
                      placeholder="Current Company"
                      value={currentCompany}
                      onChange={(e) => setCurrentCompany(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>

                  {/* Job Title */}
                  <div className="col-span-1 relative">
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>

                  {/* Industry */}
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>

                  {/* Bio */}
                  <div className="col-span-2 relative">
                    <Textarea
                      placeholder="Short bio (optional)"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Student-specific fields */}
                  <div className="col-span-1 relative">
                    <input
                      type="number"
                      min="2000"
                      max="2035"
                      placeholder="Enrollment Year"
                      value={enrollmentYear}
                      onChange={(e) => setEnrollmentYear(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>
                  <div className="col-span-1 relative">
                    <input
                      type="number"
                      min="2000"
                      max="2035"
                      placeholder="Expected Grad."
                      value={expectedGraduation}
                      onChange={(e) => setExpectedGraduation(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Course"
                      value={studentCourse}
                      onChange={(e) => setStudentCourse(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>
                  <div className="col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Roll Number"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full pl-4 pr-4 py-2.5 bg-transparent border border-slate-400 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#001245] focus:ring-1 focus:ring-[#001245] transition-all"
                    />
                  </div>
                </>
              )}

              {/* Sign Up Button */}
              
              <div className="col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={loading || isLoading}
                  className="block w-40 mx-auto bg-[#051025] text-white font-bold py-2.5 rounded-full hover:bg-[#061637] transition-colors shadow-lg disabled:opacity-50"
                >
                  {loading || isLoading ? 'Creating...' : 'Sign Up'}
                </button>
              </div>
            </form>

            {/* Bottom Link */}
            <p className="text-center text-xs text-slate-600 mt-6">
              Already have an account? <Link href="/login" className="font-bold text-[#051025] hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;