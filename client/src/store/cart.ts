import { useState, useEffect } from 'react';
import { Product } from '@shared/schema';

// Define the cart structure
type CartItems = Record<number, number>; // productId -> quantity

// Create a custom hook for cart management
export function useCart() {
  const [cart, setCart] = useState<CartItems>({});

  // Load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem('agrofix-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agrofix-cart', JSON.stringify(cart));
  }, [cart]);

  // Add product to cart
  const addToCart = (product: Product, quantity = 1) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[product.id] || 0;
      return {
        ...prevCart,
        [product.id]: currentQuantity + quantity
      };
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[productId];
      return newCart;
    });
  };

  // Increment quantity
  const incrementQuantity = (productId: number) => {
    setCart(prevCart => ({
      ...prevCart,
      [productId]: (prevCart[productId] || 0) + 1
    }));
  };

  // Decrement quantity
  const decrementQuantity = (productId: number) => {
    setCart(prevCart => {
      if (prevCart[productId] <= 1) {
        return prevCart;
      }
      return {
        ...prevCart,
        [productId]: prevCart[productId] - 1
      };
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart({});
  };

  // Get cart total
  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const parsedId = parseInt(productId);
      // For safety - this would better be looked up from a product store
      // But for simplicity we'll leave this logic here
      // and assume the component will pass proper product data
      return total + (quantity || 0);
    }, 0);
  };

  // Get item count
  const getItemCount = () => {
    return Object.values(cart).reduce((count, quantity) => count + quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotal,
    getItemCount
  };
}
