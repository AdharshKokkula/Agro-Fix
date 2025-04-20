import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, CartItem } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/lib/queryClient';

interface CartState {
  items: Record<number, CartItem>; // productId -> CartItem
  totalItems: number;
  totalAmount: number;
  
  // Cart operations
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  clearCart: () => void;
  
  // Sync with server when user is logged in
  syncWithServer: () => Promise<void>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: {} as Record<number, CartItem>,
      totalItems: 0,
      totalAmount: 0,
      
      addToCart: (product: Product, quantity: number) => {
        const { items } = get();
        const currentQuantity = items[product.id]?.quantity || 0;
        const newQuantity = currentQuantity + quantity;
        
        // Make sure it meets minimum order quantity
        const finalQuantity = Math.max(newQuantity, product.minOrderQuantity);
        
        // Calculate subtotal
        const subtotal = finalQuantity * product.price;
        
        // Create cart item
        const cartItem: CartItem = {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: finalQuantity,
          subtotal: subtotal
        };
        
        // Update state
        set((state) => {
          const newItems = { ...state.items, [product.id]: cartItem };
          return {
            items: newItems,
            totalItems: Object.values(newItems).reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: Object.values(newItems).reduce((sum, item) => sum + item.subtotal, 0)
          };
        });
        
        // Sync with server if user is logged in
        get().syncWithServer();
      },
      
      removeFromCart: (productId: number) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[productId];
          
          return {
            items: newItems,
            totalItems: Object.values(newItems).reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: Object.values(newItems).reduce((sum, item) => sum + item.subtotal, 0)
          };
        });
        
        // Sync with server if user is logged in
        get().syncWithServer();
      },
      
      updateQuantity: (productId: number, quantity: number) => {
        const { items } = get();
        const item = items[productId];
        
        if (!item) return;
        
        // Calculate new subtotal
        const subtotal = quantity * item.price;
        
        // Update cart item
        const updatedItem: CartItem = {
          ...item,
          quantity,
          subtotal
        };
        
        // Update state
        set((state) => {
          const newItems = { ...state.items, [productId]: updatedItem };
          return {
            items: newItems,
            totalItems: Object.values(newItems).reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: Object.values(newItems).reduce((sum, item) => sum + item.subtotal, 0)
          };
        });
        
        // Sync with server if user is logged in
        get().syncWithServer();
      },
      
      incrementQuantity: (productId: number) => {
        const { items } = get();
        const item = items[productId];
        
        if (!item) return;
        
        // Increment quantity by 1
        const newQuantity = item.quantity + 1;
        get().updateQuantity(productId, newQuantity);
      },
      
      decrementQuantity: (productId: number) => {
        const { items } = get();
        const item = items[productId];
        
        if (!item || item.quantity <= 1) return;
        
        // Decrement quantity by 1
        const newQuantity = item.quantity - 1;
        get().updateQuantity(productId, newQuantity);
      },
      
      clearCart: () => {
        set({
          items: {},
          totalItems: 0,
          totalAmount: 0
        });
        
        // Sync with server if user is logged in
        get().syncWithServer();
      },
      
      syncWithServer: async () => {
        try {
          // Get current user
          const currentUser = queryClient.getQueryData<any>(['/api/user']);
          
          if (currentUser && currentUser.id) {
            const { items } = get();
            const cartItems = Object.values(items);
            
            // Send cart data to server
            await apiRequest('POST', `/api/cart`, { items: cartItems });
          }
        } catch (error) {
          console.error('Failed to sync cart with server:', error);
        }
      }
    }),
    {
      name: 'agrofix-cart', // Name of the item in localStorage
    }
  )
);

// Load cart from server when user logs in
export const loadCartFromServer = async () => {
  const currentUser = queryClient.getQueryData<any>(['/api/user']);
  
  if (currentUser && currentUser.id) {
    try {
      const response = await apiRequest('GET', `/api/cart`);
      const data = await response.json();
      
      if (data && data.items) {
        const cart = useCart.getState();
        
        // Clear current cart
        cart.clearCart();
        
        // Add each item from server
        const items = Array.isArray(data.items) ? data.items : [];
        for (const item of items) {
          const product: Product = {
            id: item.productId,
            name: item.name,
            price: item.price,
            minOrderQuantity: 1, // Default
            category: '', // Not needed for cart
            inStock: true, // Assume in stock
            imageUrl: null,
            description: null
          };
          
          useCart.setState((state) => {
            const newItems = { 
              ...state.items, 
              [item.productId]: {
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.subtotal
              } 
            };
            
            return {
              items: newItems,
              totalItems: Object.values(newItems).reduce((sum, item) => sum + item.quantity, 0),
              totalAmount: Object.values(newItems).reduce((sum, item) => sum + item.subtotal, 0)
            };
          });
        }
      }
    } catch (error) {
      console.error('Failed to load cart from server:', error);
    }
  }
};