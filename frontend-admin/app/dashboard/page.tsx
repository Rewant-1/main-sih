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
import { useAuthStore, useUsersStore, useJobsStore, useEventsStore, usePostsStore } from "@/lib/stores";
import { campaignsApi, surveysApi, successStoriesApi, newslettersApi, auditLogsApi } from "@/lib/api";
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
  UserPlus,
  Settings,
  Shield,
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
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const token = useAuthStore((s) => s.token);
  useEffect(() => {
    if (!token) return; // don't attempt fetches until token present
    fetchUsers();
    fetchAlumni();
    fetchStudents();
    fetchJobs();
    fetchEvents();
    fetchPosts();
  }, [token, fetchUsers, fetchAlumni, fetchStudents, fetchJobs, fetchEvents, fetchPosts]);

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

  // Fetch recent activities from audit logs
  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!token) return;
      try {
        setActivitiesLoading(true);
        const response = await auditLogsApi.getAll({ limit: 5 });
        const logs = response.data?.data?.logs || response.data?.data || [];
        setRecentActivities(Array.isArray(logs) ? logs : []);
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        setRecentActivities([]);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchRecentActivities();
  }, [token]);

  const pendingVerifications = alumni.filter((a) => !a.verified).length;
  
  // Helper function to format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Helper function to get activity status
  const getActivityStatus = (activity: RecentActivity): "pending" | "completed" | "alert" => {
    const action = activity.action.toUpperCase();
    if (activity.status === 'failure' || action === 'DELETE' || action === 'REJECT' || action === 'KYC_REJECT') {
      return 'alert';
    }
    if (activity.status === 'pending' || action === 'KYC_SUBMIT') {
      return 'pending';
    }
    return 'completed';
  };

  // Helper function to format activity title
  const formatActivityTitle = (activity: RecentActivity): string => {
    const action = activity.action.toUpperCase();
    const resource = activity.resourceType || '';
    
    // Build title based on action + resourceType from backend enums
    const actionTitleMap: Record<string, Record<string, string>> = {
      'CREATE': {
        'User': 'New User Registration',
        'Alumni': 'New Alumni Registration',
        'Student': 'New Student Registration',
        'Job': 'New Job Posted',
        'Event': 'New Event Created',
        'Post': 'New Post Published',
        'Campaign': 'New Campaign Started',
        'Survey': 'New Survey Created',
        'Newsletter': 'New Newsletter Created',
        'SuccessStory': 'New Success Story Submitted',
        'Connection': 'New Connection Request',
        'Chat': 'New Chat Started',
        'Message': 'New Message Sent',
        'default': 'New Item Created',
      },
      'UPDATE': {
        'User': 'User Profile Updated',
        'Alumni': 'Alumni Profile Updated',
        'Student': 'Student Profile Updated',
        'Job': 'Job Listing Updated',
        'Event': 'Event Details Updated',
        'Post': 'Post Updated',
        'Campaign': 'Campaign Updated',
        'Survey': 'Survey Updated',
        'Newsletter': 'Newsletter Updated',
        'SuccessStory': 'Success Story Updated',
        'default': 'Item Updated',
      },
      'DELETE': {
        'User': 'User Account Deleted',
        'Alumni': 'Alumni Profile Deleted',
        'Job': 'Job Removed',
        'Event': 'Event Cancelled',
        'Post': 'Post Deleted',
        'Campaign': 'Campaign Removed',
        'default': 'Item Deleted',
      },
      'APPROVE': {
        'Alumni': 'Alumni Approved',
        'SuccessStory': 'Success Story Approved',
        'Campaign': 'Campaign Approved',
        'default': 'Item Approved',
      },
      'REJECT': {
        'Alumni': 'Alumni Rejected',
        'SuccessStory': 'Success Story Rejected',
        'KYC': 'KYC Verification Rejected',
        'default': 'Item Rejected',
      },
      'VERIFY': {
        'Alumni': 'Alumni Verified',
        'User': 'User Verified',
        'default': 'Item Verified',
      },
      'LOGIN': { 'default': 'User Login' },
      'LOGOUT': { 'default': 'User Logout' },
      'BULK_IMPORT': { 'default': 'Bulk Import Completed' },
      'EXPORT': { 'default': 'Data Exported' },
      'INVITE_SENT': { 'default': 'Invitation Sent' },
      'PASSWORD_RESET': { 'default': 'Password Reset Requested' },
      'KYC_SUBMIT': { 'default': 'KYC Documents Submitted' },
      'KYC_APPROVE': { 'default': 'KYC Verification Approved' },
      'KYC_REJECT': { 'default': 'KYC Verification Rejected' },
    };
    
    const actionMap = actionTitleMap[action] || {};
    return actionMap[resource] || actionMap['default'] || `${action} ${resource}`.trim();
  };

  // Helper function to format activity description
  const formatActivityDescription = (activity: RecentActivity): string => {
    const actorName = activity.actor?.name || activity.actor?.email || 'System';
    const resource = activity.resourceType?.toLowerCase() || 'item';
    
    if (activity.details) return activity.details;
    
    const action = activity.action.toUpperCase();
    switch(action) {
      case 'CREATE':
        return `${actorName} created a new ${resource}`;
      case 'UPDATE':
        return `${actorName} updated ${resource} details`;
      case 'DELETE':
        return `${actorName} removed a ${resource}`;
      case 'APPROVE':
      case 'VERIFY':
        return `${actorName} approved/verified a ${resource}`;
      case 'REJECT':
        return `${actorName} rejected a ${resource}`;
      case 'LOGIN':
        return `${actorName} logged in`;
      case 'LOGOUT':
        return `${actorName} logged out`;
      case 'BULK_IMPORT':
        return `${actorName} performed a bulk import`;
      case 'INVITE_SENT':
        return `${actorName} sent an invitation`;
      case 'KYC_SUBMIT':
        return `${actorName} submitted KYC documents for verification`;
      case 'KYC_APPROVE':
        return `${actorName} approved KYC verification`;
      case 'KYC_REJECT':
        return `${actorName} rejected KYC verification`;
      default:
        return `${actorName} performed ${activity.action.toLowerCase()}`;
    }
  };

  // Helper to get icon for activity (not used in current render but kept for future use)
  const getActivityIcon = (activity: RecentActivity) => {
    const resource = activity.resourceType?.toLowerCase();
    if (resource === 'user' || resource === 'alumni' || resource === 'student') {
      return UserPlus;
    }
    if (resource === 'job') return Briefcase;
    if (resource === 'event') return Calendar;
    if (resource === 'post') return FileText;
    if (resource === 'campaign') return Target;
    if (resource === 'survey') return ClipboardList;
    if (resource === 'newsletter') return Mail;
    if (resource === 'successstory') return Star;
    if (resource === 'kyc') return Shield;
    const action = activity.action.toUpperCase();
    if (action === 'VERIFY' || action === 'APPROVE') return Shield;
    return Settings;
  };

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
            {activitiesLoading ? (
              // Loading skeletons
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4 rounded-lg border p-4">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-3 w-[300px]" />
                    </div>
                    <Skeleton className="h-3 w-[80px]" />
                  </div>
                ))}
              </>
            ) : recentActivities.length > 0 ? (
              // Real data from audit logs
              recentActivities.map((activity) => (
                <RecentActivityItem
                  key={activity._id}
                  title={formatActivityTitle(activity)}
                  description={formatActivityDescription(activity)}
                  time={formatRelativeTime(activity.createdAt)}
                  status={getActivityStatus(activity)}
                />
              ))
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-sm text-muted-foreground">
                  No recent activity to display
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Activities will appear here as users interact with the platform
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
