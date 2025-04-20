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
    return location === path
      ? "text-primary-600"
      : "text-gray-600 hover:text-primary-600";
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.0"
            width="20px"
            height="20px"
            viewBox="0 0 300.000000 385.000000"
            preserveAspectRatio="xMidYMid meet"
          >
            <metadata>
              Created by potrace 1.10, written by Peter Selinger 2001-2011
            </metadata>
            <g
              transform="translate(0.000000,385.000000) scale(0.100000,-0.100000)"
              fill="#00FF00"
              stroke="none"
            >
              <path d="M1890 3752 c0 -33 -100 -218 -163 -302 -123 -162 -277 -295 -592 -510 -246 -168 -324 -228 -439 -340 -133 -128 -243 -277 -315 -425 -104 -213 -142 -374 -142 -600 1 -345 105 -633 332 -915 109 -136 514 -525 496 -476 -30 78 -95 406 -113 561 -14 126 -208 528 -380 788 -92 138 -124 177 -124 149 0 -4 43 -75 96 -157 111 -172 216 -369 304 -570 57 -129 68 -167 85 -295 10 -79 36 -223 52 -292 8 -36 13 -72 11 -78 -4 -14 -176 138 -283 251 -255 268 -390 531 -434 846 -25 177 -5 434 45 582 70 206 177 386 330 550 121 130 240 224 531 420 355 239 558 441 679 675 14 28 30 55 34 60 9 9 85 -145 148 -299 99 -242 157 -465 193 -735 16 -125 12 -482 -6 -621 -67 -501 -269 -951 -631 -1404 -110 -138 -335 -375 -356 -375 -4 0 -12 17 -17 38 -5 20 -15 56 -20 78 -26 100 -29 136 -15 177 26 74 143 268 284 471 17 25 125 160 157 196 12 14 31 36 43 50 11 14 72 77 135 141 63 64 115 121 115 128 0 21 -49 -21 -181 -156 -218 -223 -412 -486 -538 -733 l-64 -126 38 -166 38 -167 66 58 c79 70 260 269 366 401 451 564 669 1220 625 1879 -25 386 -100 658 -303 1103 -69 150 -87 180 -87 140z" />
              <path d="M1703 3002 c-44 -56 -108 -141 -121 -159 -12 -17 -114 -177 -139 -218 -55 -89 -194 -356 -237 -456 -121 -281 -180 -478 -241 -801 -16 -82 -32 -148 -36 -148 -4 0 -29 32 -56 72 -84 126 -352 418 -382 418 -6 0 -11 -3 -11 -6 0 -4 47 -55 105 -115 128 -134 200 -222 295 -361 41 -59 75 -106 76 -105 1 1 7 40 14 87 19 143 88 459 126 580 123 390 339 806 613 1183 42 56 37 83 -6 29z" />
              <path d="M1713 2933 c-295 -499 -540 -1329 -582 -1970 -8 -117 -7 -144 2 -132 2 2 31 41 65 85 144 191 355 385 593 545 66 44 117 84 114 89 -6 10 -143 -67 -226 -128 -68 -49 -183 -144 -239 -196 -57 -54 -242 -253 -253 -272 -5 -8 -13 -12 -19 -8 -21 13 31 410 88 664 44 200 175 650 202 695 4 6 7 15 8 20 2 10 53 140 81 205 8 19 62 131 119 248 111 225 134 303 47 155z" />
              <path d="M2428 2451 c10 -439 -63 -816 -234 -1210 -160 -370 -390 -700 -706 -1015 -94 -93 -162 -166 -152 -162 11 4 87 23 170 42 192 43 297 79 459 160 171 85 295 174 430 309 205 204 329 432 392 718 14 63 18 127 18 282 0 173 -3 214 -23 304 -52 231 -146 449 -281 654 -40 59 -73 107 -74 107 -2 0 -1 -85 1 -189z m81 11 c40 -61 149 -279 165 -330 8 -26 22 -67 31 -91 71 -195 93 -522 50 -731 -2 -14 -7 -38 -11 -55 -15 -73 -61 -198 -106 -289 -110 -223 -263 -397 -484 -552 -149 -104 -374 -207 -539 -248 -38 -10 -86 -21 -105 -26 -19 -5 -38 -6 -42 -2 -4 4 32 48 81 97 160 164 318 362 441 555 79 122 206 361 247 464 155 386 220 699 225 1079 1 110 5 167 12 167 6 0 22 -17 35 -38z" />
            </g>
          </svg>
          <Link href="/">
            <span className="text-xl font-bold text-gray-800 cursor-pointer">
              AgroFix
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex space-x-6">
          <Link href="/products">
            <span
              className={`font-medium cursor-pointer ${isActive("/products")}`}
            >
              Products
            </span>
          </Link>

          {/* Show these links only if user is logged in */}
          {user && (
            <>
              <Link href="/place-order">
                <span
                  className={`font-medium cursor-pointer ${isActive("/place-order")}`}
                >
                  Place Order
                </span>
              </Link>
              <Link href="/track-order">
                <span
                  className={`font-medium cursor-pointer ${isActive("/track-order")}`}
                >
                  Track Order
                </span>
              </Link>
            </>
          )}

          {/* Show admin link only if user is admin */}
          {user && user.isAdmin && (
            <Link href="/admin">
              <span
                className={`font-medium cursor-pointer ${isActive("/admin")}`}
              >
                Admin
              </span>
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
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
              <span
                className={`py-2 font-medium cursor-pointer ${isActive("/products")}`}
              >
                Products
              </span>
            </Link>

            {/* Show these links only if user is logged in */}
            {user && (
              <>
                <Link href="/place-order">
                  <span
                    className={`py-2 font-medium cursor-pointer ${isActive("/place-order")}`}
                  >
                    Place Order
                  </span>
                </Link>
                <Link href="/track-order">
                  <span
                    className={`py-2 font-medium cursor-pointer ${isActive("/track-order")}`}
                  >
                    Track Order
                  </span>
                </Link>
              </>
            )}

            {/* Show admin link only if user is admin */}
            {user && user.isAdmin && (
              <Link href="/admin">
                <span
                  className={`py-2 font-medium cursor-pointer ${isActive("/admin")}`}
                >
                  Admin
                </span>
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
