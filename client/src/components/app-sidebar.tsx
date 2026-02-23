import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Car, LayoutDashboard, Plus, Mail, Settings, ExternalLink, LogOut, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebsiteSettings } from "@/hooks/use-website-settings";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/admin/cars",
    icon: Car,
  },
  {
    title: "Add New Car",
    url: "/admin/cars/new",
    icon: Plus,
  },
  {
    title: "Inspection Bookings",
    url: "/admin/bookings",
    icon: Calendar,
  },
  {
    title: "General Inquiries",
    url: "/admin/inquiries",
    icon: Mail,
  },
  {
    title: "Website Settings",
    url: "/admin/website-settings",
    icon: Settings,
  },
  {
    title: "View Website",
    url: "/",
    icon: ExternalLink,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { isLoading, ...settings } = useWebsiteSettings();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/admin/login");
  };

  const websiteName = settings?.websiteName || "Auto Import Specialists";

  return (
    <Sidebar>
      <SidebarHeader className="p-6 border-b">
        <h2 className="text-xl font-bold">{websiteName}</h2>
        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Admin Portal</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60">Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      location === item.url || location.startsWith(item.url + "/")
                        ? "bg-sidebar-accent text-primary font-bold border-r-4 border-primary rounded-none"
                        : "hover:text-primary transition-colors"
                    }
                  >
                    <Link href={item.url}>
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
      <SidebarGroup className="mt-auto border-t">
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold">
                <LogOut className="h-4 w-4" />
                <span>Logout Admin</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </SidebarGroup>
    </Sidebar>
  );
}
