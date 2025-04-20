import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/store/cart";

interface CartItemProps {
  product: Product;
  quantity: number;
}

export function CartItem({ product, quantity }: CartItemProps) {
  const { incrementQuantity, decrementQuantity, removeFromCart } = useCart();
  
  const subtotal = (product.price * quantity) / 100;
  
  return (
    <div className="py-4 flex items-center border-b border-gray-200">
      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-4">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-grow">
        <h5 className="text-base font-medium text-gray-900">{product.name}</h5>
        <p className="text-sm text-gray-600">{formatCurrency(product.price / 100)}/kg</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => decrementQuantity(product.id)}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-10 text-center">{quantity}</span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8"
          onClick={() => incrementQuantity(product.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-right ml-4">
        <div className="font-medium text-gray-900">{formatCurrency(subtotal)}</div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-red-500 hover:text-red-700 mt-1"
          onClick={() => removeFromCart(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
