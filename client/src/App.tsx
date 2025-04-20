import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/home";
import ProductsPage from "@/pages/products";
import PlaceOrderPage from "@/pages/place-order";
import TrackOrderPage from "@/pages/track-order";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminProducts from "@/pages/admin/products";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/products" component={ProductsPage} />
              <Route path="/auth" component={AuthPage} />
              
              {/* Protected routes for authenticated users */}
              <Route path="/place-order">
                <ProtectedRoute>
                  <PlaceOrderPage />
                </ProtectedRoute>
              </Route>
              
              <Route path="/track-order">
                <ProtectedRoute>
                  <TrackOrderPage />
                </ProtectedRoute>
              </Route>
              
              {/* Protected routes for admins only */}
              <Route path="/admin">
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              </Route>
              
              <Route path="/admin/orders">
                <ProtectedRoute requireAdmin={true}>
                  <AdminOrders />
                </ProtectedRoute>
              </Route>
              
              <Route path="/admin/products">
                <ProtectedRoute requireAdmin={true}>
                  <AdminProducts />
                </ProtectedRoute>
              </Route>
              
              <Route component={NotFound} />
            </Switch>
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
