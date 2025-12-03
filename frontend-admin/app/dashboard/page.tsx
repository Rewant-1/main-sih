"use client";

import { useEffect } from "react";
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

export default function DashboardPage() {
  const { users, alumni, students, fetchUsers, fetchAlumni, fetchStudents, isLoading: usersLoading } = useUsersStore();
  const { jobs, fetchJobs, isLoading: jobsLoading } = useJobsStore();
  const { events, fetchEvents, isLoading: eventsLoading } = useEventsStore();
  const { posts, fetchPosts, isLoading: postsLoading } = usePostsStore();

  useEffect(() => {
    fetchUsers();
    fetchAlumni();
    fetchStudents();
    fetchJobs();
    fetchEvents();
    fetchPosts();
  }, [fetchUsers, fetchAlumni, fetchStudents, fetchJobs, fetchEvents, fetchPosts]);

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
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <CardDescription>Posts from the community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{posts.length}</Badge>
                  <span className="text-sm text-muted-foreground">
                    total posts
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/posts">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth
              </CardTitle>
              <CardDescription>Network statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{students.length}</Badge>
                  <span className="text-sm text-muted-foreground">
                    students
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/students">View</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

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
