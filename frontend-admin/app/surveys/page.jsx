"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  MoreHorizontal,
  FileText,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  GripVertical,
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { surveysApi } from "@/lib/api";

const questionTypes = [
  { value: "short", label: "Short Answer" },
  { value: "long", label: "Long Answer" },
  { value: "single_choice", label: "Single Choice" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "rating", label: "Rating (1-5)" },
  { value: "date", label: "Date" },
];

const statusColors = {
  draft: "secondary",
  active: "default",
  closed: "outline",
  archived: "destructive",
};

export default function SurveysPage() {
  const { toast } = useToast();
  const [surveys, setSurveys] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(false);
  const [selectedSurvey, setSelectedSurvey] = React.useState(null);
  const [surveyAnalytics, setSurveyAnalytics] = React.useState(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(null);

  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    questions: [],
    targetAudience: "all",
    isAnonymous: false,
  });

  const [currentQuestion, setCurrentQuestion] = React.useState({
    text: "",
    type: "short",
    options: [],
    isRequired: false,
    order: 0,
  });
  const [optionInput, setOptionInput] = React.useState("");

  const fetchSurveys = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const response = await surveysApi.getAll(params);
      setSurveys(response.data.data?.surveys || []);
    } catch {
      toast({ title: "Error", description: "Failed to fetch surveys", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, toast]);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response = await surveysApi.getOverallAnalytics();
      setAnalytics(response.data?.data || analytics);
    } catch {
      // Silently fail
    }
  }, []);

  React.useEffect(() => {
    fetchSurveys();
    fetchAnalytics();
  }, [fetchSurveys, fetchAnalytics]);

  const handleAddQuestion = () => {
    if (!currentQuestion.text) return;

    const newQuestion = {
      ...currentQuestion,
      order: formData.questions.length,
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });

    setCurrentQuestion({
      text: "",
      type: "short",
      options: [],
      isRequired: false,
      order: 0,
    });
    setOptionInput("");
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    setCurrentQuestion({
      ...currentQuestion,
      options: [...(currentQuestion.options || []), optionInput.trim()],
    });
    setOptionInput("");
  };

  const handleCreate = async () => {
    if (formData.questions.length === 0) {
      toast({ title: "Error", description: "Add at least one question", variant: "destructive" });
      return;
    }

    try {
      setIsSaving(true);
      await surveysApi.create(formData);
      toast({ title: "Success", description: "Survey created successfully" });
      setIsDialogOpen(false);
      resetForm();
      fetchSurveys();
      fetchAnalytics();
    } catch {
      toast({ title: "Error", description: "Failed to create survey", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;
    try {
      await surveysApi.delete(id);
      toast({ title: "Success", description: "Survey deleted" });
      fetchSurveys();
      fetchAnalytics();
    } catch {
      toast({ title: "Error", description: "Failed to delete survey", variant: "destructive" });
    }
  };

  const handleViewAnalytics = async (survey) => {
    try {
      const response = await surveysApi.getAnalytics(survey._id);
      setSurveyAnalytics(response.data?.data || surveyAnalytics);
      setSelectedSurvey(survey);
      setIsAnalyticsOpen(true);
    } catch {
      toast({ title: "Error", description: "Failed to fetch analytics", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      questions: [],
      targetAudience: "all",
      isAnonymous: false,
    });
    setCurrentQuestion({
      text: "",
      type: "short",
      options: [],
      isRequired: false,
      order: 0,
    });
  };

  const filteredSurveys = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Surveys & Feedback</h1>
            <p className="text-muted-foreground">
              Create surveys and collect feedback from alumni
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Survey
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Survey</DialogTitle>
                <DialogDescription>
                  Design a survey to collect feedback from alumni
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="questions">Questions ({formData.questions.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Survey Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter survey title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the purpose of this survey"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="questions" className="space-y-4 mt-4">
                  {/* Question Builder */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Add Question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Question Text</Label>
                        <Input
                          value={currentQuestion.text}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                          placeholder="Enter your question"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Question Type</Label>
                          <Select
                            value={currentQuestion.type}
                            onValueChange={(value) =>
                              setCurrentQuestion({ ...currentQuestion, type: value, options: [] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch
                            checked={currentQuestion.isRequired}
                            onCheckedChange={(checked) =>
                              setCurrentQuestion({ ...currentQuestion, isRequired: checked })
                            }
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      {(currentQuestion.type === "single_choice" || currentQuestion.type === "multiple_choice") && (
                        <div className="grid gap-2">
                          <Label>Options</Label>
                          <div className="flex gap-2">
                            <Input
                              value={optionInput}
                              onChange={(e) => setOptionInput(e.target.value)}
                              placeholder="Add option"
                              onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                            />
                            <Button type="button" variant="outline" onClick={handleAddOption}>
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {currentQuestion.options?.map((opt, i) => (
                              <Badge key={i} variant="secondary" className="cursor-pointer"
                                onClick={() => setCurrentQuestion({
                                  ...currentQuestion,
                                  options: currentQuestion.options?.filter((_, idx) => idx !== i),
                                })}
                              >
                                {opt} ×
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button onClick={handleAddQuestion} className="w-full">
                        Add Question
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  <div className="space-y-2">
                    {formData.questions.map((q, index) => (
                      <Card key={index}>
                        <CardContent className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{q.text}</p>
                              <p className="text-sm text-muted-foreground">
                                {questionTypes.find(t => t.value === q.type)?.label}
                                {q.isRequired && " • Required"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {formData.questions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No questions added yet
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid gap-2">
                    <Label>Target Audience</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="specific_batch">Specific Batch</SelectItem>
                        <SelectItem value="specific_department">Specific Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Start Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.startDate || ""}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        value={formData.endDate || ""}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.isAnonymous}
                      onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
                    />
                    <Label>Anonymous Responses</Label>
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Survey
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Analytics Cards - Sarthak Theme */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Total Surveys</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <FileText className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{analytics?.totalSurveys || 0}</p>
            <p className="text-[#7088aa] text-sm mt-1">{analytics?.activeSurveys || 0} active</p>
          </div>
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Total Responses</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <Users className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{analytics?.totalResponses || 0}</p>
            <p className="text-[#7088aa] text-sm mt-1">Across all surveys</p>
          </div>
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Completion Rate</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <CheckCircle className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{analytics?.avgCompletionRate || 0}%</p>
            <p className="text-[#7088aa] text-sm mt-1">Average rate</p>
          </div>
          <div className="bg-[#f6faff] rounded-2xl p-6 border border-[#e4f0ff]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#7088aa] text-sm font-medium">Active Surveys</span>
              <div className="p-2 bg-[#e4f0ff] rounded-xl">
                <Clock className="h-4 w-4 text-[#4a5f7c]" />
              </div>
            </div>
            <p className="text-4xl font-extrabold text-[#001145]">{analytics?.activeSurveys || 0}</p>
            <p className="text-[#7088aa] text-sm mt-1">Currently running</p>
          </div>
        </div>

        {/* Surveys Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Surveys</CardTitle>
            <CardDescription>View and manage all surveys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search surveys..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
                    <TableHead>Survey</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No surveys found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <TableRow key={survey._id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{survey.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {survey.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{survey.questions?.length || 0}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{survey.responseCount || 0}</span>
                            <span className="text-muted-foreground text-sm ml-1">
                              ({survey.completionRate || 0}% completed)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {survey.targetAudience === "all" ? "Everyone" : survey.targetAudience}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[survey.status]}>
                            {survey.status}
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
                              <DropdownMenuItem onClick={() => handleViewAnalytics(survey)}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(survey._id)}
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

        {/* Analytics Dialog */}
        <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Survey Analytics: {selectedSurvey?.title}</DialogTitle>
              <DialogDescription>
                Detailed response analytics
              </DialogDescription>
            </DialogHeader>
            {surveyAnalytics && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">
                        {(surveyAnalytics)?.totalResponses || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Responses</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">
                        {(surveyAnalytics)?.completionRate || 0}%
                      </div>
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">
                        {Math.round(((surveyAnalytics)?.avgTimeSpent || 0) / 60)}m
                      </div>
                      <p className="text-sm text-muted-foreground">Avg. Time</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">
                        {selectedSurvey?.questions?.length || 0}
                      </div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Device Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      {Object.entries((surveyAnalytics)?.deviceStats || {}).map(([device, count]) => (
                        <Badge key={device} variant="secondary">
                          {device}: {count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
