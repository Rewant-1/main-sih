"use client";

import * as React from "react";
import { format, subDays, subMonths } from "date-fns";
import {
  Users,
  UserPlus,
  Briefcase,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  MessageSquare,
  Link2,
  FileText,
  Award,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Building2,
} from "lucide-react";

import { AdminLayout } from "@/components/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Analytics data types
interface OverviewStats {
  totalAlumni: number;
  totalStudents: number;
  totalJobs: number;
  totalEvents: number;
  totalConnections: number;
  totalPosts: number;
  totalDonations: number;
  totalCampaigns: number;
}

interface TrendData {
  label: string;
  current: number;
  previous: number;
}

interface ChartData {
  label: string;
  value: number;
}

interface DepartmentStats {
  name: string;
  alumni: number;
  students: number;
  engagement: number;
}

// Mock data for analytics
const mockOverviewStats: OverviewStats = {
  totalAlumni: 12543,
  totalStudents: 8234,
  totalJobs: 456,
  totalEvents: 89,
  totalConnections: 23456,
  totalPosts: 4521,
  totalDonations: 345000,
  totalCampaigns: 12,
};

const userGrowthData: ChartData[] = [
  { label: "Jan", value: 120 },
  { label: "Feb", value: 156 },
  { label: "Mar", value: 189 },
  { label: "Apr", value: 234 },
  { label: "May", value: 267 },
  { label: "Jun", value: 312 },
  { label: "Jul", value: 345 },
  { label: "Aug", value: 389 },
  { label: "Sep", value: 423 },
  { label: "Oct", value: 478 },
  { label: "Nov", value: 534 },
  { label: "Dec", value: 589 },
];

const engagementData: ChartData[] = [
  { label: "Posts", value: 4521 },
  { label: "Comments", value: 12345 },
  { label: "Likes", value: 34567 },
  { label: "Shares", value: 2345 },
  { label: "Messages", value: 8765 },
];

const departmentStats: DepartmentStats[] = [
  { name: "Computer Science", alumni: 3245, students: 2100, engagement: 87 },
  { name: "Electrical Engineering", alumni: 2156, students: 1560, engagement: 72 },
  { name: "Mechanical Engineering", alumni: 1987, students: 1234, engagement: 65 },
  { name: "Civil Engineering", alumni: 1567, students: 890, engagement: 58 },
  { name: "Chemical Engineering", alumni: 1234, students: 678, engagement: 54 },
  { name: "Business Administration", alumni: 2354, students: 1772, engagement: 81 },
];

const jobCategoryData: ChartData[] = [
  { label: "Technology", value: 156 },
  { label: "Finance", value: 89 },
  { label: "Healthcare", value: 67 },
  { label: "Education", value: 45 },
  { label: "Manufacturing", value: 56 },
  { label: "Other", value: 43 },
];

const eventTypeData: ChartData[] = [
  { label: "Webinar", value: 34 },
  { label: "Workshop", value: 23 },
  { label: "Reunion", value: 12 },
  { label: "Career Fair", value: 8 },
  { label: "Networking", value: 12 },
];

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease";
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        {change !== undefined && (
          <div className="flex items-center text-xs mt-1">
            {changeType === "increase" ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={changeType === "increase" ? "text-green-500" : "text-red-500"}>
              {change}%
            </span>
            <span className="text-muted-foreground ml-1">from last month</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SimpleBarChart({ data, maxValue }: { data: ChartData[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>{item.label}</span>
            <span className="font-medium">{item.value.toLocaleString()}</span>
          </div>
          <Progress value={(item.value / max) * 100} className="h-2" />
        </div>
      ))}
    </div>
  );
}

function MiniBarChart({ data }: { data: ChartData[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
            style={{ height: `${(item.value / max) * 100}%` }}
            title={`${item.label}: ${item.value}`}
          />
          <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
            {item.label.substring(0, 3)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [stats] = React.useState<OverviewStats>(mockOverviewStats);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor platform performance and engagement
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Alumni"
            value={stats.totalAlumni}
            change={12.5}
            changeType="increase"
            icon={GraduationCap}
          />
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            change={8.2}
            changeType="increase"
            icon={Users}
          />
          <StatCard
            title="Active Jobs"
            value={stats.totalJobs}
            change={15.3}
            changeType="increase"
            icon={Briefcase}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.totalEvents}
            change={5.1}
            changeType="decrease"
            icon={Calendar}
          />
        </div>

        {/* Engagement Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Connections"
            value={stats.totalConnections}
            change={23.4}
            changeType="increase"
            icon={Link2}
          />
          <StatCard
            title="Total Posts"
            value={stats.totalPosts}
            change={18.7}
            changeType="increase"
            icon={FileText}
          />
          <StatCard
            title="Total Donations"
            value={`$${(stats.totalDonations / 1000).toFixed(0)}K`}
            change={45.2}
            changeType="increase"
            icon={DollarSign}
          />
          <StatCard
            title="Active Campaigns"
            value={stats.totalCampaigns}
            icon={Award}
            description="2 ending soon"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Growth */}
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={userGrowthData} />
            </CardContent>
          </Card>

          {/* Engagement Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>Activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleBarChart data={engagementData} />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for detailed analytics */}
        <Tabs defaultValue="departments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="departments">By Department</TabsTrigger>
            <TabsTrigger value="jobs">Jobs Analytics</TabsTrigger>
            <TabsTrigger value="events">Events Analytics</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Statistics</CardTitle>
                <CardDescription>
                  Alumni and student distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept) => (
                    <div key={dept.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dept.name}</span>
                        </div>
                        <Badge variant="outline">
                          {dept.engagement}% engagement
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Alumni</span>
                          <div className="font-bold text-lg">{dept.alumni.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Students</span>
                          <div className="font-bold text-lg">{dept.students.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total</span>
                          <div className="font-bold text-lg">
                            {(dept.alumni + dept.students).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Progress value={dept.engagement} className="mt-3 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Jobs by Category</CardTitle>
                  <CardDescription>Distribution of job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={jobCategoryData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Job Posting Trends</CardTitle>
                  <CardDescription>Monthly job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">156</div>
                      <div className="text-sm text-muted-foreground">Open Positions</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">234</div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Application Rate</span>
                      <span className="font-medium">1.5 per job</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. Time to Fill</span>
                      <span className="font-medium">21 days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span className="font-medium">8.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Events by Type</CardTitle>
                  <CardDescription>Distribution of event types</CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart data={eventTypeData} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Event Performance</CardTitle>
                  <CardDescription>Attendance and engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-600">89</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">4,567</div>
                      <div className="text-sm text-muted-foreground">Total Attendees</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg. Attendance</span>
                      <span className="font-medium">51 per event</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Registration Rate</span>
                      <span className="font-medium">67%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction Score</span>
                      <span className="font-medium">4.5/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Fundraising Overview</CardTitle>
                  <CardDescription>Campaign performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center border rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">
                        ${(stats.totalDonations / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Total Raised</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Campaigns</span>
                        <span className="font-medium">{stats.totalCampaigns}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Donors</span>
                        <span className="font-medium">1,234</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Avg. Donation</span>
                        <span className="font-medium">$280</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Campaigns</CardTitle>
                  <CardDescription>Best performing fundraising campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Scholarship Fund 2024", raised: 125000, goal: 150000 },
                      { name: "New Library Building", raised: 89000, goal: 200000 },
                      { name: "Research Lab Equipment", raised: 67000, goal: 75000 },
                      { name: "Student Emergency Fund", raised: 45000, goal: 50000 },
                    ].map((campaign) => (
                      <div key={campaign.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{campaign.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ${(campaign.raised / 1000).toFixed(0)}K / ${(campaign.goal / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <Progress
                          value={(campaign.raised / campaign.goal) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: "user", message: "New alumni registered: John Doe (Class of 2020)", time: "2 min ago", icon: UserPlus },
                { type: "job", message: "New job posted: Senior Developer at Google", time: "15 min ago", icon: Briefcase },
                { type: "event", message: "Event registration: Annual Alumni Meet 2024", time: "1 hour ago", icon: Calendar },
                { type: "donation", message: "Donation received: $500 for Scholarship Fund", time: "2 hours ago", icon: DollarSign },
                { type: "post", message: "New post by Jane Smith: Career advice for students", time: "3 hours ago", icon: FileText },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <activity.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
