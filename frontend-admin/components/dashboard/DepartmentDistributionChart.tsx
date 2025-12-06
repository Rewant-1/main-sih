'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Computer Science', value: 450 },
  { name: 'Electronics & Comm.', value: 300 },
  { name: 'Mechanical Eng.', value: 200 },
  { name: 'Civil Eng.', value: 150 },
  { name: 'Information Tech.', value: 100 },
];

// STRICT PALETTE USE:
// Deepest Navy -> Dark Navy -> Dark Slate -> Medium Muted -> Medium Slate
const COLORS = ['#001145', '#001439', '#4a5f7c', '#7088aa', '#a8bdda'];

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      // Using Deep Navy bg with light slate text for contrast
      <div className="bg-[#001145] p-3 border border-[#4a5f7c] rounded-xl shadow-xl">
        <p className="text-sm font-bold text-[#dbeaff] mb-1">{payload[0].name}</p>
        <p className="text-lg font-extrabold text-white">{payload[0].value} Alumni</p>
      </div>
    );
  }
  return null;
};

const renderLegendText = (value: string) => {
  // Using Dark Slate for legend text
  return <span className="text-sm text-[#4a5f7c] font-semibold ml-2">{value}</span>;
};

export default function DepartmentDistributionChart() {
  return (
    // FIXED HEIGHT h-[26rem] & Subtle gradient background card
    <div className="h-[26rem] rounded-[24px] p-6 shadow-sm flex flex-col relative overflow-hidden bg-gradient-to-br from-[#f6f9fe] to-[#e4f0ff]">
      {/* Decorative blur blob in corner */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#dbeaff] rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>

      <h3 className="text-xl font-extrabold text-[#001439] mb-4 z-10">Department Distribution</h3>
      <div className="flex-1 w-full min-h-0 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              stroke="#f6f9fe" // Match bg color for clean gaps
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  // Add subtle shadow to pie segments for depth
                  style={{ filter: `drop-shadow(0px 4px 4px rgba(0, 17, 69, 0.2))` }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={renderLegendText}
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ right: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
