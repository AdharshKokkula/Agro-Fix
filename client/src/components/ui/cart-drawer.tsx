import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useCart } from "@/store/cart";
import CartSummary from "./cart-summary";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const cart = useCart();
  
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Cart</DrawerTitle>
          <DrawerDescription>Review your items before checkout</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <CartSummary />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function CartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCart();
  
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {cart.totalItems > 0 && (
          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center">
            {cart.totalItems}
          </Badge>
        )}
      </Button>
      <CartDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export default CartDrawer;