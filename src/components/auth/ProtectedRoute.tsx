import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireStaff?: boolean;
}

export function ProtectedRoute({ children, requireStaff = true }: ProtectedRouteProps) {
  const { user, isLoading, isStaff } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireStaff && !isStaff()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Access Pending</h1>
          <p className="text-muted-foreground max-w-md">
            Your account is registered but you haven't been assigned a role yet. 
            Please contact an administrator to get access to the clinic system.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
