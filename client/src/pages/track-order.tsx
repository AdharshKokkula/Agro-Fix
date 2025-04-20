import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { OrderTimeline } from "@/components/ui/order-timeline";
import { useToast } from "@/hooks/use-toast";
import { OrderItem, type Order } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

export default function TrackOrderPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState("");
  const [searchId, setSearchId] = useState<number | null>(null);

  // Extract order ID from URL query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setOrderId(id);
      handleTrackOrder(id);
    }
  }, []);

  // Fetch order details
  const { 
    data: order, 
    isLoading, 
    error, 
    isError,
    refetch 
  } = useQuery<Order>({
    queryKey: [`/api/orders/${searchId}`],
    enabled: searchId !== null,
  });

  const handleTrackOrder = (id: string = orderId) => {
    const parsedId = parseInt(id);
    
    if (isNaN(parsedId)) {
      toast({
        title: "Invalid Order ID",
        description: "Please enter a valid order ID",
        variant: "destructive",
      });
      return;
    }
    
    setSearchId(parsedId);
    
    // Update URL with the order ID
    setLocation(`/track-order?id=${parsedId}`, { replace: true });
  };

  const getOrderTimelineEvents = (order: Order) => {
    const events = [
      {
        status: "Order Placed",
        date: format(new Date(order.createdAt), "PP"),
        time: format(new Date(order.createdAt), "p"),
        description: "Your order has been received and is being processed.",
        isCompleted: true,
        isCurrent: order.status === "Pending"
      },
      {
        status: "Order Confirmed",
        date: format(new Date(order.createdAt), "PP"),
        time: format(new Date(new Date(order.createdAt).getTime() + 60 * 60 * 1000), "p"),
        description: "Your order has been confirmed and is being prepared for shipment.",
        isCompleted: ["In Progress", "Out for Delivery", "Delivered"].includes(order.status),
        isCurrent: order.status === "Pending"
      },
      {
        status: "In Progress",
        date: ["In Progress", "Out for Delivery", "Delivered"].includes(order.status) 
          ? format(new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000), "PP") 
          : "",
        time: ["In Progress", "Out for Delivery", "Delivered"].includes(order.status)
          ? format(new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000), "p")
          : "",
        description: "Your order is currently being packaged and prepared for delivery.",
        isCompleted: ["Out for Delivery", "Delivered"].includes(order.status),
        isCurrent: order.status === "In Progress"
      },
      {
        status: "Out for Delivery",
        date: ["Out for Delivery", "Delivered"].includes(order.status)
          ? format(new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000), "PP")
          : "",
        time: ["Out for Delivery", "Delivered"].includes(order.status)
          ? format(new Date(new Date(order.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000), "p")
          : "",
        description: "Your order is on its way to your delivery address.",
        isCompleted: order.status === "Delivered",
        isCurrent: order.status === "Out for Delivery"
      },
      {
        status: "Delivered",
        date: order.status === "Delivered"
          ? format(new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000), "PP")
          : "",
        time: order.status === "Delivered"
          ? format(new Date(new Date(order.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000), "p")
          : "",
        description: "Your order has been delivered successfully.",
        isCompleted: order.status === "Delivered",
        isCurrent: order.status === "Delivered"
      }
    ];
    
    return events;
  };

  return (
    <section id="track-order" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h2>
        <p className="text-gray-600 mb-8">Enter your order ID below to check the status of your order.</p>
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-grow">
                <label htmlFor="order-tracker-id" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                <Input
                  id="order-tracker-id"
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-12345"
                />
              </div>
              <div>
                <Button 
                  className="w-full md:w-auto"
                  onClick={() => handleTrackOrder()}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Track Order"}
                </Button>
              </div>
            </div>
          </div>
          
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
              <p>{error instanceof Error ? error.message : "Order not found. Please check the order ID and try again."}</p>
            </div>
          )}
          
          {order && (
            <Card className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Order #ORD-{order.id}</h3>
                    <p className="text-gray-600">Placed on: {format(new Date(order.createdAt), "PP")}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Address</h4>
                    <p className="text-gray-600">
                      {order.deliveryAddress}<br />
                      {order.city}, {order.state} {order.pincode}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Contact Information</h4>
                    <p className="text-gray-600">
                      {order.buyerName}<br />
                      {order.email}<br />
                      {order.phone}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Order Status Timeline */}
              <div className="p-6 bg-gray-50">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Status</h4>
                <OrderTimeline events={getOrderTimelineEvents(order)} />
              </div>
              
              {/* Order Items */}
              <div className="p-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="divide-y divide-gray-200">
                  {(order.items as OrderItem[]).map((item, index) => (
                    <div key={index} className="py-4 flex items-center">
                      <div className="flex-grow">
                        <h5 className="text-base font-medium text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-600">{item.quantity}kg at {formatCurrency(item.price / 100)}/kg</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{formatCurrency(item.subtotal / 100)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(order.totalAmount / 100)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">{formatCurrency(200)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency((order.totalAmount / 100) + 200)}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
