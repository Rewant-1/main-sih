"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  GraduationCap,
  MapPin,
  Calendar,
  Edit,
  Save,
  Loader2,
  Link as LinkIcon,
  Linkedin,
  Github,
  Twitter,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { alumniApi, studentsApi } from "@/lib/api";
import type { Alumni, Student } from "@/lib/types";

// Type guard to check if profile is Alumni
function isAlumniProfile(profile: Alumni | Student | null): profile is Alumni {
  return profile !== null && 'currentCompany' in profile;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, profile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    bio: "",
    currentCompany: "",
    jobTitle: "",
    industry: "",
    linkedinUrl: "",
    githubUrl: "",
    twitterUrl: "",
    skills: "",
  });

  React.useEffect(() => {
    if (profile) {
      const isAlumni = isAlumniProfile(profile);
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        currentCompany: isAlumni ? profile.currentCompany || "" : "",
        jobTitle: isAlumni ? profile.jobTitle || "" : "",
        industry: isAlumni ? profile.industry || "" : "",
        linkedinUrl: profile.linkedinUrl || "",
        githubUrl: profile.githubUrl || "",
        twitterUrl: profile.twitterUrl || "",
        skills: profile.skills?.join(", ") || "",
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updateData = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      };
      
      if (user?.userType === "Alumni") {
        await alumniApi.update(profile?._id || "", updateData);
      } else {
        await studentsApi.update(profile?._id || "", updateData);
      }
      
      await fetchProfile();
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isAlumni = user?.userType === "Alumni";
  // Cast profile to the correct type for type-safe access
  const alumniProfile = isAlumni && profile ? profile as Alumni : null;
  const studentProfile = !isAlumni && profile ? profile as Student : null;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{user?.userType}</Badge>
                      {alumniProfile?.isVerified && (
                        <Badge variant="secondary">Verified</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => {
                      if (isEditing) {
                        handleSave();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : isEditing ? (
                      <Save className="h-4 w-4 mr-2" />
                    ) : (
                      <Edit className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? "Save Changes" : "Edit Profile"}
                  </Button>
                </div>
                
                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {alumniProfile?.currentCompany && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {alumniProfile.jobTitle} at {alumniProfile.currentCompany}
                    </div>
                  )}
                  {alumniProfile?.graduationYear && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      Class of {alumniProfile.graduationYear}
                    </div>
                  )}
                  {studentProfile?.course && (
                    <div className="flex items-center gap-1">
                      <GraduationCap className="h-4 w-4" />
                      {studentProfile.course}
                    </div>
                  )}
                  {studentProfile?.expectedGraduation && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Expected {studentProfile.expectedGraduation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Tabs defaultValue="about">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            {isAlumni && <TabsTrigger value="work">Work</TabsTrigger>}
          </TabsList>

          <TabsContent value="about" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  Tell others about yourself
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Write a short bio about yourself..."
                      />
                    </div>
                    {isAlumni && (
                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills (comma-separated)</Label>
                        <Input
                          id="skills"
                          name="skills"
                          value={formData.skills}
                          onChange={handleChange}
                          placeholder="React, Node.js, TypeScript, etc."
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Bio</h4>
                      <p className="text-muted-foreground">
                        {profile?.bio || "No bio added yet."}
                      </p>
                    </div>
                    
                    {isAlumni && profile?.skills && profile.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          {isAlumni ? "Course" : "Program"}
                        </h4>
                        <p className="text-muted-foreground">
                          {profile?.course || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          {isAlumni ? "Graduation Year" : "Expected Graduation"}
                        </h4>
                        <p className="text-muted-foreground">
                          {isAlumni
                            ? alumniProfile?.graduationYear
                            : studentProfile?.expectedGraduation || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How others can reach you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <Separator />
                    <h4 className="text-sm font-medium">Social Links</h4>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn</Label>
                      <Input
                        id="linkedinUrl"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="githubUrl">GitHub</Label>
                      <Input
                        id="githubUrl"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterUrl">Twitter</Label>
                      <Input
                        id="twitterUrl"
                        name="twitterUrl"
                        value={formData.twitterUrl}
                        onChange={handleChange}
                        placeholder="https://twitter.com/yourhandle"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-muted-foreground">
                          {profile?.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <h4 className="text-sm font-medium">Social Links</h4>
                    <div className="flex flex-wrap gap-3">
                      {profile?.linkedinUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profile.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile?.githubUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profile.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {profile?.twitterUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={profile.twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Twitter className="h-4 w-4 mr-2" />
                            Twitter
                          </a>
                        </Button>
                      )}
                      {!profile?.linkedinUrl &&
                        !profile?.githubUrl &&
                        !profile?.twitterUrl && (
                          <p className="text-sm text-muted-foreground">
                            No social links added
                          </p>
                        )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isAlumni && (
            <TabsContent value="work" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>
                    Your professional background
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentCompany">Current Company</Label>
                          <Input
                            id="currentCompany"
                            name="currentCompany"
                            value={formData.currentCompany}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jobTitle">Job Title</Label>
                          <Input
                            id="jobTitle"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Input
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            {alumniProfile?.jobTitle || "Job Title"}
                          </h4>
                          <p className="text-muted-foreground">
                            {alumniProfile?.currentCompany || "Company"}
                          </p>
                          {alumniProfile?.industry && (
                            <Badge variant="outline" className="mt-2">
                              {alumniProfile.industry}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
