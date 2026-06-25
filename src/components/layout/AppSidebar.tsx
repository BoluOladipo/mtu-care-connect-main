import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Pill,
  FlaskConical,
  Syringe,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Stethoscope,
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const mainNavItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Queue", icon: ClipboardList, path: "/queue" },
  { title: "Appointments", icon: Calendar, path: "/appointments" },
];

const clinicalNavItems = [
  { title: "Patients", icon: Users, path: "/patients" },
  { title: "Consultations", icon: Stethoscope, path: "/consultations" },
  { title: "Laboratory", icon: FlaskConical, path: "/laboratory" },
  { title: "Pharmacy", icon: Pill, path: "/pharmacy" },
  { title: "Immunization", icon: Syringe, path: "/immunization" },
];

const adminNavItems = [
  { title: "Reports", icon: BarChart3, path: "/reports" },
  { title: "Records", icon: FileText, path: "/records" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile, roles, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const getRoleLabel = () => {
    if (roles.includes("admin")) return "Administrator";
    if (roles.includes("doctor")) return "Doctor";
    if (roles.includes("nurse")) return "Nurse";
    if (roles.includes("pharmacist")) return "Pharmacist";
    if (roles.includes("lab_technician")) return "Lab Technician";
    if (roles.includes("receptionist")) return "Receptionist";
    return "Staff";
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-sidebar-foreground">VitaCare(MTU)</span>
            <span className="text-xs text-muted-foreground">Health Centre</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    className="transition-colors hover:bg-sidebar-accent"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Clinical
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinicalNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    className="transition-colors hover:bg-sidebar-accent"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administration
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.path)}
                    className="transition-colors hover:bg-sidebar-accent"
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name ? getInitials(profile.full_name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-sidebar-foreground">
              {profile?.full_name || "User"}
            </span>
            <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
