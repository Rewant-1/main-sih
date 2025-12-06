"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Star,
  MoreHorizontal,
  Heart,
  Share2,
  Loader2,
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Users,
} from "lucide-react";

import PageLayout from "@/components/dashboard/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { SuccessStory, CreateSuccessStoryData } from "@/lib/types";

const categoryLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  academic_excellence: { label: "Academic Excellence", icon: <GraduationCap className="h-4 w-4" /> },
  career_growth: { label: "Career Growth", icon: <Briefcase className="h-4 w-4" /> },
  entrepreneurship: { label: "Entrepreneurship", icon: <Lightbulb className="h-4 w-4" /> },
  research_innovation: { label: "Research & Innovation", icon: <Award className="h-4 w-4" /> },
  social_impact: { label: "Social Impact", icon: <Users className="h-4 w-4" /> },
  other: { label: "Other", icon: <Star className="h-4 w-4" /> },
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  pending: "outline",
  published: "default",
  archived: "destructive",
};

export default function SuccessStoriesPage() {
  const { toast } = useToast();
  const [stories, setStories] = React.useState<SuccessStory[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedStory, setSelectedStory] = React.useState<SuccessStory | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [categoryStats, setCategoryStats] = React.useState<{ _id: string; count: number }[]>([]);

  const [formData, setFormData] = React.useState<CreateSuccessStoryData>({
    title: "",
    content: "",
    excerpt: "",
    category: "career_growth",
    alumniName: "",
    alumniDesignation: "",
    alumniCompany: "",
    graduationYear: new Date().getFullYear(),
    tags: [],
  });
  const [tagInput, setTagInput] = React.useState("");

  const fetchStories = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | boolean> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (categoryFilter !== "all") params.category = categoryFilter;
      
      const response = await successStoriesApi.getAll(params);
      setStories(response.data.data?.stories || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch stories", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter, toast]);

  const fetchCategoryStats = React.useCallback(async () => {
    try {
      const response = await successStoriesApi.getCategories();
      setCategoryStats(response.data.data || []);
    } catch {
      // Silently fail
    }
  }, []);

  React.useEffect(() => {
    fetchStories();
    fetchCategoryStats();
  }, [fetchStories, fetchCategoryStats]);

  const handleCreate = async () => {
    try {
      setIsSaving(true);
      await successStoriesApi.create(formData);
      toast({ title: "Success", description: "Story created successfully" });
      setIsDialogOpen(false);
      resetForm();
      fetchStories();
      fetchCategoryStats();
    } catch {
      toast({ title: "Error", description: "Failed to create story", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await successStoriesApi.verify(id);
      toast({ title: "Success", description: "Story verified and published" });
      fetchStories();
    } catch {
      toast({ title: "Error", description: "Failed to verify story", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story?")) return;
    try {
      await successStoriesApi.delete(id);
      toast({ title: "Success", description: "Story deleted" });
      fetchStories();
      fetchCategoryStats();
    } catch {
      toast({ title: "Error", description: "Failed to delete story", variant: "destructive" });
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

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      excerpt: "",
      category: "career_growth",
      alumniName: "",
      alumniDesignation: "",
      alumniCompany: "",
      graduationYear: new Date().getFullYear(),
      tags: [],
    });
  };

  const filteredStories = stories.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.alumniName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalViews = stories.reduce((acc, s) => acc + (s.views || 0), 0);
  const totalLikes = stories.reduce((acc, s) => acc + (s.likes?.length || 0), 0);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Success Stories</h1>
            <p className="text-muted-foreground">
              Showcase inspiring alumni achievements
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Story
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Success Story</DialogTitle>
                <DialogDescription>
                  Share an inspiring alumni success story
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Story Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter story title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="excerpt">Short Excerpt</Label>
                  <Input
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief summary of the story"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Full Story</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Tell the full story..."
                    rows={6}
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
                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Featured Alumni</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="alumniName">Name</Label>
                      <Input
                        id="alumniName"
                        value={formData.alumniName}
                        onChange={(e) => setFormData({ ...formData, alumniName: e.target.value })}
                        placeholder="Alumni name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        type="number"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="alumniDesignation">Designation</Label>
                      <Input
                        id="alumniDesignation"
                        value={formData.alumniDesignation}
                        onChange={(e) => setFormData({ ...formData, alumniDesignation: e.target.value })}
                        placeholder="Current role"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="alumniCompany">Company</Label>
                      <Input
                        id="alumniCompany"
                        value={formData.alumniCompany}
                        onChange={(e) => setFormData({ ...formData, alumniCompany: e.target.value })}
                        placeholder="Company name"
                      />
                    </div>
                  </div>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Story
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Stats */}
        <div className="grid gap-4 md:grid-cols-6">
          {Object.entries(categoryLabels).map(([key, { label, icon }]) => {
            const stat = categoryStats.find((s) => s._id === key);
            return (
              <Card key={key} className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setCategoryFilter(categoryFilter === key ? "all" : key)}
              >
                <CardContent className="flex items-center gap-3 pt-4">
                  <div className={`p-2 rounded-lg ${categoryFilter === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    {icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat?.count || 0}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stories.filter((s) => s.status === "published").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLikes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stories Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Stories</CardTitle>
            <CardDescription>Manage success stories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Story</TableHead>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No stories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStories.map((story) => (
                      <TableRow key={story._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {story.title}
                              {story.isFeatured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {story.excerpt || story.content?.substring(0, 60)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{story.alumniName || "N/A"}</div>
                            <div className="text-sm text-muted-foreground">
                              {story.alumniDesignation} {story.alumniCompany && `at ${story.alumniCompany}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            {categoryLabels[story.category]?.icon}
                            {categoryLabels[story.category]?.label || story.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {story.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {story.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" /> {story.shares || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[story.status] as "default" | "secondary" | "outline" | "destructive"}>
                            {story.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedStory(story);
                                setIsDetailOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              {story.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleVerify(story._id)}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Verify & Publish
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(story._id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Story Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStory?.title}</DialogTitle>
              <DialogDescription>
                <Badge variant="outline" className="mt-2">
                  {categoryLabels[selectedStory?.category || "other"]?.label}
                </Badge>
              </DialogDescription>
            </DialogHeader>
            {selectedStory && (
              <div className="space-y-6">
                {/* Alumni Info */}
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
                <div>
                  <h4 className="font-semibold mb-2">The Story</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedStory.content}
                  </p>
                </div>

                {/* Tags */}
                {selectedStory.tags?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStory.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" /> {selectedStory.views || 0} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Heart className="h-4 w-4" /> {selectedStory.likes?.length || 0} likes
                  </span>
                  <span className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" /> {selectedStory.shares || 0} shares
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
