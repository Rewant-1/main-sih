"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Target,
  ClipboardList,
  Award,
  Mail,
  BarChart3,
  Menu,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import api from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.replace("/login");
          return;
        }
        const res = await api.get("/auth/me");
        const role = res.data?.data?.userType;
        if (role !== "Admin") {
          router.replace("/login");
          return;
        }
        if (!cancelled) setChecked(true);
      } catch (err) {
        if (!cancelled) router.replace("/login");
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [router, pathname]);

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking admin access...
      </div>
    );
  }

  return <>{children}</>;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Alumni Management",
    href: "/alumni",
    icon: GraduationCap,
  },
  {
    title: "Students",
    href: "/students",
    icon: Users,
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
    title: "Posts",
    href: "/posts",
    icon: FileText,
  },
];

const engagementItems = [
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
  {
    title: "Success Stories",
    href: "/success-stories",
    icon: Award,
  },
  {
    title: "Newsletters",
    href: "/newsletters",
    icon: Mail,
  },
];

const settingsItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// Mobile navigation drawer content
function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const allNavItems = [
    { label: "Main Menu", items: navigationItems },
    { label: "Engagement", items: engagementItems },
    { label: "System", items: settingsItems },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Shield className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold">Sarthak</span>
              <span className="text-xs text-muted-foreground">Admin Portal</span>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-4">
            {allNavItems.map((group) => (
              <div key={group.label} className="mb-6">
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  {group.label}
                </h3>
                <ul className="space-y-1">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                          }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@alumni.com</p>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold">Sarthak</span>
            <span className="text-xs text-muted-foreground">Admin Portal</span>
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
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
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
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left text-sm">
                <span className="font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">
                  admin@alumni.com
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  // Mobile layout
  if (isMobile) {
    return (
      <AdminGuard>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
            <MobileNav />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sarthak</span>
            </div>
            <div className="flex-1" />
            <Avatar className="h-8 w-8">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </header>
          <main className="flex-1 p-4">{children}</main>
        </div>
      </AdminGuard>
    );
  }

  // Desktop layout
  return (
    <AdminGuard>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1">
            <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4">
              <SidebarTrigger />
              <div className="flex-1" />
            </header>
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </AdminGuard>
  );
}
