import { useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ShoppingBag, Trash2 } from "lucide-react";

export function CartSummary() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  // Get cart items as array
  const cartItems = Object.values(cart.items);
  
  if (cartItems.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Cart</CardTitle>
          <CardDescription>Your cart is empty</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Add items to your cart to get started</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
        <CardDescription>{cart.totalItems} item(s) in your cart</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => cart.removeFromCart(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex justify-between w-full">
          <p className="font-medium">Total</p>
          <p className="font-bold">{formatCurrency(cart.totalAmount)}</p>
        </div>
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="w-1/2"
            onClick={() => cart.clearCart()}
          >
            Clear Cart
          </Button>
          <Link href="/place-order">
            <Button className="w-full">Checkout</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default CartSummary;