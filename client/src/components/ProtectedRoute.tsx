import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { Redirect } from "wouter";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
};

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  // If admin access is required but user is not admin, show unauthorized message
  if (requireAdmin && !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Unauthorized Access</h1>
        <p className="text-lg text-center mb-6">
          You do not have permission to access this page. Admin privileges are required.
        </p>
        <a href="/" className="py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90">
          Return to Homepage
        </a>
      </div>
    );
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
}