import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export default function ProductsPage() {
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortBy, setSortBy] = useState("Popularity");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Fetch products
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Get unique categories
  const categories = products 
    ? ["All Categories", ...new Set(products.map(product => product.category))]
    : ["All Categories"];

  // Filter and sort products
  const filteredAndSortedProducts = products
    ? products
        .filter(product => {
          // Category filter
          if (categoryFilter !== "All Categories" && product.category !== categoryFilter) {
            return false;
          }
          
          // Search term filter
          if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
          }
          
          return true;
        })
        .sort((a, b) => {
          // Sort based on selected option
          switch (sortBy) {
            case "Price: Low to High":
              return a.price - b.price;
            case "Price: High to Low":
              return b.price - a.price;
            case "Newly Added":
              return b.id - a.id;
            default:
              return 0; // Default sort (Popularity)
          }
        })
    : [];

  // Pagination
  const pageCount = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="products" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h2>
        <p className="text-gray-600 mb-8">Browse our selection of fresh vegetables and fruits available for bulk orders.</p>
        
        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Sort By: Popularity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Popularity">Sort By: Popularity</SelectItem>
                <SelectItem value="Price: Low to High">Price: Low to High</SelectItem>
                <SelectItem value="Price: High to Low">Price: High to Low</SelectItem>
                <SelectItem value="Newly Added">Newly Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
          </div>
        </div>
        
        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading products. Please try again later.</p>
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setCategoryFilter("All Categories");
                setSortBy("Popularity");
                setSearchTerm("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="inline-flex rounded-md shadow">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-l-md"
              >
                Previous
              </Button>
              
              {[...Array(pageCount)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => handlePageChange(i + 1)}
                  className="rounded-none"
                >
                  {i + 1}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="rounded-r-md"
              >
                Next
              </Button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
}
