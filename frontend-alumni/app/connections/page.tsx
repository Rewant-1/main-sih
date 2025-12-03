"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Loader2,
  MessageCircle,
  Building,
  GraduationCap,
  Clock,
  Check,
  X,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useConnectionsStore, useAuthStore, useChatsStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { alumniApi, studentsApi } from "@/lib/api";
import type { Alumni, Student, Connection } from "@/lib/types";

function ConnectionCard({ 
  connection, 
  type 
}: { 
  connection: Connection; 
  type: "connected" | "pending" | "received";
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { acceptRequest, rejectRequest } = useConnectionsStore();
  const { createChat } = useChatsStore();
  const [isLoading, setIsLoading] = React.useState(false);

  // Determine the other user in the connection
  const otherUser = connection.userId?._id === user?._id 
    ? connection.connectionId 
    : connection.userId;

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await acceptRequest(connection._id);
      toast({
        title: "Connection accepted!",
        description: `You are now connected with ${otherUser?.name}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to accept connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await rejectRequest(connection._id);
      toast({
        title: "Request rejected",
        description: "The connection request has been declined.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessage = async () => {
    try {
      const chat = await createChat(otherUser?._id || "");
      router.push(`/messages?chat=${chat._id}`);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start conversation.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">
              {otherUser?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{otherUser?.name || "User"}</h3>
              <Badge variant="secondary" className="text-xs">
                {otherUser?.userType || "User"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {otherUser?.email}
            </p>
            {type === "pending" && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Request pending
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {type === "connected" && (
              <Button size="sm" variant="outline" onClick={handleMessage}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Message
              </Button>
            )}
            {type === "received" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReject}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Accept
                    </>
                  )}
                </Button>
              </>
            )}
            {type === "pending" && (
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DiscoverCard({ 
  person, 
  type 
}: { 
  person: Alumni | Student; 
  type: "alumni" | "student";
}) {
  const { toast } = useToast();
  const { sendRequest, connections } = useConnectionsStore();
  const [isLoading, setIsLoading] = React.useState(false);

  const isConnected = connections.some(
    (c) => 
      (c.userId?._id === person.userId || c.connectionId?._id === person.userId) &&
      c.status === "Accepted"
  );
  const isPending = connections.some(
    (c) => 
      (c.userId?._id === person.userId || c.connectionId?._id === person.userId) &&
      c.status === "Pending"
  );

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await sendRequest(person.userId || "");
      toast({
        title: "Request sent!",
        description: `Connection request sent to ${person.name}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">
              {person.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{person.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {type === "alumni" ? "Alumni" : "Student"}
              </Badge>
            </div>
            {type === "alumni" && (person as Alumni).currentCompany && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Building className="h-3 w-3" />
                {(person as Alumni).jobTitle} at {(person as Alumni).currentCompany}
              </div>
            )}
            {type === "student" && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                {(person as Student).course}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {type === "alumni" 
                ? `Class of ${(person as Alumni).graduationYear}`
                : `Expected ${(person as Student).expectedGraduation}`
              }
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={isConnected || isPending || isLoading}
            variant={isConnected ? "outline" : "default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isConnected ? (
              <>
                <UserCheck className="h-4 w-4 mr-1" />
                Connected
              </>
            ) : isPending ? (
              <>
                <Clock className="h-4 w-4 mr-1" />
                Pending
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-1" />
                Connect
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConnectionsPage() {
  const { connections, fetchConnections, isLoading } = useConnectionsStore();
  const { user } = useAuthStore();
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("connections");
  
  // For discover section
  const [alumni, setAlumni] = React.useState<Alumni[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loadingDiscover, setLoadingDiscover] = React.useState(false);

  React.useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  React.useEffect(() => {
    if (activeTab === "discover") {
      loadDiscoverData();
    }
  }, [activeTab]);

  const loadDiscoverData = async () => {
    setLoadingDiscover(true);
    try {
      const [alumniRes, studentsRes] = await Promise.all([
        alumniApi.getAll(),
        studentsApi.getAll(),
      ]);
      setAlumni(alumniRes.data.data || []);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load discover data:", err);
    } finally {
      setLoadingDiscover(false);
    }
  };

  const connectedConnections = connections.filter(
    (c) => c.status === "Accepted"
  );
  const pendingConnections = connections.filter(
    (c) => c.status === "Pending" && c.userId?._id === user?._id
  );
  const receivedConnections = connections.filter(
    (c) => c.status === "Pending" && c.connectionId?._id === user?._id
  );

  const filteredConnected = connectedConnections.filter((c) => {
    const otherUser = c.userId?._id === user?._id ? c.connectionId : c.userId;
    return otherUser?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredAlumni = alumni.filter(
    (a) =>
      a.name?.toLowerCase().includes(search.toLowerCase()) &&
      a.userId !== user?._id
  );
  const filteredStudents = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) &&
      s.userId !== user?._id
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-muted-foreground">
            Manage your network and discover new connections
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="connections">
              My Connections
              {connectedConnections.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {connectedConnections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {receivedConnections.length > 0 && (
                <Badge variant="default" className="ml-2">
                  {receivedConnections.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <TabsContent value="connections" className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredConnected.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No connections yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your network by discovering alumni and students
                  </p>
                  <Button onClick={() => setActiveTab("discover")}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Discover People
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredConnected.map((connection) => (
                  <ConnectionCard
                    key={connection._id}
                    connection={connection}
                    type="connected"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            {receivedConnections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No pending requests</h3>
                  <p className="text-muted-foreground">
                    When someone sends you a connection request, it will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {receivedConnections.map((connection) => (
                  <ConnectionCard
                    key={connection._id}
                    connection={connection}
                    type="received"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingConnections.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No pending requests</h3>
                  <p className="text-muted-foreground">
                    Connection requests you&apos;ve sent will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingConnections.map((connection) => (
                  <ConnectionCard
                    key={connection._id}
                    connection={connection}
                    type="pending"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-6">
            {loadingDiscover ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Alumni Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Alumni</h2>
                    <Badge variant="secondary">{filteredAlumni.length}</Badge>
                  </div>
                  {filteredAlumni.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No alumni found</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredAlumni.slice(0, 6).map((person) => (
                        <DiscoverCard
                          key={person._id}
                          person={person}
                          type="alumni"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Students Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Students</h2>
                    <Badge variant="secondary">{filteredStudents.length}</Badge>
                  </div>
                  {filteredStudents.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No students found</p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredStudents.slice(0, 6).map((person) => (
                        <DiscoverCard
                          key={person._id}
                          person={person}
                          type="student"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
