"use client";

import { useEffect, useState } from "react";
import PageLayout from "@/components/dashboard/PageLayout";
import { usePostsStore } from "@/lib/stores";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  Heart,
  MessageCircle,
  Trash2,
  Eye,
  FileText,
  TrendingUp,
} from "lucide-react";

export default function PostsPage() {
  const { posts, fetchPosts, deletePost, isLoading } = usePostsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const filteredPosts = posts.filter((post) =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deletePost(postToDelete);
      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const totalLikes = posts.reduce((acc, post) => acc + (Array.isArray(post.likes) ? post.likes.length : 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + (Array.isArray(post.comments) ? post.comments.length : 0), 0);

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
            <p className="text-muted-foreground">
              Moderate and manage community posts
            </p>
          </div>
        </div>

        {/* Stats - Sarthak Theme */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Total Posts</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <FileText className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{posts.length}</p>
          </div>
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Total Likes</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <Heart className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{totalLikes}</p>
          </div>
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Total Comments</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <MessageCircle className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{totalComments}</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                  <div className="flex gap-4 mt-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No posts found</p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const author = post.postedBy | undefined;
              return (
                <Card key={post._id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {author?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {author?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {author?.userType || "User"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm line-clamp-3">{post.content}</p>
                    {post.image && (
                      <div className="mt-3 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={post.image}
                          alt="Post"
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1 text-sm">
                          <Heart className="h-4 w-4" />
                          {Array.isArray(post.likes) ? post.likes.length : 0}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <MessageCircle className="h-4 w-4" />
                          {Array.isArray(post.comments) ? post.comments.length : 0}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedPost(post);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setPostToDelete(post._id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Post Details</DialogTitle>
              <DialogDescription>
                View full post and comments
              </DialogDescription>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(selectedPost.postedBy)?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {(selectedPost.postedBy)?.name || "Unknown User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(selectedPost.createdAt).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-sm">{selectedPost.content}</p>
                {selectedPost.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={selectedPost.image}
                      alt="Post"
                      className="w-full"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1 text-sm">
                    <Heart className="h-4 w-4" />
                    {Array.isArray(selectedPost.likes) ? selectedPost.likes.length : 0} likes
                  </span>
                  <span className="flex items-center gap-1 text-sm">
                    <MessageCircle className="h-4 w-4" />
                    {Array.isArray(selectedPost.comments) ? selectedPost.comments.length : 0} comments
                  </span>
                </div>

                {selectedPost.comments && selectedPost.comments.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Comments</h4>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3">
                        {selectedPost.comments.map((comment, i) => (
                          <div key={i} className="flex gap-2 p-2 rounded-lg bg-muted">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {(comment.user)?.name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium">
                                  {(comment.user)?.name || "Unknown"}
                                </p>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePost}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageLayout>
  );
}
