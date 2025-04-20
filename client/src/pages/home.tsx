import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ProductCard } from "@/components/ui/product-card";
import { type Product } from "@shared/schema";

export default function HomePage() {
  const [orderId, setOrderId] = useState("");
  const { toast } = useToast();

  const { data: featuredProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid order ID",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to track order page with the order ID
    window.location.href = `/track-order?id=${orderId}`;
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-secondary-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Fresh Produce at Wholesale Prices</h1>
              <p className="text-lg md:text-xl mb-8 text-white/90">Order bulk vegetables and fruits directly from farms to your business.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/products">
                  <Button className="bg-white text-primary-700 hover:bg-gray-100 w-full sm:w-auto">
                    Browse Products
                  </Button>
                </Link>
                <Link href="/place-order">
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto">
                    Place Bulk Order
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-2/5">
              <Card className="bg-white rounded-lg p-6 shadow-lg">
                <CardContent className="p-0">
                  <h2 className="text-primary-700 text-xl font-semibold mb-4">Track Your Order</h2>
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <div>
                      <label htmlFor="order-id" className="block text-gray-700 text-sm font-medium mb-1">Order ID</label>
                      <Input
                        id="order-id"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full"
                        placeholder="Enter your order ID"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                      Track Now
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
          <p className="text-gray-600 mb-8">Check out some of our most popular items available for bulk orders.</p>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="h-80 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="mt-10 text-center">
            <Link href="/products">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">How It Works</h2>
          <p className="text-gray-600 mb-12 text-center max-w-2xl mx-auto">Our simple process makes ordering bulk fresh produce easy and efficient for your business.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Browse Products</h3>
              <p className="text-gray-600">Explore our wide range of fresh vegetables and fruits available for bulk ordering.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Place Your Order</h3>
              <p className="text-gray-600">Select the items you need, specify quantities, and complete your order with delivery details.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Receive Fresh Produce</h3>
              <p className="text-gray-600">Your order is delivered directly to your specified location, fresh and ready to use.</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/place-order">
              <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6">
                Start Ordering Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
