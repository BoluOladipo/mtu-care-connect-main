import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Database, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function SystemSettings() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success("Data synchronized successfully");
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Backup, sync, and data settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Automatic Backup</p>
              <p className="text-sm text-muted-foreground">
                Daily backup at midnight
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={(checked) => {
                setAutoBackup(checked);
                toast.success(
                  `Automatic backup ${checked ? "enabled" : "disabled"}`
                );
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Offline Mode</p>
              <p className="text-sm text-muted-foreground">
                Enable offline data capture
              </p>
            </div>
            <Switch
              checked={offlineMode}
              onCheckedChange={(checked) => {
                setOfflineMode(checked);
                toast.success(
                  `Offline mode ${checked ? "enabled" : "disabled"}`
                );
              }}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Last Sync</p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
              {isSyncing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>View system activity and access logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Access detailed audit logs and system activity
            </p>
            <Button className="mt-4" variant="outline">
              View Audit Logs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
