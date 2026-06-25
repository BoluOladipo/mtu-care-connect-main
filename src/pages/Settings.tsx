import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  Bell,
  Calendar,
  Database,
} from "lucide-react";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { UserManagement } from "@/components/settings/UserManagement";
import { RolesPermissions } from "@/components/settings/RolesPermissions";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { AppointmentSettings } from "@/components/settings/AppointmentSettings";
import { SystemSettings } from "@/components/settings/SystemSettings";

const Settings = () => {
  return (
    <AppLayout title="Settings" subtitle="Configure system settings and manage users">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-6">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Roles</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles">
          <RolesPermissions />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentSettings />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
