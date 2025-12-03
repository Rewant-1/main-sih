"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Search,
  Filter,
  Plus,
  Loader2,
  CalendarDays,
  User,
  CheckCircle,
} from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useEventsStore, useAuthStore } from "@/lib/stores";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/lib/types";

function EventCard({ event }: { event: Event }) {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { registerForEvent } = useEventsStore();
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);

  const isRegistered = event.registeredUsers?.some(
    (u) => (typeof u === 'object' ? u._id : u) === user?._id
  );
  const isPast = new Date(event.date) < new Date();

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      await registerForEvent(event._id);
      toast({
        title: "Registered!",
        description: "You have successfully registered for this event.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const eventDate = new Date(event.date);
  const month = format(eventDate, "MMM");
  const day = format(eventDate, "d");

  return (
    <>
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex">
          <div className="w-20 bg-primary/10 flex flex-col items-center justify-center py-4">
            <span className="text-xs font-medium text-primary uppercase">{month}</span>
            <span className="text-2xl font-bold text-primary">{day}</span>
          </div>
          <div className="flex-1">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {event.organizer?.name || "Alumni Association"}
                  </CardDescription>
                </div>
                <Badge variant={isPast ? "secondary" : event.type === "Online" ? "default" : "outline"}>
                  {isPast ? "Past" : event.type || "In-person"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(eventDate, "h:mm a")}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {event.registeredUsers?.length || 0} registered
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegister();
                }}
                disabled={isRegistered || isPast || isRegistering}
                variant={isRegistered ? "outline" : "default"}
              >
                {isRegistering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isRegistered ? (
                  <>
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Registered
                  </>
                ) : isPast ? (
                  "Event Ended"
                ) : (
                  "Register"
                )}
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-primary uppercase">{month}</span>
                <span className="text-2xl font-bold text-primary">{day}</span>
              </div>
              <div>
                <DialogTitle className="text-xl">{event.title}</DialogTitle>
                <DialogDescription>
                  Organized by {event.organizer?.name || "Alumni Association"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span>{format(eventDate, "EEEE, MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{format(eventDate, "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{event.registeredUsers?.length || 0} attendees</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">About this event</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleRegister}
                disabled={isRegistered || isPast || isRegistering}
              >
                {isRegistering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : isRegistered ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Already Registered
                  </>
                ) : isPast ? (
                  "Event has ended"
                ) : (
                  "Register for Event"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CreateEventDialog() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const { createEvent, isLoading } = useEventsStore();
  const [open, setOpen] = React.useState(false);
  
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [type, setType] = React.useState("In-person");

  const isAlumni = user?.userType === "Alumni";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dateTime = new Date(`${date}T${time}`);
      await createEvent({
        title,
        description,
        date: dateTime.toISOString(),
        venue,
        type,
      });
      
      setOpen(false);
      resetForm();
      toast({
        title: "Event created!",
        description: "Your event has been published.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setVenue("");
    setType("In-person");
  };

  if (!isAlumni) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
          <DialogDescription>
            Organize an event for the alumni community
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Event Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function EventsPage() {
  const { events, fetchEvents, isLoading } = useEventsStore();
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("upcoming");

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());
    
    const isPast = new Date(event.date) < new Date();
    const matchesFilter =
      filter === "all" ||
      (filter === "upcoming" && !isPast) ||
      (filter === "past" && isPast);
    
    return matchesSearch && matchesFilter;
  });

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (filter === "past") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Events</h1>
            <p className="text-muted-foreground">
              Discover and join alumni events
            </p>
          </div>
          <CreateEventDialog />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past Events</SelectItem>
              <SelectItem value="all">All Events</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sortedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No events found</h3>
              <p className="text-muted-foreground">
                {search
                  ? "Try adjusting your search"
                  : filter === "upcoming"
                  ? "No upcoming events. Check back later!"
                  : "No events to show"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
