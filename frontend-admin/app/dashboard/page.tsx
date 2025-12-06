"use client";

import { useEffect } from "react";
import { useAuthStore, useUsersStore } from "@/lib/stores";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import TopSkillsChart from "@/components/dashboard/TopSkillsChart";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import Header from "@/components/dashboard/Header";

export default function DashboardPage() {
  const { alumni, fetchAlumni } = useUsersStore();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    fetchAlumni();
  }, [token, fetchAlumni]);

  // Calculate analytics metrics
  const totalAlumni = alumni.length;
  const verifiedAlumni = alumni.filter((a) => a.verified).length;

  // Calculate profile completion (simple heuristic based on filled fields)
  const profileCompletion = alumni.length > 0
    ? alumni.reduce((acc, a) => {
      let completedFields = 0;
      const totalFields = 10;
      // handle nested user info (userId may be a string or User object)
      const u = (a as any).userId || {};
      const getField = (key: string) => (a as any)[key] ?? (u as any)[key];
      if (getField('name')) completedFields++;
      if (getField('email')) completedFields++;
      if (getField('department')) completedFields++;
      if (getField('graduationYear')) completedFields++;
      if (getField('currentCompany')) completedFields++;
      if (getField('jobTitle')) completedFields++;
      if (getField('location')) completedFields++;
      const skills = getField('skills') || [];
      if (Array.isArray(skills) && skills.length > 0) completedFields++;
      if (getField('bio')) completedFields++;
      if (getField('linkedIn') || getField('github')) completedFields++;
      return acc + (completedFields / totalFields * 100);
    }, 0) / alumni.length
    : 0;

  // Calculate employment rate (alumni with currentCompany filled)
  const employmentRate = alumni.length > 0
    ? (alumni.filter(a => ((a as any).currentCompany || ((a as any).userId && (a as any).userId.currentCompany))).length / alumni.length * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      {/* Header with Language Switcher */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center w-full mt-8">
        {/* Navigation Bar */}
        <nav className="bg-[#030e29] text-white rounded-full px-8 py-4 shadow-lg mb-12">
          <ul className="flex items-center gap-6 text-sm font-bold tracking-wide flex-wrap justify-center">
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/dashboard">Dashboard</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/alumni">Alumni</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/students">Students</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/jobs">Jobs</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/events">Events</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/campaigns">Campaigns</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/surveys">Surveys</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/success-stories">Stories</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/posts">Posts</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/newsletters">Newsletters</a></li>
            <li className="cursor-pointer hover:text-gray-300 transition-colors"><a href="/analytics">Analytics</a></li>
          </ul>
        </nav>

        {/* Building Sketch */}
        <div className="w-full max-w-7xl">
          <img
            src="/fot_blue.png"
            alt="Faculty of Technology Building Sketch"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Analytics Dashboard with Real Data */}
        <div className="w-full mt-10 mb-18 px-4 sm:px-6 lg:px-8">
          <AnalyticsDashboard
            totalAlumni={totalAlumni}
            verifiedAlumni={verifiedAlumni}
            profileCompletion={profileCompletion}
            employmentRate={employmentRate}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10 pb-8">
            <TopSkillsChart />
            <RecentActivityWidget />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 flex justify-center items-center bg-white border-t border-[#dbeaff]">
        <p className="text-[#001145] font-bold text-[11px] tracking-wide opacity-40">
          Sarthak © 2025 | Built at SIH | De-bugs_
        </p>
      </footer>
    </div>
  );
}
