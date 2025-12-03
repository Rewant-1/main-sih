"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Search,
  Eye,
  Heart,
  Share2,
  Loader2,
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Users,
  Star,
  Plus,
  Filter,
  ArrowLeft,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { successStoriesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { SuccessStory, CreateSuccessStoryData } from "@/lib/types";

const categoryLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  academic_excellence: { label: "Academic Excellence", icon: <GraduationCap className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  career_growth: { label: "Career Growth", icon: <Briefcase className="h-4 w-4" />, color: "bg-green-100 text-green-800" },
  entrepreneurship: { label: "Entrepreneurship", icon: <Lightbulb className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800" },
  research_innovation: { label: "Research & Innovation", icon: <Award className="h-4 w-4" />, color: "bg-purple-100 text-purple-800" },
  social_impact: { label: "Social Impact", icon: <Users className="h-4 w-4" />, color: "bg-pink-100 text-pink-800" },
  other: { label: "Other", icon: <Star className="h-4 w-4" />, color: "bg-gray-100 text-gray-800" },
};

export default function SuccessStoriesPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [stories, setStories] = React.useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [selectedStory, setSelectedStory] = React.useState<SuccessStory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState<CreateSuccessStoryData>({
    title: "",
    content: "",
    excerpt: "",
    category: "career_growth",
    tags: [],
  });
  const [tagInput, setTagInput] = React.useState("");

  const fetchStories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = { status: "published" };
      if (categoryFilter !== "all") params.category = categoryFilter;
      
      const response = await successStoriesApi.getAll(params);
      setStories(response.data.data?.stories || []);
    } catch {
      // Use mock data for demo
      setStories([
        {
          _id: "1",
          title: "From Campus to Google: My Journey",
          content: "After graduating in 2018, I never imagined I'd be working at one of the world's leading tech companies. My journey started with a simple internship and grew into something extraordinary. Here's how I made it happen...\n\nDuring my final year, I focused heavily on competitive programming and contributed to open source projects. This not only improved my coding skills but also helped me build a strong portfolio that caught the attention of recruiters.",
          excerpt: "How a small-town student landed a dream job at Google through persistence and continuous learning.",
          category: "career_growth",
          alumniName: "Rahul Sharma",
          alumniDesignation: "Senior Software Engineer",
          alumniCompany: "Google",
          graduationYear: 2018,
          tags: ["tech", "software", "career"],
          status: "published",
          isFeatured: true,
          views: 2450,
          likes: ["user1", "user2", "user3"],
          shares: 156,
          createdAt: "2024-11-15T00:00:00Z",
          updatedAt: "2024-11-15T00:00:00Z",
        },
        {
          _id: "2",
          title: "Building a EdTech Startup That Reached 1M Students",
          content: "Education was always my passion. After witnessing the digital divide in rural India, I decided to build a platform that could bridge this gap. Three years later, we've impacted over a million students across 15 states.\n\nThe journey wasn't easy. We faced countless rejections from investors and technical challenges that seemed insurmountable. But our team's dedication and belief in our mission kept us going.",
          excerpt: "How passion for education led to founding a startup that's transforming learning for underprivileged students.",
          category: "entrepreneurship",
          alumniName: "Priya Patel",
          alumniDesignation: "Founder & CEO",
          alumniCompany: "EduReach",
          graduationYear: 2015,
          tags: ["startup", "education", "social-impact"],
          status: "published",
          isFeatured: true,
          views: 3210,
          likes: ["user1", "user2"],
          shares: 234,
          createdAt: "2024-10-20T00:00:00Z",
          updatedAt: "2024-10-20T00:00:00Z",
        },
        {
          _id: "3",
          title: "PhD Research That Changed Cancer Treatment",
          content: "My research on targeted drug delivery systems for cancer treatment has now entered clinical trials. This 7-year journey of discovery has been the most challenging and rewarding experience of my life.\n\nIt all started with a question I asked my professor during my undergraduate years. That curiosity led to a research paper, then a PhD, and now potentially life-saving treatment for thousands of patients.",
          excerpt: "From a curious undergraduate to a researcher whose work is now in clinical trials for cancer treatment.",
          category: "research_innovation",
          alumniName: "Dr. Amit Kumar",
          alumniDesignation: "Research Scientist",
          alumniCompany: "Harvard Medical School",
          graduationYear: 2012,
          tags: ["research", "healthcare", "innovation"],
          status: "published",
          views: 1890,
          likes: ["user1"],
          shares: 89,
          createdAt: "2024-09-05T00:00:00Z",
          updatedAt: "2024-09-05T00:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  React.useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleCreateStory = async () => {
    try {
      setIsSaving(true);
      await successStoriesApi.create(formData);
      toast({ title: "Success", description: "Your story has been submitted for review" });
      setIsCreateOpen(false);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        category: "career_growth",
        tags: [],
      });
      fetchStories();
    } catch {
      toast({ title: "Error", description: "Failed to submit story", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLike = async (id: string) => {
    try {
      await successStoriesApi.like(id);
      setStories(stories.map(s => 
        s._id === id 
          ? { ...s, likes: [...(s.likes || []), user?._id || ""] }
          : s
      ));
    } catch {
      toast({ title: "Error", description: "Failed to like story", variant: "destructive" });
    }
  };

  const handleShare = async (id: string) => {
    try {
      await successStoriesApi.share(id);
      await navigator.clipboard.writeText(window.location.href + "/" + id);
      toast({ title: "Link copied!", description: "Share link copied to clipboard" });
    } catch {
      toast({ title: "Error", description: "Failed to share", variant: "destructive" });
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    setFormData({
      ...formData,
      tags: [...(formData.tags || []), tagInput.trim()],
    });
    setTagInput("");
  };

  const filteredStories = stories.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.alumniName?.toLowerCase().includes(search.toLowerCase()) ||
    s.content.toLowerCase().includes(search.toLowerCase())
  );

  const featuredStories = stories.filter(s => s.isFeatured);

  if (selectedStory) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedStory(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stories
          </Button>

          <article className="space-y-6">
            <div className="space-y-4">
              <Badge className={categoryLabels[selectedStory.category]?.color}>
                {categoryLabels[selectedStory.category]?.icon}
                <span className="ml-1">{categoryLabels[selectedStory.category]?.label}</span>
              </Badge>
              <h1 className="text-3xl font-bold">{selectedStory.title}</h1>
              <p className="text-lg text-muted-foreground">{selectedStory.excerpt}</p>
            </div>

            {/* Author Info */}
            <Card>
              <CardContent className="flex items-center gap-4 pt-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold">
                    {selectedStory.alumniName?.charAt(0) || "A"}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedStory.alumniName}</h3>
                  <p className="text-muted-foreground">
                    {selectedStory.alumniDesignation}
                    {selectedStory.alumniCompany && ` at ${selectedStory.alumniCompany}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Class of {selectedStory.graduationYear}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Story Content */}
            <div className="prose prose-lg max-w-none">
              {selectedStory.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>

            {/* Tags */}
            {selectedStory.tags && selectedStory.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedStory.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-6 pt-6 border-t">
              <Button variant="ghost" size="sm" onClick={() => handleLike(selectedStory._id)}>
                <Heart className={`mr-2 h-4 w-4 ${selectedStory.likes?.includes(user?._id || "") ? "fill-red-500 text-red-500" : ""}`} />
                {selectedStory.likes?.length || 0} Likes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleShare(selectedStory._id)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <span className="text-sm text-muted-foreground flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {selectedStory.views || 0} views
              </span>
            </div>
          </article>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Success Stories</h1>
            <p className="text-muted-foreground">
              Inspiring journeys of our alumni community
            </p>
          </div>
          {user?.userType === "Alumni" && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your Story
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Share Your Success Story</DialogTitle>
                  <DialogDescription>
                    Inspire others with your journey. Your story will be reviewed before publishing.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Story Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter an inspiring title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="excerpt">Short Summary</Label>
                    <Input
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      placeholder="Brief summary of your story"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Your Story</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Tell your story..."
                      rows={10}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add tag"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags?.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="cursor-pointer"
                          onClick={() => setFormData({
                            ...formData,
                            tags: formData.tags?.filter((_, idx) => idx !== i),
                          })}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateStory} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Story
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Featured Stories */}
        {featuredStories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Featured Stories
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {featuredStories.slice(0, 2).map((story) => (
                <Card key={story._id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedStory(story)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={categoryLabels[story.category]?.color}>
                        {categoryLabels[story.category]?.label}
                      </Badge>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <CardTitle className="line-clamp-2">{story.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{story.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold">{story.alumniName?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{story.alumniName}</p>
                        <p className="text-sm text-muted-foreground">
                          {story.alumniDesignation} at {story.alumniCompany}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {story.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {story.likes?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" /> {story.shares}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* All Stories */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No stories found</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.filter(s => !s.isFeatured).map((story) => (
              <Card key={story._id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedStory(story)}
              >
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {categoryLabels[story.category]?.icon}
                    <span className="ml-1">{categoryLabels[story.category]?.label}</span>
                  </Badge>
                  <CardTitle className="line-clamp-2 text-lg">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {story.excerpt || story.content.substring(0, 150)}...
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">{story.alumniName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{story.alumniName}</p>
                      <p className="text-xs text-muted-foreground">Class of {story.graduationYear}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {story.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {story.likes?.length || 0}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
