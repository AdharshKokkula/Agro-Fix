import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define user type
type User = {
  id: number;
  username: string;
  isAdmin: boolean;
};

// Create a custom hook for authentication
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load user from localStorage on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('agrofix-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user from localStorage:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // For this demo, we'll implement a simple login
  // In a real app, this would make an API call
  const login = (username: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Hard-coded admin credentials for demo
      if (username === 'admin' && password === 'admin123') {
        const newUser = {
          id: 1,
          username: 'admin',
          isAdmin: true
        };
        
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem('agrofix-user', JSON.stringify(newUser));
        
        toast({
          title: 'Login Successful',
          description: 'Welcome back, admin!',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
      }
      
      setIsLoading(false);
    }, 500);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('agrofix-user');
    
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully',
    });
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}
