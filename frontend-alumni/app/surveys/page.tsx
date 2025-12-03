"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Search,
  Loader2,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Send,
  ChevronRight,
  ChevronLeft,
  Star,
  AlertCircle,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { surveysApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Survey, SurveyQuestion } from "@/lib/types";

export default function SurveysPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [surveys, setSurveys] = React.useState<Survey[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedSurvey, setSelectedSurvey] = React.useState<Survey | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string | string[] | number>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCompleted, setIsCompleted] = React.useState(false);

  const fetchSurveys = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await surveysApi.getActive();
      setSurveys(response.data.data || []);
    } catch {
      // Use mock data for demo
      setSurveys([
        {
          _id: "1",
          title: "Alumni Career Survey 2025",
          description: "Help us understand your career journey and how we can better support current students. This survey will take approximately 10 minutes.",
          questions: [
            {
              id: "q1",
              type: "mcq",
              question: "How satisfied are you with your current career?",
              options: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
              required: true,
            },
            {
              id: "q2",
              type: "checkbox",
              question: "Which skills from your education have been most useful in your career?",
              options: ["Technical Skills", "Communication", "Problem Solving", "Leadership", "Teamwork", "Time Management"],
              required: true,
            },
            {
              id: "q3",
              type: "rating",
              question: "How would you rate the overall quality of education you received?",
              maxRating: 5,
              required: true,
            },
            {
              id: "q4",
              type: "long_text",
              question: "What advice would you give to current students about career preparation?",
              required: false,
            },
            {
              id: "q5",
              type: "mcq",
              question: "Would you be willing to mentor current students?",
              options: ["Yes, definitely", "Maybe", "No"],
              required: true,
            },
          ],
          targetAudience: "alumni",
          isActive: true,
          expiresAt: "2025-03-31T00:00:00Z",
          createdAt: "2024-12-01T00:00:00Z",
        },
        {
          _id: "2",
          title: "Campus Facilities Feedback",
          description: "We want to improve campus facilities for all students and alumni. Share your feedback about current facilities and suggestions for improvement.",
          questions: [
            {
              id: "q1",
              type: "rating",
              question: "How would you rate the library facilities?",
              maxRating: 5,
              required: true,
            },
            {
              id: "q2",
              type: "rating",
              question: "How would you rate the sports facilities?",
              maxRating: 5,
              required: true,
            },
            {
              id: "q3",
              type: "checkbox",
              question: "Which facilities need improvement?",
              options: ["Library", "Sports Complex", "Cafeteria", "Computer Labs", "Auditorium", "Hostels"],
              required: true,
            },
            {
              id: "q4",
              type: "long_text",
              question: "Any specific suggestions for improvement?",
              required: false,
            },
          ],
          targetAudience: "all",
          isActive: true,
          expiresAt: "2025-02-28T00:00:00Z",
          createdAt: "2024-12-15T00:00:00Z",
        },
        {
          _id: "3",
          title: "Event Preferences Survey",
          description: "Help us plan events that matter to you. Tell us about your preferences for alumni events and reunions.",
          questions: [
            {
              id: "q1",
              type: "mcq",
              question: "How often would you like to attend alumni events?",
              options: ["Monthly", "Quarterly", "Annually", "Only major events"],
              required: true,
            },
            {
              id: "q2",
              type: "checkbox",
              question: "What types of events interest you?",
              options: ["Networking", "Career Workshops", "Cultural Events", "Sports Tournaments", "Family Events", "Reunions"],
              required: true,
            },
            {
              id: "q3",
              type: "mcq",
              question: "Preferred event format?",
              options: ["In-person only", "Virtual only", "Hybrid (both options)"],
              required: true,
            },
          ],
          targetAudience: "alumni",
          isActive: true,
          expiresAt: "2025-01-31T00:00:00Z",
          createdAt: "2024-12-20T00:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const handleAnswer = (questionId: string, answer: string | string[] | number) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    if (checked) {
      handleAnswer(questionId, [...currentAnswers, option]);
    } else {
      handleAnswer(questionId, currentAnswers.filter((a) => a !== option));
    }
  };

  const handleSubmit = async () => {
    if (!selectedSurvey) return;

    // Validate required questions
    const unanswered = selectedSurvey.questions.filter(
      (q) => q.required && !answers[q.id]
    );
    if (unanswered.length > 0) {
      toast({
        title: "Please answer all required questions",
        description: `${unanswered.length} required question(s) remaining`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      await surveysApi.submitResponse(selectedSurvey._id, formattedAnswers);
      setIsCompleted(true);
      toast({ title: "Thank you!", description: "Your responses have been submitted" });
    } catch {
      toast({ title: "Error", description: "Failed to submit responses", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setSelectedSurvey(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsCompleted(false);
  };

  const filteredSurveys = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const currentQuestion = selectedSurvey?.questions[currentQuestionIndex];
  const progress = selectedSurvey
    ? ((currentQuestionIndex + 1) / selectedSurvey.questions.length) * 100
    : 0;

  const renderQuestion = (question: SurveyQuestion) => {
    switch (question.type) {
      case "short_text":
        return (
          <Input
            value={(answers[question.id] as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
          />
        );
      case "long_text":
        return (
          <Textarea
            value={(answers[question.id] as string) || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Your answer..."
            rows={4}
          />
        );
      case "mcq":
        return (
          <RadioGroup
            value={(answers[question.id] as string) || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
          >
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                <RadioGroupItem value={option} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent cursor-pointer">
                <Checkbox
                  id={`${question.id}-${i}`}
                  checked={((answers[question.id] as string[]) || []).includes(option)}
                  onCheckedChange={(checked) => handleCheckboxChange(question.id, option, !!checked)}
                />
                <Label htmlFor={`${question.id}-${i}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      case "rating":
        const maxRating = question.maxRating || 5;
        const currentRating = (answers[question.id] as number) || 0;
        return (
          <div className="flex items-center gap-2 justify-center py-4">
            {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleAnswer(question.id, rating)}
                title={`Rate ${rating} out of ${maxRating}`}
                aria-label={`Rate ${rating} out of ${maxRating}`}
                className="p-2 hover:scale-110 transition-transform"
              >
                <Star
                  className={`h-10 w-10 ${rating <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Survey Taking View
  if (selectedSurvey && !isCompleted) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="ghost" onClick={handleStartOver}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Survey
          </Button>

          <div className="space-y-2">
            <h1 className="text-xl font-bold">{selectedSurvey.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Question {currentQuestionIndex + 1} of {selectedSurvey.questions.length}</span>
              <Progress value={progress} className="flex-1 h-2" />
            </div>
          </div>

          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  {currentQuestion?.question}
                </CardTitle>
                {currentQuestion?.required && (
                  <Badge variant="outline" className="text-xs">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Required
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {currentQuestion && renderQuestion(currentQuestion)}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {currentQuestionIndex === selectedSurvey.questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Completion View
  if (isCompleted) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto text-center py-12">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground mb-6">
            Your responses have been submitted successfully. Your feedback helps us improve.
          </p>
          <Button onClick={handleStartOver}>
            Back to Surveys
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Survey List View
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Surveys</h1>
          <p className="text-muted-foreground">
            Share your feedback and help us improve
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search surveys..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Surveys List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active surveys available</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSurveys.map((survey) => (
              <Card key={survey._id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {survey.targetAudience}
                    </Badge>
                    {survey.expiresAt && (
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        Ends {format(new Date(survey.expiresAt), "MMM d")}
                      </span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{survey.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {survey.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    <span>{survey.questions.length} questions</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => setSelectedSurvey(survey)}>
                    Take Survey
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
