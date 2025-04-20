import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/store/cart";
import { useEffect } from "react";
import * as React from "react";

// This hook syncs the cart with the server when it changes
export function useCartSync() {
  const { user } = useAuth();
  const cart = useCart();

  // Sync cart with server whenever it changes and user is logged in
  useEffect(() => {
    if (user) {
      cart.syncWithServer();
    }
  }, [cart.totalItems, cart.totalAmount, user]);

  return null;
}

// This function attaches cart syncing to authenticated routes
export function withCartSync<P>(Component: React.ComponentType<P>) {
  return function WithCartSync(props: P) {
    useCartSync();
    return <Component {...props} />;
  };
}

// Helper function to format order number with proper padding
export function formatOrderNumber(id: number): string {
  return `AGF-${new Date().getFullYear()}-${id.toString().padStart(6, '0')}`;
}

// Helper function to get cart total items
export function getCartItemCount(): number {
  return useCart.getState().totalItems;
}

// Helper function to get cart total amount
export function getCartTotalAmount(): number {
  return useCart.getState().totalAmount;
}