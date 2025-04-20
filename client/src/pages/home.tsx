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
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 text-green py-20">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-md">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-100 via-green-200 to-emerald-100">
                  Fresh Produce at Wholesale Prices
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-10 text-white leading-relaxed">
                Order bulk vegetables and fruits directly from farms to your
                business at competitive prices.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/products">
                  <Button className="bg-white text-green-700 hover:bg-gray-100 w-full sm:w-auto font-medium px-6 py-2.5 shadow-lg transition-all">
                    Browse Products
                  </Button>
                </Link>
                <Link href="/place-order">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white/20 w-full sm:w-auto font-medium px-6 py-2.5 transition-all"
                  >
                    Place Bulk Order
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-2/5">
              <Card className="bg-white rounded-lg p-6 shadow-xl border border-gray-100">
                <CardContent className="p-0">
                  <h2 className="text-primary-700 text-xl font-semibold mb-4">
                    Track Your Order
                  </h2>
                  <form onSubmit={handleTrackOrder} className="space-y-4">
                    <div>
                      <label
                        htmlFor="order-id"
                        className="block text-gray-700 text-sm font-medium mb-1"
                      >
                        Order ID
                      </label>
                      <Input
                        id="order-id"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="w-full focus:ring-2 focus:ring-primary-500"
                        placeholder="Enter your order ID"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
                    >
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-green-500 to-emerald-600">
                Featured Products
              </span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded mb-6"></div>
            <p className="text-gray-600 text-lg text-center max-w-2xl">
              Check out some of our most popular items available for bulk orders
              at competitive wholesale prices.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Card
                  key={i}
                  className="h-80 animate-pulse bg-white border border-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredProducts
                ?.slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          )}

          <div className="mt-14 text-center">
            <Link href="/products">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-3 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-green-500 to-emerald-600">
              How It Works
            </span>
          </h2>
          <p className="text-gray-600 mb-16 text-center max-w-2xl mx-auto text-lg">
            Our simple process makes ordering bulk fresh produce easy and
            efficient for your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-9 left-1/6 right-1/6 h-0.5 bg-primary-100"></div>

            <div className="text-center relative group hover:shadow-lg transition-all duration-300 p-8 rounded-xl border border-transparent hover:border-primary-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Browse Products
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Explore our wide range of fresh vegetables and fruits available
                for bulk ordering at competitive prices.
              </p>
            </div>

            <div className="text-center relative group hover:shadow-lg transition-all duration-300 p-8 rounded-xl border border-transparent hover:border-primary-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Place Your Order
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Select the items you need, specify quantities, and complete your
                order with delivery details.
              </p>
            </div>

            <div className="text-center relative group hover:shadow-lg transition-all duration-300 p-8 rounded-xl border border-transparent hover:border-primary-100">
              <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg transform group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Receive Fresh Produce
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your order is delivered directly to your specified location,
                fresh and ready to use.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/place-order">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 text-lg font-medium shadow-md hover:shadow-lg transition-all hover:translate-y-[-2px]">
                Start Ordering Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
