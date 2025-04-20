import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Order, Product } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";
import AdminOrders from "./orders";
import AdminProducts from "./products";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch orders and products
  const { data: orders, isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const { data: products, isLoading: isProductsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Calculate dashboard metrics
  const getTotalSales = () => {
    if (!orders) return 0;
    return orders.reduce((total, order) => total + order.totalAmount, 0) / 100;
  };

  const getPendingOrdersCount = () => {
    if (!orders) return 0;
    return orders.filter(order => order.status === "Pending").length;
  };

  const getProductCount = () => {
    if (!products) return 0;
    return products.length;
  };

  const getAverageOrderValue = () => {
    if (!orders || orders.length === 0) return 0;
    return getTotalSales() / orders.length;
  };

  // Prepare data for charts
  const getOrdersByStatusChart = () => {
    if (!orders) return [];
    
    const statusCounts = {
      "Pending": 0,
      "In Progress": 0,
      "Out for Delivery": 0,
      "Delivered": 0
    };
    
    orders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status as keyof typeof statusCounts]++;
      }
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));
  };

  const getTopSellingProducts = () => {
    if (!orders || !products) return [];
    
    const productSales: Record<number, { productId: number, quantity: number, name: string }> = {};
    
    orders.forEach(order => {
      (order.items as any[]).forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            quantity: 0,
            name: item.name
          };
        }
        productSales[item.productId].quantity += item.quantity;
      });
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const isLoading = isOrdersLoading || isProductsLoading;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage orders, inventory, and track business performance.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg">
          <TabsList className="border-b border-gray-200 w-full rounded-none justify-start">
            <TabsTrigger value="overview" className="px-4 py-3">Overview</TabsTrigger>
            <TabsTrigger value="orders" className="px-4 py-3">Orders</TabsTrigger>
            <TabsTrigger value="products" className="px-4 py-3">Products</TabsTrigger>
            <TabsTrigger value="settings" className="px-4 py-3">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : (
              <>
                {/* Dashboard Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Total Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(getTotalSales())}</div>
                      <p className="text-xs text-gray-500 mt-1">This month</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Pending Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{getPendingOrdersCount()}</div>
                      <p className="text-xs text-gray-500 mt-1">Requires attention</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{getProductCount()}</div>
                      <p className="text-xs text-gray-500 mt-1">In inventory</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-gray-500">Avg. Order Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(getAverageOrderValue())}</div>
                      <p className="text-xs text-gray-500 mt-1">Per order</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getOrdersByStatusChart()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="status" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getTopSellingProducts()}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip />
                          <Bar dataKey="quantity" fill="hsl(var(--chart-1))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Orders */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Recent Orders</CardTitle>
                      <Link href="/admin/orders">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Order ID</th>
                            <th className="text-left py-3 px-4 font-medium">Customer</th>
                            <th className="text-left py-3 px-4 font-medium">Date</th>
                            <th className="text-left py-3 px-4 font-medium">Total</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders?.slice(0, 5).map((order) => (
                            <tr key={order.id} className="border-b">
                              <td className="py-3 px-4">
                                <Link href={`/admin/orders?id=${order.id}`}>
                                  <a className="text-primary-600 hover:underline">
                                    ORD-{order.id}
                                  </a>
                                </Link>
                              </td>
                              <td className="py-3 px-4">
                                <div>{order.buyerName}</div>
                                <div className="text-gray-500 text-xs">{order.email}</div>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4 font-medium">
                                {formatCurrency(order.totalAmount / 100)}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                  order.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                                  order.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                                  order.status === "Out for Delivery" ? "bg-blue-100 text-blue-800" :
                                  "bg-green-100 text-green-800"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
          
          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>
          
          <TabsContent value="settings" className="p-6">
            <h3 className="text-xl font-medium mb-4">Account Settings</h3>
            <p className="text-gray-500 mb-4">Manage your account settings and preferences</p>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">Update your account's profile information and email address.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <Input value="Admin User" disabled className="max-w-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <Input value="admin@agrofix.com" disabled className="max-w-md" />
                    </div>
                    <Button>Save</Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-4">Ensure your account is using a long, random password to stay secure.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <Input type="password" className="max-w-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <Input type="password" className="max-w-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <Input type="password" className="max-w-md" />
                    </div>
                    <Button>Change Password</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Helper component for dashboard inputs
const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${className}`}
      {...props}
    />
  );
};
