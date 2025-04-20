import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCartSync } from '@/lib/cart-sync';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  // This component handles cart sync with server
  useCartSync();
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Check for orphaned carts on mount and clean them up
  useEffect(() => {
    const cleanupOrphanedCarts = async () => {
      if (user) {
        try {
          // Check if there's a cart already associated with this user
          const res = await apiRequest('GET', '/api/cart');
          const data = await res.json();
          
          if (!data || !data.items || data.items.length === 0) {
            // No cart data, might be a first login
            console.log('No existing cart found for user');
          } else {
            console.log('Cart data loaded successfully');
          }
        } catch (error) {
          console.error('Error checking for orphaned carts:', error);
        }
      }
    };
    
    cleanupOrphanedCarts();
  }, [user?.id]);
  
  return <>{children}</>;
}

export default CartProvider;