"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  MessageCircle,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  GraduationCap,
  Award,
  Target,
  ClipboardList,
  Menu,
  X,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores";
import { useIsMobile } from "@/hooks/use-mobile";

const navigationItems = [
  {
    title: "Feed",
    href: "/feed",
    icon: Home,
  },
  {
    title: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
  },
  {
    title: "Connections",
    href: "/connections",
    icon: Users,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageCircle,
  },
];

const engagementItems = [
  {
    title: "Success Stories",
    href: "/success-stories",
    icon: Award,
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    icon: Target,
  },
  {
    title: "Surveys",
    href: "/surveys",
    icon: ClipboardList,
  },
];

const profileItems = [
  {
    title: "My Profile",
    href: "/profile",
    icon: User,
  },
];

function AppSidebar() {
  const pathname = usePathname();
  const { user, profile, logout } = useAuthStore();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">AlumniConnect</span>
            <span className="text-xs text-muted-foreground">
              {user?.userType === "Alumni" ? "Alumni Portal" : "Student Portal"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Engagement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {engagementItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-lg p-2 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left text-sm">
                <span className="font-medium">{user?.name || "User"}</span>
                <span className="text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Bottom nav items for mobile
  const bottomNavItems = [
    { title: "Home", href: "/feed", icon: Home },
    { title: "Jobs", href: "/jobs", icon: Briefcase },
    { title: "Events", href: "/events", icon: Calendar },
    { title: "Messages", href: "/messages", icon: MessageCircle },
    { title: "Profile", href: "/profile", icon: User },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        {!isMobile && <AppSidebar />}
        
        <main className="flex-1 pb-16 md:pb-0">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
            {/* Mobile Menu Button */}
            {isMobile ? (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="border-b p-4">
                    <SheetTitle className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      AlumniConnect
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <MobileNavContent onItemClick={() => setMobileMenuOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <SidebarTrigger />
            )}
            
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9"
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </header>
          <div className="p-4 md:p-6">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background safe-area-bottom">
            <div className="flex items-center justify-around h-16">
              {bottomNavItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "fill-primary/20" : ""}`} />
                    <span className="text-xs font-medium">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </SidebarProvider>
  );
}

// Mobile navigation content (for drawer)
function MobileNavContent({ onItemClick }: { onItemClick: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const allNavItems = [
    ...navigationItems,
    ...engagementItems,
    ...profileItems,
  ];

  return (
    <div className="space-y-4 px-4">
      {/* User info */}
      <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
        <Avatar className="h-10 w-10">
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium">{user?.name || "User"}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <Separator />

      {/* Navigation items */}
      <div className="space-y-1">
        {allNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>

      <Separator />

      {/* Logout */}
      <button
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Log out</span>
      </button>
    </div>
  );
}
