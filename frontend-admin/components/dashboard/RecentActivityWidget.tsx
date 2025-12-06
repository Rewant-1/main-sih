'use client';

import React from 'react';
import { User, Briefcase, Megaphone, Calendar, Award, ChevronRight } from 'lucide-react';

const activities = [
  {
    id: 1,
    user: 'John Doe',
    action: 'updated profile',
    time: '4 min ago',
    icon: <User size={18} className="text-[#001145]" />, // Dark Navy Icon
    bg: 'bg-[#dbeaff]', // Light Blue Solid BG
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'got a new job',
    time: '13 min ago',
    icon: <Briefcase size={18} className="text-[#001145]" />,
    bg: 'bg-[#e4f0ff]', // Pale Blue Solid BG
  },
  {
    id: 3,
    user: 'Alumni Event',
    action: 'Tech Talk announced',
    time: '20 min ago',
    icon: <Megaphone size={18} className="text-[#001145]" />,
    bg: 'bg-[#f6f9fe]', // Very Pale Blue Solid BG
  },
  {
    id: 4,
    user: 'Robert Fox',
    action: 'posted a new job',
    time: '1 hr ago',
    icon: <Calendar size={18} className="text-[#001145]" />,
    bg: 'bg-[#dbeaff]',
  },
  {
    id: 5,
    user: 'Sarah Lee',
    action: 'verified skills',
    time: '2 hrs ago',
    icon: <Award size={18} className="text-[#001145]" />,
    bg: 'bg-[#e4f0ff]',
  },
];

export default function RecentActivityWidget() {
  return (
    // Clean solid background, standard border
    <div className="h-[26rem] bg-white border border-[#dbeaff] rounded-2xl p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-[#001439]">Recent Activity</h3>
        <button className="flex items-center gap-1 text-sm text-[#4a5f7c] font-semibold hover:text-[#001145] transition-colors">
          View All 
          <ChevronRight size={16} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {activities.map((item) => (
            <div key={item.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#f6f9fe] transition-colors border border-transparent hover:border-[#e4f0ff]">
              {/* Solid Icon Circle */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}>
                {item.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[14px] text-[#001439]">
                  <span className="font-bold">{item.user}</span>{' '}
                  <span className="text-[#7088aa]">{item.action}</span>
                </p>
                <p className="text-xs text-[#a8bdda] font-medium mt-1">
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
