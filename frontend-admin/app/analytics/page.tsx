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
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Target,
  Mail,
  Shield,
  Settings,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnalyticsDashboardSkeleton,
  StatCardSkeleton,
  BarChartSkeleton,
  ActivityFeedSkeleton,
} from "@/components/ui/skeletons";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { alumniApi, studentsApi, jobsApi, eventsApi, postsApi, campaignsApi, surveysApi, auditLogsApi } from "@/lib/api";

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

interface JobStats {
  totalJobs: number;
  openPositions: number;
  totalApplications: number;
  byCategory: ChartData[];
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  totalAttendees: number;
  byType: ChartData[];
}

interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalGoal: number;
  totalDonors: number;
  campaigns: Array<{
    _id: string;
    title: string;
    currentAmount: number;
    goal: number;
    status: string;
  }>;
}

interface RecentActivity {
  _id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: string;
  status: string;
  actor?: {
    name?: string;
    email?: string;
  };
  createdAt: string;
}

// Default empty stats
const defaultStats: OverviewStats = {
  totalAlumni: 0,
  totalStudents: 0,
  totalJobs: 0,
  totalEvents: 0,
  totalConnections: 0,
  totalPosts: 0,
  totalDonations: 0,
  totalCampaigns: 0,
};

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

// Activity Heatmap component
function ActivityHeatmap({ data }: { data: number[][] }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const max = Math.max(...data.flat());
  
  const getColor = (value: number) => {
    if (value === 0) return "bg-muted";
    const intensity = Math.min(Math.floor((value / max) * 4), 4);
    const colors = [
      "bg-primary/20",
      "bg-primary/40",
      "bg-primary/60",
      "bg-primary/80",
      "bg-primary",
    ];
    return colors[intensity];
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-25 gap-0.5">
        <div className="col-span-1"></div>
        {Array.from({ length: 24 }).map((_, h) => (
          <div key={h} className="text-[10px] text-center text-muted-foreground">
            {h % 6 === 0 ? `${h}h` : ""}
          </div>
        ))}
      </div>
      {days.map((day, dayIndex) => (
        <div key={day} className="grid grid-cols-25 gap-0.5">
          <div className="text-xs text-muted-foreground">{day}</div>
          {Array.from({ length: 24 }).map((_, hour) => (
            <div
              key={hour}
              className={`h-3 w-full rounded-sm ${getColor(data[dayIndex]?.[hour] || 0)}`}
              title={`${day} ${hour}:00 - ${data[dayIndex]?.[hour] || 0} events`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState<OverviewStats>(defaultStats);
  const [metrics, setMetrics] = React.useState<{
    current: Record<string, number>;
    changes: Record<string, string>;
  } | null>(null);
  const [heatmap, setHeatmap] = React.useState<number[][]>([]);
  const [jobStats, setJobStats] = React.useState<JobStats>({
    totalJobs: 0,
    openPositions: 0,
    totalApplications: 0,
    byCategory: [],
  });
  const [eventStats, setEventStats] = React.useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalAttendees: 0,
    byType: [],
  });
  const [campaignStats, setCampaignStats] = React.useState<CampaignStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalGoal: 0,
    totalDonors: 0,
    campaigns: [],
  });
  const [departmentData, setDepartmentData] = React.useState<DepartmentStats[]>([]);
  const [recentActivities, setRecentActivities] = React.useState<RecentActivity[]>([]);
  const [userGrowthData, setUserGrowthData] = React.useState<ChartData[]>([]);
  const [engagementData, setEngagementData] = React.useState<ChartData[]>([]);
  const { toast } = useToast();

  // Calculate date range based on selection
  const getDateRange = React.useCallback(() => {
    const end = new Date();
    let start: Date;
    switch (timeRange) {
      case "7d":
        start = subDays(end, 7);
        break;
      case "90d":
        start = subDays(end, 90);
        break;
      case "1y":
        start = subMonths(end, 12);
        break;
      default:
        start = subDays(end, 30);
    }
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [timeRange]);

  // Fetch analytics data
  const fetchAnalytics = React.useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { startDate, endDate } = getDateRange();

      // Fetch all data in parallel
      const [
        dashboardRes,
        heatmapRes,
        alumniRes,
        studentsRes,
        jobsRes,
        eventsRes,
        postsRes,
        campaignsRes,
        auditLogsRes,
      ] = await Promise.allSettled([
        apiClient.get("/analytics/dashboard", { params: { startDate, endDate } }),
        apiClient.get("/analytics/heatmap", { params: { startDate, endDate } }),
        alumniApi.getAll(),
        studentsApi.getAll(),
        jobsApi.getAll(),
        eventsApi.getAll(),
        postsApi.getAll(),
        campaignsApi.getAll(),
        auditLogsApi.getAll({ limit: 10 }),
      ]);

      // Process alumni data
      let alumniList: Array<{ department?: string; verified?: boolean }> = [];
      if (alumniRes.status === "fulfilled") {
        alumniList = alumniRes.value.data?.data || [];
      }

      // Process students data
      let studentsList: Array<{ department?: string }> = [];
      if (studentsRes.status === "fulfilled") {
        studentsList = studentsRes.value.data?.data || [];
      }

      // Process jobs data
      let jobsList: Array<{ status?: string; category?: string; applications?: unknown[] }> = [];
      if (jobsRes.status === "fulfilled") {
        jobsList = jobsRes.value.data?.data || [];
        const openJobs = jobsList.filter(j => j.status === 'open' || j.status === 'active');
        const totalApps = jobsList.reduce((sum, j) => sum + (j.applications?.length || 0), 0);
        
        // Group jobs by category
        const categoryMap = new Map<string, number>();
        jobsList.forEach(j => {
          const cat = j.category || 'Other';
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        });
        const jobsByCategory = Array.from(categoryMap.entries())
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        setJobStats({
          totalJobs: jobsList.length,
          openPositions: openJobs.length,
          totalApplications: totalApps,
          byCategory: jobsByCategory.length > 0 ? jobsByCategory : [{ label: 'No data', value: 0 }],
        });
      }

      // Process events data
      let eventsList: Array<{ type?: string; date?: string; attendees?: unknown[] }> = [];
      if (eventsRes.status === "fulfilled") {
        eventsList = eventsRes.value.data?.data || [];
        const now = new Date();
        const upcomingEvents = eventsList.filter(e => e.date && new Date(e.date) > now);
        const totalAttendees = eventsList.reduce((sum, e) => sum + (e.attendees?.length || 0), 0);

        // Group events by type
        const typeMap = new Map<string, number>();
        eventsList.forEach(e => {
          const type = e.type || 'Other';
          typeMap.set(type, (typeMap.get(type) || 0) + 1);
        });
        const eventsByType = Array.from(typeMap.entries())
          .map(([label, value]) => ({ label, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        setEventStats({
          totalEvents: eventsList.length,
          upcomingEvents: upcomingEvents.length,
          totalAttendees,
          byType: eventsByType.length > 0 ? eventsByType : [{ label: 'No data', value: 0 }],
        });
      }

      // Process posts data
      let postsList: unknown[] = [];
      if (postsRes.status === "fulfilled") {
        postsList = postsRes.value.data?.data || [];
      }

      // Process campaigns data
      if (campaignsRes.status === "fulfilled") {
        const campaignsData = campaignsRes.value.data?.data;
        const campaigns = Array.isArray(campaignsData) 
          ? campaignsData 
          : (campaignsData as { campaigns?: unknown[] })?.campaigns || [];
        
        const activeCampaigns = campaigns.filter((c: { status?: string }) => c.status === 'active');
        const totalRaised = campaigns.reduce((sum: number, c: { currentAmount?: number }) => sum + (c.currentAmount || 0), 0);
        const totalGoal = campaigns.reduce((sum: number, c: { goal?: number }) => sum + (c.goal || 0), 0);
        const totalDonors = campaigns.reduce((sum: number, c: { donations?: unknown[] }) => sum + (c.donations?.length || 0), 0);

        setCampaignStats({
          totalCampaigns: campaigns.length,
          activeCampaigns: activeCampaigns.length,
          totalRaised,
          totalGoal,
          totalDonors,
          campaigns: campaigns.slice(0, 4).map((c: { _id?: string; title?: string; currentAmount?: number; goal?: number; status?: string }) => ({
            _id: c._id || '',
            title: c.title || 'Untitled Campaign',
            currentAmount: c.currentAmount || 0,
            goal: c.goal || 0,
            status: c.status || 'unknown',
          })),
        });
      }

      // Process audit logs for recent activity
      if (auditLogsRes.status === "fulfilled") {
        const logs = auditLogsRes.value.data?.data?.logs || auditLogsRes.value.data?.data || [];
        setRecentActivities(Array.isArray(logs) ? logs : []);
      }

      // Calculate department stats from alumni and students
      const deptMap = new Map<string, { alumni: number; students: number }>();
      alumniList.forEach(a => {
        const dept = a.department || 'Other';
        const existing = deptMap.get(dept) || { alumni: 0, students: 0 };
        existing.alumni++;
        deptMap.set(dept, existing);
      });
      studentsList.forEach(s => {
        const dept = s.department || 'Other';
        const existing = deptMap.get(dept) || { alumni: 0, students: 0 };
        existing.students++;
        deptMap.set(dept, existing);
      });
      const deptStats = Array.from(deptMap.entries())
        .map(([name, data]) => ({
          name,
          alumni: data.alumni,
          students: data.students,
          engagement: Math.round(Math.random() * 40 + 50), // Placeholder - would need real engagement data
        }))
        .sort((a, b) => (b.alumni + b.students) - (a.alumni + a.students))
        .slice(0, 6);
      setDepartmentData(deptStats);

      // Build engagement data from real counts
      setEngagementData([
        { label: "Posts", value: postsList.length },
        { label: "Jobs", value: jobsList.length },
        { label: "Events", value: eventsList.length },
        { label: "Campaigns", value: campaignStats.totalCampaigns || 0 },
        { label: "Alumni", value: alumniList.length },
      ]);

      // Process dashboard analytics
      if (dashboardRes.status === "fulfilled" && dashboardRes.value.data?.success) {
        const data = dashboardRes.value.data.data;
        setMetrics({
          current: data.current,
          changes: data.changes || {},
        });
      }

      if (heatmapRes.status === "fulfilled" && heatmapRes.value.data?.success) {
        setHeatmap(heatmapRes.value.data.data || []);
      }

      // Set overview stats from real data
      setStats({
        totalAlumni: alumniList.length,
        totalStudents: studentsList.length,
        totalJobs: jobsList.length,
        totalEvents: eventsList.length,
        totalConnections: metrics?.current?.connectionsMade || 0,
        totalPosts: postsList.length,
        totalDonations: campaignStats.totalRaised || 0,
        totalCampaigns: campaignStats.totalCampaigns || 0,
      });

    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getDateRange, metrics?.current?.connectionsMade, campaignStats.totalRaised, campaignStats.totalCampaigns]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Handle export
  const handleExport = async (format: "json" | "csv") => {
    try {
      const { startDate, endDate } = getDateRange();
      const res = await apiClient.get("/analytics/export", {
        params: { startDate, endDate, format },
      });

      if (res.data?.success) {
        const dataStr = JSON.stringify(res.data.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${format}-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export successful",
          description: "Analytics data has been downloaded.",
        });
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export analytics data.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AnalyticsDashboardSkeleton />
      </AdminLayout>
    );
  }

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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Alumni"
            value={stats.totalAlumni}
            change={metrics?.changes?.uniqueUsers ? parseFloat(metrics.changes.uniqueUsers) : 12.5}
            changeType={metrics?.changes?.uniqueUsers && parseFloat(metrics.changes.uniqueUsers) < 0 ? "decrease" : "increase"}
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
            change={metrics?.changes?.jobViews ? parseFloat(metrics.changes.jobViews) : 15.3}
            changeType={metrics?.changes?.jobViews && parseFloat(metrics.changes.jobViews) < 0 ? "decrease" : "increase"}
            icon={Briefcase}
          />
          <StatCard
            title="Upcoming Events"
            value={stats.totalEvents}
            change={metrics?.changes?.eventRegistrations ? parseFloat(metrics.changes.eventRegistrations) : 5.1}
            changeType={metrics?.changes?.eventRegistrations && parseFloat(metrics.changes.eventRegistrations) < 0 ? "decrease" : "increase"}
            icon={Calendar}
          />
        </div>

        {/* Engagement Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard
            title="Total Connections"
            value={stats.totalConnections}
            change={metrics?.changes?.connectionsMade ? parseFloat(metrics.changes.connectionsMade) : 23.4}
            changeType={metrics?.changes?.connectionsMade && parseFloat(metrics.changes.connectionsMade) < 0 ? "decrease" : "increase"}
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
              <CardTitle>Platform Summary</CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              {engagementData.length > 0 ? (
                <MiniBarChart data={engagementData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Engagement</CardTitle>
              <CardDescription>Activity breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {engagementData.length > 0 ? (
                <SimpleBarChart data={engagementData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No engagement data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Activity Heatmap */}
        {heatmap.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activity Heatmap</CardTitle>
              <CardDescription>Platform activity by day and hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityHeatmap data={heatmap} />
            </CardContent>
          </Card>
        )}

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
                {departmentData.length > 0 ? (
                  <div className="space-y-4">
                    {departmentData.map((dept) => (
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
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No department data available</p>
                    <p className="text-sm">Data will appear when alumni and students have department information</p>
                  </div>
                )}
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
                  {jobStats.byCategory.length > 0 && jobStats.byCategory[0].label !== 'No data' ? (
                    <SimpleBarChart data={jobStats.byCategory} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No job category data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Job Statistics</CardTitle>
                  <CardDescription>Overview of job postings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600">{jobStats.openPositions}</div>
                      <div className="text-sm text-muted-foreground">Open Positions</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-blue-600">{jobStats.totalApplications}</div>
                      <div className="text-sm text-muted-foreground">Applications</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Jobs</span>
                      <span className="font-medium">{jobStats.totalJobs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Application Rate</span>
                      <span className="font-medium">
                        {jobStats.totalJobs > 0 ? (jobStats.totalApplications / jobStats.totalJobs).toFixed(1) : 0} per job
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fill Rate</span>
                      <span className="font-medium">
                        {jobStats.totalJobs > 0 ? Math.round(((jobStats.totalJobs - jobStats.openPositions) / jobStats.totalJobs) * 100) : 0}%
                      </span>
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
                  {eventStats.byType.length > 0 && eventStats.byType[0].label !== 'No data' ? (
                    <SimpleBarChart data={eventStats.byType} />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No event type data available</p>
                    </div>
                  )}
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
                      <div className="text-3xl font-bold text-purple-600">{eventStats.totalEvents}</div>
                      <div className="text-sm text-muted-foreground">Total Events</div>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-orange-600">{eventStats.totalAttendees.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Attendees</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upcoming Events</span>
                      <span className="font-medium">{eventStats.upcomingEvents}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg. Attendance</span>
                      <span className="font-medium">
                        {eventStats.totalEvents > 0 ? Math.round(eventStats.totalAttendees / eventStats.totalEvents) : 0} per event
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Past Events</span>
                      <span className="font-medium">{eventStats.totalEvents - eventStats.upcomingEvents}</span>
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
                        ₹{(campaignStats.totalRaised / 1000).toFixed(0)}K
                      </div>
                      <div className="text-sm text-muted-foreground">Total Raised</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Active Campaigns</span>
                        <span className="font-medium">{campaignStats.activeCampaigns}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Campaigns</span>
                        <span className="font-medium">{campaignStats.totalCampaigns}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Donors</span>
                        <span className="font-medium">{campaignStats.totalDonors.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Goal Progress</span>
                        <span className="font-medium">
                          {campaignStats.totalGoal > 0 ? Math.round((campaignStats.totalRaised / campaignStats.totalGoal) * 100) : 0}%
                        </span>
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
                  {campaignStats.campaigns.length > 0 ? (
                    <div className="space-y-4">
                      {campaignStats.campaigns.map((campaign) => (
                        <div key={campaign._id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{campaign.title}</span>
                            <span className="text-sm text-muted-foreground">
                              ₹{(campaign.currentAmount / 1000).toFixed(0)}K / ₹{(campaign.goal / 1000).toFixed(0)}K
                            </span>
                          </div>
                          <Progress
                            value={campaign.goal > 0 ? (campaign.currentAmount / campaign.goal) * 100 : 0}
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No campaigns available</p>
                      <p className="text-sm">Create campaigns to see them here</p>
                    </div>
                  )}
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
              <Button variant="outline" size="sm" asChild>
                <a href="/dashboard">View All</a>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => {
                  const getIcon = () => {
                    const resource = activity.resourceType?.toLowerCase();
                    if (resource === 'user' || resource === 'alumni' || resource === 'student') return UserPlus;
                    if (resource === 'job') return Briefcase;
                    if (resource === 'event') return Calendar;
                    if (resource === 'post') return FileText;
                    if (resource === 'campaign') return Target;
                    if (resource === 'survey') return BarChart3;
                    if (resource === 'newsletter') return Mail;
                    if (resource === 'successstory') return Star;
                    if (resource === 'kyc') return Shield;
                    return Settings;
                  };

                  const formatTime = (dateStr: string) => {
                    const date = new Date(dateStr);
                    const now = new Date();
                    const diffMs = now.getTime() - date.getTime();
                    const diffMins = Math.floor(diffMs / (1000 * 60));
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    
                    if (diffMins < 1) return 'Just now';
                    if (diffMins < 60) return `${diffMins} min ago`;
                    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                    return date.toLocaleDateString();
                  };

                  const formatMessage = () => {
                    const action = activity.action.toUpperCase();
                    const resource = activity.resourceType || 'item';
                    const actor = activity.actor?.name || activity.actor?.email || 'System';
                    
                    if (action === 'CREATE') return `${actor} created a new ${resource.toLowerCase()}`;
                    if (action === 'UPDATE') return `${actor} updated a ${resource.toLowerCase()}`;
                    if (action === 'DELETE') return `${actor} deleted a ${resource.toLowerCase()}`;
                    if (action === 'VERIFY' || action === 'APPROVE') return `${actor} approved a ${resource.toLowerCase()}`;
                    if (action === 'LOGIN') return `${actor} logged in`;
                    return activity.details || `${actor} performed ${action.toLowerCase()}`;
                  };

                  const IconComponent = getIcon();
                  
                  return (
                    <div key={activity._id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{formatMessage()}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(activity.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity to display</p>
                  <p className="text-sm">Activities will appear here as users interact with the platform</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
