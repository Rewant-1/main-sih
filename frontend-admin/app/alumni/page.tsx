"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useUsersStore } from "@/lib/stores";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  GraduationCap,
} from "lucide-react";
import type { Alumni } from "@/lib/types";

export default function AlumniPage() {
  const { alumni, fetchAlumni, verifyAlumni, isLoading } = useUsersStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const filteredAlumni = alumni.filter((a) => {
    const user = a.userId as { name?: string; email?: string } | undefined;
    const name = user?.name || "";
    const email = user?.email || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.graduationYear.toString().includes(searchQuery)
    );
  });

  const handleVerify = async (id: string) => {
    try {
      await verifyAlumni(id);
      toast.success("Alumni verified successfully");
    } catch {
      toast.error("Failed to verify alumni");
    }
  };

  const pendingCount = alumni.filter((a) => !a.verified).length;
  const verifiedCount = alumni.filter((a) => a.verified).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Alumni Management
            </h1>
            <p className="text-muted-foreground">
              Manage and verify alumni accounts
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alumni.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verification
              </CardTitle>
              <XCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alumni Table */}
        <Card>
          <CardHeader>
            <CardTitle>Alumni List</CardTitle>
            <CardDescription>
              View and manage all registered alumni
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search alumni..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Graduation Year</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-40" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredAlumni.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-muted-foreground">No alumni found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlumni.map((alumniItem) => {
                      const user = alumniItem.userId as { name?: string; email?: string } | undefined;
                      return (
                        <TableRow key={alumniItem._id}>
                          <TableCell className="font-medium">
                            {user?.name || "N/A"}
                          </TableCell>
                          <TableCell>{user?.email || "N/A"}</TableCell>
                          <TableCell>{alumniItem.graduationYear}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {alumniItem.skills?.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {alumniItem.skills?.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{alumniItem.skills.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={alumniItem.verified ? "default" : "destructive"}
                            >
                              {alumniItem.verified ? "Verified" : "Pending"}
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
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAlumni(alumniItem);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    window.open(alumniItem.degreeUrl, "_blank")
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  View Degree
                                </DropdownMenuItem>
                                {!alumniItem.verified && (
                                  <DropdownMenuItem
                                    onClick={() => handleVerify(alumniItem._id)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Verify
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Alumni Details</DialogTitle>
              <DialogDescription>
                View detailed information about this alumni
              </DialogDescription>
            </DialogHeader>
            {selectedAlumni && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Name
                  </label>
                  <p className="text-sm">
                    {(selectedAlumni.userId as { name?: string })?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm">
                    {(selectedAlumni.userId as { email?: string })?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Graduation Year
                  </label>
                  <p className="text-sm">{selectedAlumni.graduationYear}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAlumni.skills?.map((skill, i) => (
                      <Badge key={i} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Verification Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedAlumni.verified ? "default" : "destructive"}
                    >
                      {selectedAlumni.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              {selectedAlumni && !selectedAlumni.verified && (
                <Button
                  onClick={() => {
                    handleVerify(selectedAlumni._id);
                    setIsViewDialogOpen(false);
                  }}
                >
                  Verify Alumni
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
