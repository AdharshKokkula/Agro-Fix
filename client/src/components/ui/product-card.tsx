import { useState } from "react";
import { Product } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/store/cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    
    toast({
      title: "Added to order",
      description: `${product.name} has been added to your order.`,
      variant: "default",
    });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };

  return (
    <Card className="overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded">
          {product.inStock ? "In Stock" : "Out of Stock"}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <span className="bg-gray-100 px-2 py-1 rounded mr-2">{product.category}</span>
          <span>Min. Order: {product.minOrderQuantity}kg</span>
        </div>
        <div className="mb-3">
          <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price / 100)}</span>
          <span className="text-gray-600 text-sm"> / kg</span>
        </div>
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleAddToCart}
            className="bg-primary-600 hover:bg-primary-700 text-white"
            disabled={!product.inStock}
          >
            Add to Order
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleWishlist}
            className={`text-gray-500 hover:text-gray-700 ${isWishlisted ? 'text-red-500 hover:text-red-600' : ''}`}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
