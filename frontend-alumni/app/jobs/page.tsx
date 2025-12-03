"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Search,
  Filter,
  Plus,
  Loader2,
  ExternalLink,
  Users,
  Calendar,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobsStore, useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import type { Job } from "@/lib/types";

function JobCard({ job }: { job: Job }) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { applyToJob } = useJobsStore();
  const [isApplying, setIsApplying] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const isStudent = user?.userType === "Student";
  const hasApplied = job.applications?.some(
    (app) => app.studentId === user?._id
  );

  const handleApply = async () => {
    if (!isStudent) {
      toast({
        title: "Not eligible",
        description: "Only students can apply to jobs.",
        variant: "destructive",
      });
      return;
    }

    setIsApplying(true);
    try {
      await applyToJob(job._id);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to apply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowDetails(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <CardDescription>{job.company}</CardDescription>
              </div>
            </div>
            <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>
              {job.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location}
            </div>
            {job.salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {job.salary}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {job.createdAt
                ? format(new Date(job.createdAt), "MMM d, yyyy")
                : "Recently"}
            </div>
          </div>
          <p className="text-sm line-clamp-2">{job.description}</p>
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {job.skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {job.skills.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{job.skills.length - 4}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-3 border-t">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {job.applications?.length || 0} applications
            </div>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleApply();
              }}
              disabled={!isStudent || hasApplied || isApplying}
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasApplied ? (
                "Applied"
              ) : (
                "Apply Now"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building className="h-7 w-7 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{job.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {job.company}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <Badge variant={job.type === "Full-time" ? "default" : "secondary"}>
                {job.type}
              </Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              {job.salary && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {job.salary}
                </div>
              )}
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {job.description}
              </p>
            </div>

            {job.requirements && (
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </div>
            )}

            {job.skills && job.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Skills Required</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Posted by {typeof job.postedBy === 'object' && job.postedBy ? job.postedBy.name : "Alumni"} •{" "}
                {job.applications?.length || 0} applications
              </div>
              <Button
                onClick={handleApply}
                disabled={!isStudent || hasApplied || isApplying}
              >
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : hasApplied ? (
                  "Already Applied"
                ) : (
                  "Apply for this Job"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateJobDialog() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { createJob, isLoading } = useJobsStore();
  const [open, setOpen] = React.useState(false);
  
  const [title, setTitle] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [type, setType] = React.useState("Full-time");
  const [salary, setSalary] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [skillsInput, setSkillsInput] = React.useState("");

  const isAlumni = user?.userType === "Alumni";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createJob({
        title,
        company,
        location,
        type,
        salary,
        description,
        requirements,
        skills: skillsInput.split(",").map((s) => s.trim()).filter(Boolean),
      });
      
      setOpen(false);
      resetForm();
      toast({
        title: "Job posted!",
        description: "Your job posting is now live.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create job posting.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setType("Full-time");
    setSalary("");
    setDescription("");
    setRequirements("");
    setSkillsInput("");
  };

  if (!isAlumni) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Post a Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Job Posting</DialogTitle>
          <DialogDescription>
            Share a job opportunity with students
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input
                id="salary"
                placeholder="e.g., $80,000 - $100,000"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, TypeScript"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function JobsPage() {
  const { jobs, fetchJobs, isLoading } = useJobsStore();
  const { user } = useAuthStore();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
    
    const matchesFilter =
      filter === "all" || job.type?.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-muted-foreground">
              Explore career opportunities from our alumni network
            </p>
          </div>
          <CreateJobDialog />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No jobs found</h3>
              <p className="text-muted-foreground">
                {search || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back later for new opportunities"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
