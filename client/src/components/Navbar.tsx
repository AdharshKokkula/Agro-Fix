import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    return location === path ? "text-primary-600" : "text-gray-600 hover:text-primary-600";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="h-8 w-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15 4c-2.5 0-4.55 1.82-4.95 4.21L8.12 9.29a1 1 0 0 0-1.41 0l-5.42 5.41a1 1 0 0 0 0 1.42l5.42 5.41a1 1 0 0 0 1.41 0l5.41-5.41a1 1 0 0 0 0-1.42l-1.08-1.08C12.85 13.19 14.62 14 16.5 14c2.5 0 4.5-2 4.5-4.5S19 5 16.5 5"></path>
          </svg>
          <Link href="/">
            <a className="text-xl font-bold text-gray-800">AgroFix</a>
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link href="/products">
            <a className={`font-medium ${isActive("/products")}`}>Products</a>
          </Link>
          <Link href="/place-order">
            <a className={`font-medium ${isActive("/place-order")}`}>Place Order</a>
          </Link>
          <Link href="/track-order">
            <a className={`font-medium ${isActive("/track-order")}`}>Track Order</a>
          </Link>
          <Link href="/admin">
            <a className={`font-medium ${isActive("/admin")}`}>Admin</a>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu} 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/admin">
            <a className="bg-primary-50 text-primary-700 hover:bg-primary-100 px-4 py-2 rounded-md font-medium flex items-center space-x-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v3m-3-3h6m-6-4h6m-6-4h6M9 7h1m4 0h1M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Admin Login</span>
            </a>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/products">
              <a className={`py-2 font-medium ${isActive("/products")}`}>Products</a>
            </Link>
            <Link href="/place-order">
              <a className={`py-2 font-medium ${isActive("/place-order")}`}>Place Order</a>
            </Link>
            <Link href="/track-order">
              <a className={`py-2 font-medium ${isActive("/track-order")}`}>Track Order</a>
            </Link>
            <Link href="/admin">
              <a className={`py-2 font-medium ${isActive("/admin")}`}>Admin</a>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
