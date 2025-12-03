"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/admin-layout";
import { useUsersStore, useJobsStore, useEventsStore, usePostsStore } from "@/lib/stores";
import { campaignsApi, surveysApi, successStoriesApi, newslettersApi } from "@/lib/api";
import {
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  ClipboardList,
  Star,
  Mail,
  BarChart3,
  Plus,
  ArrowRight,
} from "lucide-react";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span
              className={
                trend.isPositive ? "text-green-600" : "text-red-600"
              }
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%{" "}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function RecentActivityItem({
  title,
  description,
  time,
  status,
}: {
  title: string;
  description: string;
  time: string;
  status: "pending" | "completed" | "alert";
}) {
  const statusIcon = {
    pending: Clock,
    completed: CheckCircle2,
    alert: AlertCircle,
  };
  const StatusIcon = statusIcon[status];
  const statusColor = {
    pending: "text-yellow-500",
    completed: "text-green-500",
    alert: "text-red-500",
  };

  return (
    <div className="flex items-start gap-4 rounded-lg border p-4">
      <StatusIcon className={`h-5 w-5 mt-0.5 ${statusColor[status]}`} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

interface DashboardStats {
  campaigns: {
    total: number;
    active: number;
    totalRaised: number;
    totalGoal: number;
  };
  surveys: {
    total: number;
    active: number;
    totalResponses: number;
  };
  successStories: {
    total: number;
    pending: number;
    featured: number;
  };
  newsletters: {
    total: number;
    sent: number;
    avgOpenRate: number;
  };
}

export default function DashboardPage() {
  const { users, alumni, students, fetchUsers, fetchAlumni, fetchStudents, isLoading: usersLoading } = useUsersStore();
  const { jobs, fetchJobs, isLoading: jobsLoading } = useJobsStore();
  const { events, fetchEvents, isLoading: eventsLoading } = useEventsStore();
  const { posts, fetchPosts, isLoading: postsLoading } = usePostsStore();
  
  const [extendedStats, setExtendedStats] = useState<DashboardStats>({
    campaigns: { total: 0, active: 0, totalRaised: 0, totalGoal: 0 },
    surveys: { total: 0, active: 0, totalResponses: 0 },
    successStories: { total: 0, pending: 0, featured: 0 },
    newsletters: { total: 0, sent: 0, avgOpenRate: 0 },
  });
  const [extendedLoading, setExtendedLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchAlumni();
    fetchStudents();
    fetchJobs();
    fetchEvents();
    fetchPosts();
  }, [fetchUsers, fetchAlumni, fetchStudents, fetchJobs, fetchEvents, fetchPosts]);

  useEffect(() => {
    const fetchExtendedStats = async () => {
      try {
        setExtendedLoading(true);
        const [campaignsRes, surveysRes, storiesRes, newslettersRes] = await Promise.all([
          campaignsApi.getAll().catch(() => ({ data: { data: { campaigns: [] } } })),
          surveysApi.getAll().catch(() => ({ data: { data: { surveys: [] } } })),
          successStoriesApi.getAll().catch(() => ({ data: { data: { stories: [] } } })),
          newslettersApi.getAll().catch(() => ({ data: { data: { newsletters: [] } } })),
        ]);

        // Handle different response structures
        const campaignsData = campaignsRes.data?.data;
        const surveysData = surveysRes.data?.data;
        const storiesData = storiesRes.data?.data;
        const newslettersData = newslettersRes.data?.data;

        // Extract arrays from potentially nested structures
        const campaigns = Array.isArray(campaignsData) 
          ? campaignsData 
          : (campaignsData as { campaigns?: unknown[] })?.campaigns || [];
        const surveys = Array.isArray(surveysData) 
          ? surveysData 
          : (surveysData as { surveys?: unknown[] })?.surveys || [];
        const stories = Array.isArray(storiesData) 
          ? storiesData 
          : (storiesData as { stories?: unknown[] })?.stories || [];
        const newsletters = Array.isArray(newslettersData) 
          ? newslettersData 
          : (newslettersData as { newsletters?: unknown[] })?.newsletters || [];

        setExtendedStats({
          campaigns: {
            total: campaigns.length,
            active: campaigns.filter((c: { status?: string }) => c.status === 'active').length,
            totalRaised: campaigns.reduce((sum: number, c: { currentAmount?: number }) => sum + (c.currentAmount || 0), 0),
            totalGoal: campaigns.reduce((sum: number, c: { goal?: number }) => sum + (c.goal || 0), 0),
          },
          surveys: {
            total: surveys.length,
            active: surveys.filter((s: { status?: string }) => s.status === 'active').length,
            totalResponses: surveys.reduce((sum: number, s: { responseCount?: number }) => sum + (s.responseCount || 0), 0),
          },
          successStories: {
            total: stories.length,
            pending: stories.filter((s: { status?: string }) => s.status === 'pending').length,
            featured: stories.filter((s: { featured?: boolean }) => s.featured).length,
          },
          newsletters: {
            total: newsletters.length,
            sent: newsletters.filter((n: { sentAt?: string | null }) => n.sentAt).length,
            avgOpenRate: newsletters.length > 0
              ? newsletters.reduce((sum: number, n: { openRate?: number }) => sum + (n.openRate || 0), 0) / newsletters.length
              : 0,
          },
        });
      } catch (error) {
        console.error('Failed to fetch extended stats:', error);
      } finally {
        setExtendedLoading(false);
      }
    };

    fetchExtendedStats();
  }, []);

  const pendingVerifications = alumni.filter((a) => !a.verified).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your alumni network.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={users.length}
            description="registered users"
            icon={Users}
            isLoading={usersLoading}
          />
          <StatCard
            title="Alumni"
            value={alumni.length}
            description={`${pendingVerifications} pending verification`}
            icon={GraduationCap}
            isLoading={usersLoading}
          />
          <StatCard
            title="Active Jobs"
            value={jobs.length}
            description="job postings"
            icon={Briefcase}
            isLoading={jobsLoading}
          />
          <StatCard
            title="Events"
            value={events.length}
            description="upcoming events"
            icon={Calendar}
            isLoading={eventsLoading}
          />
        </div>

        {/* Extended Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Campaigns"
            value={extendedStats.campaigns.active}
            description={`₹${(extendedStats.campaigns.totalRaised / 1000).toFixed(0)}K raised of ₹${(extendedStats.campaigns.totalGoal / 1000).toFixed(0)}K goal`}
            icon={Target}
            isLoading={extendedLoading}
            trend={extendedStats.campaigns.totalGoal > 0 ? {
              value: Math.round((extendedStats.campaigns.totalRaised / extendedStats.campaigns.totalGoal) * 100),
              isPositive: true
            } : undefined}
          />
          <StatCard
            title="Surveys"
            value={extendedStats.surveys.active}
            description={`${extendedStats.surveys.totalResponses} total responses`}
            icon={ClipboardList}
            isLoading={extendedLoading}
          />
          <StatCard
            title="Success Stories"
            value={extendedStats.successStories.total}
            description={`${extendedStats.successStories.pending} pending review`}
            icon={Star}
            isLoading={extendedLoading}
          />
          <StatCard
            title="Newsletters"
            value={extendedStats.newsletters.sent}
            description={`${extendedStats.newsletters.avgOpenRate.toFixed(0)}% avg open rate`}
            icon={Mail}
            isLoading={extendedLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Pending Verifications
              </CardTitle>
              <CardDescription>
                Alumni waiting for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={pendingVerifications > 0 ? "destructive" : "secondary"}>
                    {pendingVerifications}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    pending
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/alumni">Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Pending Stories
              </CardTitle>
              <CardDescription>Success stories awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={extendedStats.successStories.pending > 0 ? "destructive" : "secondary"}>
                    {extendedStats.successStories.pending}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    to review
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/success-stories">Review</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics
              </CardTitle>
              <CardDescription>Platform insights & metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    View detailed stats
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/analytics">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Create Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Create new content and campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/campaigns">
                  <Target className="h-5 w-5" />
                  <span>New Campaign</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/surveys">
                  <ClipboardList className="h-5 w-5" />
                  <span>Create Survey</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/newsletters">
                  <Mail className="h-5 w-5" />
                  <span>Send Newsletter</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4" asChild>
                <Link href="/events">
                  <Calendar className="h-5 w-5" />
                  <span>Create Event</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions and updates in your network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RecentActivityItem
              title="New Alumni Registration"
              description="John Doe registered and is waiting for verification"
              time="2 hours ago"
              status="pending"
            />
            <RecentActivityItem
              title="Job Posted"
              description="Software Engineer position at Tech Corp"
              time="4 hours ago"
              status="completed"
            />
            <RecentActivityItem
              title="Event Created"
              description="Annual Alumni Meet 2025 scheduled for Jan 15"
              time="1 day ago"
              status="completed"
            />
            <RecentActivityItem
              title="Verification Needed"
              description="3 alumni accounts require document review"
              time="2 days ago"
              status="alert"
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
