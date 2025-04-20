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
    <Card className="overflow-hidden border border-gray-100 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <div className="h-52 bg-gray-200 relative overflow-hidden">
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/400x300/f3f4f6/70787a?text=Product+Image'} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
        />
        <div className={`absolute top-3 right-3 ${product.inStock ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
          {product.inStock ? "In Stock" : "Out of Stock"}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleWishlist}
            className={`text-gray-400 hover:text-red-500 hover:bg-red-50 ${isWishlisted ? 'text-red-500 bg-red-50' : ''} rounded-full h-8 w-8 p-0`}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''} transition-all`} />
          </Button>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <span className="bg-primary-50 text-primary-700 px-2 py-1 rounded-full mr-2">{product.category}</span>
          <span className="bg-gray-100 px-2 py-1 rounded-full">Min: {product.minOrderQuantity}kg</span>
        </div>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-primary-700">{formatCurrency(product.price / 100)}</span>
            <span className="text-gray-600 text-sm"> / kg</span>
          </div>
        </div>
        
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors shadow hover:shadow-md"
          disabled={!product.inStock}
        >
          {product.inStock ? "Add to Order" : "Out of Stock"}
        </Button>
      </CardContent>
    </Card>
  );
}
