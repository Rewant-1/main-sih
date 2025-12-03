"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  Loader2,
  Trash2,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { usePostsStore, useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/lib/types";

function CreatePostCard() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { createPost, isLoading } = usePostsStore();
  const [content, setContent] = React.useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    try {
      await createPost({ content });
      setContent("");
      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
            />
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="justify-between py-3">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <ImageIcon className="h-4 w-4 mr-2" />
            Photo
          </Button>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4 mr-2" />
            Feeling
          </Button>
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PostCard({ post }: { post: Post }) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { likePost, commentOnPost, deletePost } = usePostsStore();
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState("");
  const [isLiking, setIsLiking] = React.useState(false);
  const [isCommenting, setIsCommenting] = React.useState(false);

  const handleLike = async () => {
    setIsLiking(true);
    try {
      await likePost(post._id);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to like post.",
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await commentOnPost(post._id, commentText);
      setCommentText("");
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive",
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost(post._id);
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  // Get the author info - handle both postedBy and author
  const authorInfo = typeof post.postedBy === 'object' ? post.postedBy : post.author;
  const authorId = typeof post.postedBy === 'string' ? post.postedBy : authorInfo?._id;
  const isOwner = user?._id === authorId;
  const isLiked = post.likes?.includes(user?._id || "");

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {authorInfo?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{authorInfo?.name || "User"}</span>
                <Badge variant="secondary" className="text-xs">
                  {authorInfo?.userType || "User"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {post.createdAt
                  ? format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")
                  : "Recently"}
              </p>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <div className="mt-3 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt="Post image"
              className="w-full object-cover max-h-96"
            />
          </div>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="flex-col py-2">
        <div className="flex w-full justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={isLiked ? "text-red-500" : ""}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              {post.likes?.length || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments?.length || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
        
        {showComments && (
          <div className="w-full mt-3 space-y-3">
            <Separator />
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleComment}
                  disabled={!commentText.trim() || isCommenting}
                >
                  {isCommenting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {post.comments.map((comment, index) => {
                  const commentUser = typeof comment.user === 'object' ? comment.user : null;
                  return (
                    <div key={index} className="flex gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {commentUser?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                        <p className="text-xs font-medium">
                          {commentUser?.name || "User"}
                        </p>
                        <p className="text-sm">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function FeedPage() {
  const { posts, fetchPosts, isLoading } = usePostsStore();

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Feed</h1>
          <p className="text-muted-foreground">
            Stay connected with your alumni network
          </p>
        </div>

        <CreatePostCard />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. Be the first to share something!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
