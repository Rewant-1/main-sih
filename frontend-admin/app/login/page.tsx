"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, LayoutDashboard, Users, Calendar, BookOpen } from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api-client";

const SarthakAdminLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const { login, logout, isLoading: storeLoading } = useAuthStore();
  const { toast } = useToast();

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const checkExistingAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (res.data?.data?.userType === "Admin") {
            router.replace("/dashboard");
            return;
          }
        } catch {
          // Token invalid, clear it
          localStorage.removeItem("token");
          localStorage.removeItem("auth-storage");
        }
      }
      setCheckingAuth(false);
    };
    checkExistingAuth();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);

      // Fetch current user from store if available
      const authStore = useAuthStore.getState();
      let loggedUser = authStore?.user;
      // Debug logs to verify user and token
      try {
        console.debug('Admin login - loggedUser:', loggedUser);
        console.debug('Admin login - userType:', loggedUser?.userType, 'role:', (loggedUser as any)?.role, 'isAdmin:', (loggedUser as any)?.isAdmin);
        console.debug('Admin login - token:', typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      } catch (err) {
        // ignore in server context
      }
      // If store user is not available yet, try to decode token payload and fallback
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      let payloadUserType: string | null = null;
      try {
        if (!loggedUser && token) {
          const payload = JSON.parse(atob(token.split('.')[1] || '')) as { userId?: string; userType?: string };
          if (payload?.userId) {
            // Try retrieving from store again after API-side fetch fallback
            loggedUser = useAuthStore.getState()?.user;
          }
          payloadUserType = payload?.userType ? String(payload.userType).toLowerCase() : null;

          // If no store user but token indicates Admin, set a minimal fallback user into the store
          if (!loggedUser && payloadUserType === 'admin') {
            const fallbackUser = {
              _id: payload.userId || 'unknown',
              name: 'Admin',
              email,
              userType: 'Admin' as any,
              createdAt: new Date().toISOString(),
            } as any;
            try {
              authStore.setUser(fallbackUser);
              loggedUser = fallbackUser;
              console.debug('Set fallback admin user in store based on token payload');
            } catch (e) {
              console.warn('Failed to set fallback user in store', e);
            }
          }
        }
      } catch (err) {
        // ignore token decode errors
      }

      const userType = ((loggedUser?.userType ?? (loggedUser as any)?.role ?? payloadUserType ?? "") as string).toLowerCase();
      const isAdminFlag = (loggedUser as any)?.isAdmin === true;
      const isAdmin = (userType === 'admin') || isAdminFlag;
      // Only logout if not admin based on token or store user
      if (!isAdmin) {
        // If this account is not Admin, logout and show error
        logout();
        toast({
          title: "Access denied",
          description: "Only admins can sign in here.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setLoading(false);
      toast({ title: "Welcome back", description: "You are signed into Admin Dashboard" });
      try {
        // Use replace to avoid keeping /login in history and trigger a full client-side replace
        await router.replace("/dashboard");
        console.debug('router.replace(/dashboard) resolved');
      } catch (err) {
        console.debug('router.replace(/dashboard) failed', err);
      }

      // Fallback: if the route didn't change within a short time (e.g., due to a reload or HMR), force a full reload to /dashboard
      // Fallback: allow a bit more time for state rehydration or HMR reload issues, then force a full navigation
      setTimeout(() => {
        try {
          console.debug('[login fallback] current pathname:', window.location.pathname);
          if (window.location.pathname !== '/dashboard') {
            console.debug('Fallback navigating to /dashboard');
            window.location.href = '/dashboard';
          }
        } catch (e) {
          console.warn('Failed to evaluate fallback navigation', e);
        }
      }, 1500);
    } catch (err: unknown) {
      setLoading(false);
      let message = "Invalid credentials.";
      if (typeof err === "object" && err !== null) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      toast({ title: "Login failed", description: message, variant: "destructive" });
    }
  };

  return (
    <>
      {/* ANIMATIONS */}
      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 1.8s linear infinite;
        }

        @keyframes fadeInCentered {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeInCentered {
          animation: fadeInCentered 0.5s ease-out forwards;
        }
      `}</style>

      {/* =============================== */}
      {/* 1) GLOBAL WHITE LOADING UI     */}
      {/* =============================== */}
      {(loading || storeLoading || checkingAuth) && (
        <div className="fixed inset-0 bg-white flex flex-col justify-center items-center z-50 animate-fadeInCentered">
          {/* Circle Loader */}
          <div className="relative w-48 h-48 mb-6">
            <div className="absolute inset-0 border-4 border-transparent border-t-[#001245] border-r-[#001245] rounded-full animate-spin-slow"></div>

            {/* Institute Logo In Center */}
            <div className="absolute inset-0 m-auto w-[184px] h-[184px] flex items-center justify-center">
              <Image src="/du.png" alt="Institute Logo" width={184} height={184} className="object-contain" priority />
            </div>
          </div>

          {/* Text */}
          <p className="text-slate-600 text-sm tracking-wide">
            Logging you in...
          </p>
        </div>
      )}

      {/* =============================== */}
      {/* 2) NORMAL LOGIN UI         */}
      {/* =============================== */}
      {!loading && (
        <div className="min-h-screen w-full flex bg-white font-sans text-slate-800">

          {/* LEFT SIDE — Logo + Form */}
          <div className="w-1/2 flex flex-col items-center justify-center px-12 bg-[#f6faff]">

            {/* Logo */}
            <Image src="/sarthak_clear.png" alt="Sarthak Logo" width={330} height={80} className="object-contain mb-4" />

            {/* FORM */}
            <div className="w-full max-w-sm mt-6">
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Welcome Back!
              </h2>

              <p className="text-sm text-slate-500 mb-6">
                Sign in to access your institution dashboard.
              </p>

              <p className="text-sm font-semibold text-slate-800 mb-6">
                Admin Login • Sarthak
              </p>

              <form className="space-y-5" onSubmit={handleLogin}>

                {/* Email */}
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your admin email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Options */}
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-3 h-3" />
                    Remember Me
                  </label>
                  <a href="#" className="hover:underline">Forgot Password?</a>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="block w-40 mx-auto bg-slate-900 text-white font-bold py-2.5 rounded-full hover:bg-slate-800 transition shadow-md"
                  disabled={storeLoading}
                >
                  Sign In
                </button>
              </form>

              {/* Bottom Link */}
              <p className="text-center text-xs text-slate-600 mt-8">
                Don’t have an account?{" "}
                <a href="#" className="font-bold text-slate-900 hover:underline">
                  Register Institution
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT SIDE — FEATURES GRID (FIXED LAYOUT) */}
          <div className="w-1/2 flex flex-col px-14 bg-white relative">

            {/* 1. Main Content Wrapper: Takes available space and centers content */}
            <div className="flex-1 flex flex-col justify-center z-10">
              <h1 className="text-4xl font-bold mb-3">Manage Smarter with Sarthak</h1>
              <p className="text-slate-500 text-sm mb-10">
                Tools crafted for seamless institutional administration.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: <LayoutDashboard size={22} />, title: "Dashboard" },
                  { icon: <Users size={22} />, title: "Alumni Directory" },
                  { icon: <Calendar size={22} />, title: "Event Platform" },
                  { icon: <BookOpen size={22} />, title: "Resource Center" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="p-3 bg-blue-100 text-[#001245] rounded-lg w-fit mb-2">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-base text-slate-800">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.title === "Dashboard" && "Control your institution ecosystem."}
                      {item.title === "Alumni Directory" && "Search & manage verified alumni."}
                      {item.title === "Event Platform" && "Organize and track alumni events."}
                      {item.title === "Resource Center" && "Access institutional tools & materials."}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Footer: No longer absolute, sits naturally at the bottom */}
            <div className="py-6 text-center w-full z-10">
              <p className="text-[10px] text-slate-400 tracking-wider font-medium opacity-80">
                Sarthak © 2025 • Built at SIH • De-bugs_
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default SarthakAdminLogin;