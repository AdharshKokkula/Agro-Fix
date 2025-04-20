import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { CartButton } from "@/components/ui/cart-drawer";

const Navbar = () => {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
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
            <span className="text-xl font-bold text-gray-800 cursor-pointer">AgroFix</span>
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link href="/products">
            <span className={`font-medium cursor-pointer ${isActive("/products")}`}>Products</span>
          </Link>
          
          {/* Show these links only if user is logged in */}
          {user && (
            <>
              <Link href="/place-order">
                <span className={`font-medium cursor-pointer ${isActive("/place-order")}`}>Place Order</span>
              </Link>
              <Link href="/track-order">
                <span className={`font-medium cursor-pointer ${isActive("/track-order")}`}>Track Order</span>
              </Link>
            </>
          )}
          
          {/* Show admin link only if user is admin */}
          {user && user.isAdmin && (
            <Link href="/admin">
              <span className={`font-medium cursor-pointer ${isActive("/admin")}`}>Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {/* Cart Button */}
          <CartButton />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu} 
            className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          {/* Show login/register button if user is not logged in */}
          {!user ? (
            <Link href="/auth">
              <Button variant="outline" className="flex items-center space-x-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="h-4 w-4 mr-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Login / Register</span>
              </Button>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium hidden md:inline-block">
                Hello, {user.username}
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-3">
            <Link href="/products">
              <span className={`py-2 font-medium cursor-pointer ${isActive("/products")}`}>Products</span>
            </Link>
            
            {/* Show these links only if user is logged in */}
            {user && (
              <>
                <Link href="/place-order">
                  <span className={`py-2 font-medium cursor-pointer ${isActive("/place-order")}`}>Place Order</span>
                </Link>
                <Link href="/track-order">
                  <span className={`py-2 font-medium cursor-pointer ${isActive("/track-order")}`}>Track Order</span>
                </Link>
              </>
            )}
            
            {/* Show admin link only if user is admin */}
            {user && user.isAdmin && (
              <Link href="/admin">
                <span className={`py-2 font-medium cursor-pointer ${isActive("/admin")}`}>Admin</span>
              </Link>
            )}
            
            {/* Logout button for mobile */}
            {user && (
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                className="justify-start p-0 h-auto font-medium text-gray-600 hover:text-primary-600"
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
