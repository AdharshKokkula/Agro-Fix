import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the public user type (without sensitive data)
type PublicUser = {
  id: number;
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: PublicUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<{ user: PublicUser; token: string }, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<{ user: PublicUser; token: string }, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = LoginData & {
  isAdmin?: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<{ id: number; username: string; isAdmin: boolean } | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Check for token in localStorage on mount and refetch user data if present
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token && !user) {
      // If we have a token but no user data, refetch user data
      refetch();
    }
  }, [refetch, user]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      
      // Store JWT token in localStorage for persistent auth
      localStorage.setItem("authToken", data.token);
      
      // Load cart data from server
      try {
        const { loadCartFromServer } = await import('@/store/cart');
        await loadCartFromServer();
      } catch (error) {
        console.error('Failed to load cart data:', error);
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      // Redirect based on user role
      if (data.user.isAdmin) {
        window.location.href = "/admin"; // Redirect admin to dashboard
      } else {
        window.location.href = "/"; // Redirect regular user to homepage
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", data);
      return await res.json();
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["/api/user"], data.user);
      
      // Store JWT token in localStorage for persistent auth
      localStorage.setItem("authToken", data.token);
      
      // Initialize an empty cart for new users
      try {
        const { useCart } = await import('@/store/cart');
        const cart = useCart.getState();
        cart.clearCart();
      } catch (error) {
        console.error('Failed to initialize cart:', error);
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
      });
      
      // Redirect based on user role
      if (data.user.isAdmin) {
        window.location.href = "/admin"; // Redirect admin to dashboard
      } else {
        window.location.href = "/"; // Redirect regular user to homepage
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // Remove JWT token from localStorage
      localStorage.removeItem("authToken");
      
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      
      // Redirect to login page
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}