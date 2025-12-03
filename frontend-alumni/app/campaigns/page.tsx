"use client";

import * as React from "react";
import { format, differenceInDays } from "date-fns";
import {
  Search,
  Loader2,
  Target,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Heart,
  TrendingUp,
  Clock,
  Gift,
  Filter,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { campaignsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { Campaign, CreateDonationData } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  scholarship: "Scholarship",
  infrastructure: "Infrastructure",
  research: "Research",
  sports: "Sports",
  cultural: "Cultural",
  emergency: "Emergency Fund",
  other: "Other",
};

export default function CampaignsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = React.useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null);
  const [isDonateOpen, setIsDonateOpen] = React.useState(false);
  const [isDonating, setIsDonating] = React.useState(false);

  const [donationData, setDonationData] = React.useState<CreateDonationData>({
    amount: 100,
    message: "",
    isAnonymous: false,
  });

  const fetchCampaigns = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = { status: "active" };
      if (categoryFilter !== "all") params.category = categoryFilter;
      
      const response = await campaignsApi.getAll(params);
      setCampaigns(response.data.data?.campaigns || []);
    } catch {
      // Use mock data for demo
      setCampaigns([
        {
          _id: "1",
          title: "Merit Scholarship Fund 2025",
          description: "Help deserving students achieve their dreams. This scholarship fund supports meritorious students from economically weaker backgrounds to pursue their education without financial constraints. Your contribution can change a student's life forever.",
          goalAmount: 500000,
          currentAmount: 325000,
          startDate: "2024-11-01T00:00:00Z",
          endDate: "2025-03-31T00:00:00Z",
          category: "scholarship",
          milestones: [
            { title: "First 10 Scholarships", targetAmount: 100000, reached: true, description: "Award first 10 scholarships" },
            { title: "25 Scholarships", targetAmount: 250000, reached: true, description: "Expand to 25 students" },
            { title: "50 Scholarships", targetAmount: 500000, reached: false, description: "Full goal - 50 students" },
          ],
          donations: [
            { donorId: "1", donorType: "alumni", amount: 50000, donorName: "Anonymous", isAnonymous: true, donatedAt: "2024-12-01" },
            { donorId: "2", donorType: "alumni", amount: 25000, donorName: "Rahul Sharma", isAnonymous: false, donatedAt: "2024-12-05" },
          ],
          status: "active",
          createdAt: "2024-11-01T00:00:00Z",
          updatedAt: "2024-12-15T00:00:00Z",
        },
        {
          _id: "2",
          title: "New Library Wing Construction",
          description: "Our library needs expansion to accommodate the growing student population. This new wing will include modern study areas, digital resources center, and collaborative spaces for group projects.",
          goalAmount: 2000000,
          currentAmount: 890000,
          startDate: "2024-09-01T00:00:00Z",
          endDate: "2025-06-30T00:00:00Z",
          category: "infrastructure",
          milestones: [
            { title: "Foundation", targetAmount: 500000, reached: true, description: "Complete foundation work" },
            { title: "Structure", targetAmount: 1200000, reached: false, description: "Complete main structure" },
            { title: "Interior", targetAmount: 2000000, reached: false, description: "Full completion with interiors" },
          ],
          donations: [],
          status: "active",
          createdAt: "2024-09-01T00:00:00Z",
          updatedAt: "2024-12-10T00:00:00Z",
        },
        {
          _id: "3",
          title: "Research Lab Equipment Upgrade",
          description: "Upgrade our research laboratories with state-of-the-art equipment to enable cutting-edge research in biotechnology, nanotechnology, and materials science.",
          goalAmount: 750000,
          currentAmount: 680000,
          startDate: "2024-10-01T00:00:00Z",
          endDate: "2025-02-28T00:00:00Z",
          category: "research",
          milestones: [
            { title: "Basic Equipment", targetAmount: 300000, reached: true, description: "Essential lab equipment" },
            { title: "Advanced Tools", targetAmount: 600000, reached: true, description: "Specialized instruments" },
            { title: "Full Upgrade", targetAmount: 750000, reached: false, description: "Complete modernization" },
          ],
          status: "active",
          createdAt: "2024-10-01T00:00:00Z",
          updatedAt: "2024-12-20T00:00:00Z",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  React.useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleDonate = async () => {
    if (!selectedCampaign) return;
    try {
      setIsDonating(true);
      await campaignsApi.donate(selectedCampaign._id, donationData);
      toast({ title: "Thank you!", description: "Your donation has been processed successfully" });
      setIsDonateOpen(false);
      setDonationData({ amount: 100, message: "", isAnonymous: false });
      fetchCampaigns();
    } catch {
      toast({ title: "Error", description: "Failed to process donation", variant: "destructive" });
    } finally {
      setIsDonating(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
  };

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  if (selectedCampaign) {
    const progress = getProgress(selectedCampaign.currentAmount, selectedCampaign.goalAmount);
    const daysLeft = getDaysRemaining(selectedCampaign.endDate);

    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => setSelectedCampaign(null)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campaigns
          </Button>

          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline">{categoryLabels[selectedCampaign.category]}</Badge>
              <h1 className="text-3xl font-bold">{selectedCampaign.title}</h1>
            </div>

            {/* Progress Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-primary">
                        ₹{selectedCampaign.currentAmount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}raised of ₹{selectedCampaign.goalAmount.toLocaleString()} goal
                      </span>
                    </div>
                    <Badge variant={daysLeft < 7 ? "destructive" : "secondary"}>
                      <Clock className="mr-1 h-3 w-3" />
                      {daysLeft} days left
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{progress.toFixed(1)}% funded</span>
                    <span>{selectedCampaign.donations?.length || 0} donors</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donate Button */}
            <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full">
                  <Gift className="mr-2 h-5 w-5" />
                  Donate Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Make a Donation</DialogTitle>
                  <DialogDescription>
                    Support &quot;{selectedCampaign.title}&quot;
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Donation Amount (₹)</Label>
                    <div className="flex gap-2 flex-wrap">
                      {[500, 1000, 2500, 5000, 10000].map((amount) => (
                        <Button
                          key={amount}
                          variant={donationData.amount === amount ? "default" : "outline"}
                          size="sm"
                          onClick={() => setDonationData({ ...donationData, amount })}
                        >
                          ₹{amount.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      placeholder="Or enter custom amount"
                      value={donationData.amount}
                      onChange={(e) => setDonationData({ ...donationData, amount: Number(e.target.value) })}
                      className="mt-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Message (Optional)</Label>
                    <Textarea
                      value={donationData.message}
                      onChange={(e) => setDonationData({ ...donationData, message: e.target.value })}
                      placeholder="Leave a message of support..."
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={donationData.isAnonymous}
                      onCheckedChange={(checked) => setDonationData({ ...donationData, isAnonymous: checked })}
                    />
                    <Label>Donate anonymously</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDonateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDonate} disabled={isDonating || donationData.amount < 100}>
                    {isDonating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Donate ₹{donationData.amount.toLocaleString()}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedCampaign.description}
                </p>
              </CardContent>
            </Card>

            {/* Milestones */}
            {selectedCampaign.milestones && selectedCampaign.milestones.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCampaign.milestones.map((milestone, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`mt-1 h-6 w-6 rounded-full flex items-center justify-center ${milestone.reached ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                          {milestone.reached ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm">{i + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${milestone.reached ? 'text-green-600' : ''}`}>
                              {milestone.title}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ₹{milestone.targetAmount.toLocaleString()}
                            </span>
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Donors */}
            {selectedCampaign.donations && selectedCampaign.donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedCampaign.donations.slice(0, 5).map((donation, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {donation.isAnonymous ? (
                              <Heart className="h-4 w-4 text-primary" />
                            ) : (
                              <span className="text-sm font-bold">
                                {donation.donorName?.charAt(0) || "D"}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {donation.isAnonymous ? "Anonymous" : donation.donorName}
                            </p>
                            {donation.message && (
                              <p className="text-xs text-muted-foreground">{donation.message}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-primary">
                          ₹{donation.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Fundraising Campaigns</h1>
          <p className="text-muted-foreground">
            Support your alma mater through various initiatives
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{campaigns.length}</p>
                  <p className="text-xs text-muted-foreground">Active Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ₹{(campaigns.reduce((acc, c) => acc + c.currentAmount, 0) / 100000).toFixed(1)}L
                  </p>
                  <p className="text-xs text-muted-foreground">Total Raised</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {campaigns.reduce((acc, c) => acc + (c.donations?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Donors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(campaigns.reduce((acc, c) => acc + getProgress(c.currentAmount, c.goalAmount), 0) / Math.max(campaigns.length, 1)).toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
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
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => {
              const progress = getProgress(campaign.currentAmount, campaign.goalAmount);
              const daysLeft = getDaysRemaining(campaign.endDate);

              return (
                <Card key={campaign._id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{categoryLabels[campaign.category]}</Badge>
                      <Badge variant={daysLeft < 7 ? "destructive" : "secondary"} className="text-xs">
                        {daysLeft} days left
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="font-bold text-primary">
                          ₹{campaign.currentAmount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          of ₹{campaign.goalAmount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    {campaign.milestones && campaign.milestones.length > 0 && (
                      <div className="flex items-center gap-1">
                        {campaign.milestones.map((m, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${m.reached ? 'bg-green-500' : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {campaign.donations?.length || 0} donors
                      </span>
                      <span>{progress.toFixed(0)}% funded</span>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
