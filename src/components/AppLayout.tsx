import {
  Bell,
  Calendar,
  Home,
  LogOut,
  Settings,
  Users,
  HeartHandshake,
  AlertTriangle,
} from "lucide-react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatedPage } from "./AnimatedPage";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { AppNotification } from "@shared/types";
import { toast } from "sonner";
const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/roster", label: "My Roster", icon: Calendar },
  { href: "/patients", label: "Assigned Patients", icon: Users },
  { href: "/profile", label: "My Profile", icon: Settings },
  { href: "/notifications", label: "Notifications", icon: Bell },
];
const NavItem = ({
  href,
  label,
  icon: Icon,
  isMobile,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isMobile: boolean;
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;
  return (
    <NavLink
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-primary-foreground hover:bg-primary/90 dark:text-gray-400 dark:hover:text-gray-50",
        isActive &&
          "bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground",
        isMobile && "flex-col h-16 justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className={cn(isMobile && "text-xs")}>{label}</span>
    </NavLink>
  );
};
const DesktopSidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-6">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <HeartHandshake className="h-6 w-6 text-primary" />
            <span className="">CareConnect</span>
          </Link>
          <Button asChild variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Link to="/notifications">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Link>
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.filter(item => item.href !== '/notifications').map((item) => (
              <NavItem key={item.href} {...item} isMobile={false} />
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={user?.avatar} alt={user?.fullName} />
              <AvatarFallback>
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{user?.fullName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
const MobileNav = () => (
  <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background/95 backdrop-blur-sm md:hidden">
    <div className="grid grid-cols-5">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} isMobile={true} />
      ))}
    </div>
  </nav>
);
export function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);
  useEffect(() => {
    const pollNotifications = async () => {
      try {
        const latestAlerts = await api<AppNotification[]>('/api/notifications/latest');
        if (latestAlerts.length > 0) {
          const latestAlert = latestAlerts[0];
          if (latestAlert.id !== lastNotificationId) {
            setLastNotificationId(latestAlert.id);
            toast.error(latestAlert.title, {
              description: latestAlert.description,
              icon: <AlertTriangle className="h-5 w-5" />,
              duration: 10000,
              action: {
                label: "View",
                onClick: () => window.location.href = '/notifications',
              },
            });
          }
        }
      } catch (error) {
        // Fail silently to avoid spamming console
      }
    };
    const intervalId = setInterval(pollNotifications, 15000); // Poll every 15 seconds
    return () => clearInterval(intervalId);
  }, [lastNotificationId]);
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <DesktopSidebar />
      <div className="flex flex-col">
        <main
          className={cn(
            "flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/30",
            isMobile && "pb-24"
          )}
        >
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <Outlet />
            </AnimatedPage>
          </AnimatePresence>
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
}