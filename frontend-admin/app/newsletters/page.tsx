"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Send,
  Loader2,
  Mail,
  Users,
  BarChart3,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";

import { AdminLayout } from "@/components/admin-layout";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { ApiResponse } from "@/lib/types";
import api from "@/lib/api-client";

// Newsletter types
interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  recipients: {
    type: "all" | "alumni" | "students" | "custom";
    filters?: {
      graduationYear?: number[];
      department?: string[];
      interests?: string[];
    };
    emails?: string[];
  };
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduledAt?: Date;
  sentAt?: Date;
  stats: {
    totalRecipients: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateNewsletterData {
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  recipientType: "all" | "alumni" | "students" | "custom";
  scheduledAt?: string;
}

// Mock API for newsletter (to be replaced with actual implementation)
const newsletterApi = {
  getAll: (params?: Record<string, string>) => 
    api.get<ApiResponse<{ newsletters: Newsletter[]; total: number }>>("/newsletters", { params }),
  getById: (id: string) => 
    api.get<ApiResponse<Newsletter>>(`/newsletters/${id}`),
  create: (data: CreateNewsletterData) => 
    api.post<ApiResponse<Newsletter>>("/newsletters", data),
  update: (id: string, data: Partial<CreateNewsletterData>) => 
    api.put<ApiResponse<Newsletter>>(`/newsletters/${id}`, data),
  delete: (id: string) => 
    api.delete<ApiResponse<void>>(`/newsletters/${id}`),
  send: (id: string) => 
    api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/send`),
  schedule: (id: string, scheduledAt: string) => 
    api.post<ApiResponse<Newsletter>>(`/newsletters/${id}/schedule`, { scheduledAt }),
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  scheduled: "outline",
  sending: "default",
  sent: "default",
  failed: "destructive",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-3 w-3" />,
  scheduled: <Clock className="h-3 w-3" />,
  sending: <Loader2 className="h-3 w-3 animate-spin" />,
  sent: <CheckCircle2 className="h-3 w-3" />,
  failed: <XCircle className="h-3 w-3" />,
};

export default function NewslettersPage() {
  const { toast } = useToast();
  const [newsletters, setNewsletters] = React.useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = React.useState<Newsletter | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [useHtmlEditor, setUseHtmlEditor] = React.useState(false);

  const [formData, setFormData] = React.useState<CreateNewsletterData>({
    title: "",
    subject: "",
    content: "",
    htmlContent: "",
    recipientType: "all",
    scheduledAt: "",
  });

  const fetchNewsletters = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // For now, using mock data since newsletter backend isn't implemented yet
      // const response = await newsletterApi.getAll();
      // setNewsletters(response.data.data?.newsletters || []);
      setNewsletters([
        {
          _id: "1",
          title: "Monthly Alumni Update - December",
          subject: "December Newsletter: Year in Review",
          content: "Dear Alumni, as we approach the end of the year...",
          recipients: { type: "alumni" },
          status: "sent",
          sentAt: new Date("2024-12-15"),
          stats: {
            totalRecipients: 5420,
            delivered: 5350,
            opened: 2890,
            clicked: 1234,
            bounced: 70,
            unsubscribed: 12,
          },
          createdBy: "admin",
          createdAt: new Date("2024-12-10"),
          updatedAt: new Date("2024-12-15"),
        },
        {
          _id: "2",
          title: "Upcoming Events Newsletter",
          subject: "Exciting Events This Month!",
          content: "Mark your calendars for these upcoming events...",
          recipients: { type: "all" },
          status: "scheduled",
          scheduledAt: new Date("2025-01-05"),
          stats: {
            totalRecipients: 8500,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
          },
          createdBy: "admin",
          createdAt: new Date("2024-12-28"),
          updatedAt: new Date("2024-12-28"),
        },
        {
          _id: "3",
          title: "Career Opportunities Digest",
          subject: "New Job Opportunities from Alumni Network",
          content: "Check out these exciting opportunities...",
          recipients: { type: "students" },
          status: "draft",
          stats: {
            totalRecipients: 3200,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
          },
          createdBy: "admin",
          createdAt: new Date("2024-12-30"),
          updatedAt: new Date("2024-12-30"),
        },
      ]);
    } catch {
      toast({ title: "Error", description: "Failed to fetch newsletters", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchNewsletters();
  }, [fetchNewsletters]);

  const handleCreate = async () => {
    try {
      setIsSaving(true);
      await newsletterApi.create(formData);
      toast({ title: "Success", description: "Newsletter created successfully" });
      setIsDialogOpen(false);
      resetForm();
      fetchNewsletters();
    } catch {
      toast({ title: "Error", description: "Failed to create newsletter", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Are you sure you want to send this newsletter now?")) return;
    try {
      await newsletterApi.send(id);
      toast({ title: "Success", description: "Newsletter is being sent" });
      fetchNewsletters();
    } catch {
      toast({ title: "Error", description: "Failed to send newsletter", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this newsletter?")) return;
    try {
      await newsletterApi.delete(id);
      toast({ title: "Success", description: "Newsletter deleted" });
      fetchNewsletters();
    } catch {
      toast({ title: "Error", description: "Failed to delete newsletter", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      content: "",
      htmlContent: "",
      recipientType: "all",
      scheduledAt: "",
    });
  };

  const filteredNewsletters = newsletters.filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSent = newsletters.filter((n) => n.status === "sent").length;
  const totalRecipients = newsletters.reduce((acc, n) => acc + n.stats.totalRecipients, 0);
  const avgOpenRate = newsletters.filter(n => n.status === "sent").length > 0
    ? (newsletters.filter(n => n.status === "sent")
        .reduce((acc, n) => acc + (n.stats.opened / Math.max(n.stats.delivered, 1)), 0) 
        / newsletters.filter(n => n.status === "sent").length * 100).toFixed(1)
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Newsletters</h1>
            <p className="text-muted-foreground">
              Create and manage email newsletters
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Newsletter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Newsletter</DialogTitle>
                <DialogDescription>
                  Compose a new newsletter to send to your audience
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Newsletter Title (Internal)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., December 2024 Monthly Update"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subject">Email Subject Line</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject recipients will see"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="recipientType">Recipients</Label>
                  <Select
                    value={formData.recipientType}
                    onValueChange={(value: "all" | "alumni" | "students" | "custom") => 
                      setFormData({ ...formData, recipientType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="alumni">Alumni Only</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={useHtmlEditor}
                    onCheckedChange={setUseHtmlEditor}
                  />
                  <Label>Use HTML Editor</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content">
                    {useHtmlEditor ? "HTML Content" : "Newsletter Content"}
                  </Label>
                  <Textarea
                    id="content"
                    value={useHtmlEditor ? formData.htmlContent : formData.content}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [useHtmlEditor ? "htmlContent" : "content"]: e.target.value 
                    })}
                    placeholder={useHtmlEditor 
                      ? "<html>...</html>" 
                      : "Write your newsletter content..."}
                    rows={12}
                    className={useHtmlEditor ? "font-mono text-sm" : ""}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to save as draft
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleCreate} disabled={isSaving}>
                  <FileText className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button onClick={handleCreate} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formData.scheduledAt ? "Schedule" : "Send Now"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Newsletters</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newsletters.length}</div>
              <p className="text-xs text-muted-foreground">{totalSent} sent</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecipients.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Open Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOpenRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {newsletters.filter((n) => n.status === "scheduled").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Newsletters Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Newsletters</CardTitle>
            <CardDescription>Manage your email newsletters</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-4">
                  <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search newsletters..."
                      className="pl-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <TabsContent value="list">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Newsletter</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Performance</TableHead>
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNewsletters.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No newsletters found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNewsletters.map((newsletter) => (
                          <TableRow key={newsletter._id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{newsletter.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {newsletter.subject}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="capitalize">
                                  {newsletter.recipients.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  ({newsletter.stats.totalRecipients.toLocaleString()})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={statusColors[newsletter.status] as "default" | "secondary" | "outline" | "destructive"}
                                className="flex items-center gap-1 w-fit"
                              >
                                {statusIcons[newsletter.status]}
                                {newsletter.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {newsletter.sentAt 
                                  ? format(new Date(newsletter.sentAt), "MMM d, yyyy")
                                  : newsletter.scheduledAt
                                    ? format(new Date(newsletter.scheduledAt), "MMM d, yyyy HH:mm")
                                    : "—"}
                              </div>
                            </TableCell>
                            <TableCell>
                              {newsletter.status === "sent" ? (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Open Rate</span>
                                    <span>
                                      {((newsletter.stats.opened / Math.max(newsletter.stats.delivered, 1)) * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress 
                                    value={(newsletter.stats.opened / Math.max(newsletter.stats.delivered, 1)) * 100} 
                                    className="h-1"
                                  />
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
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
                                    setSelectedNewsletter(newsletter);
                                    setIsPreviewOpen(true);
                                  }}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  {newsletter.status === "draft" && (
                                    <>
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleSend(newsletter._id)}>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Now
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {newsletter.status !== "sent" && (
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={() => handleDelete(newsletter._id)}
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid gap-4">
                  {newsletters.filter(n => n.status === "sent").map((newsletter) => (
                    <Card key={newsletter._id}>
                      <CardHeader>
                        <CardTitle className="text-base">{newsletter.title}</CardTitle>
                        <CardDescription>
                          Sent on {format(new Date(newsletter.sentAt!), "MMM d, yyyy")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-6 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{newsletter.stats.totalRecipients.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Recipients</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{newsletter.stats.delivered.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Delivered</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{newsletter.stats.opened.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Opened</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{newsletter.stats.clicked.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">Clicked</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{newsletter.stats.bounced}</div>
                            <div className="text-xs text-muted-foreground">Bounced</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600">{newsletter.stats.unsubscribed}</div>
                            <div className="text-xs text-muted-foreground">Unsubscribed</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {newsletters.filter(n => n.status === "sent").length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No sent newsletters to analyze
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Newsletter Preview</DialogTitle>
              <DialogDescription>
                {selectedNewsletter?.subject}
              </DialogDescription>
            </DialogHeader>
            {selectedNewsletter && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>To:</strong> {selectedNewsletter.recipients.type === "all" 
                      ? "All Users" 
                      : selectedNewsletter.recipients.type === "alumni"
                        ? "Alumni"
                        : selectedNewsletter.recipients.type === "students"
                          ? "Students"
                          : "Custom"}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    <strong>Subject:</strong> {selectedNewsletter.subject}
                  </div>
                  <div className="border-t pt-4">
                    {selectedNewsletter.htmlContent ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: selectedNewsletter.htmlContent }}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <div className="whitespace-pre-wrap">{selectedNewsletter.content}</div>
                    )}
                  </div>
                </div>

                {selectedNewsletter.status === "sent" && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {((selectedNewsletter.stats.opened / Math.max(selectedNewsletter.stats.delivered, 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Open Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {((selectedNewsletter.stats.clicked / Math.max(selectedNewsletter.stats.opened, 1)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Click Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {((selectedNewsletter.stats.bounced / Math.max(selectedNewsletter.stats.totalRecipients, 1)) * 100).toFixed(2)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Bounce Rate</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
