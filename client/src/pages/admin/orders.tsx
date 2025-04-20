import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Order, OrderItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/ui/order-status-badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Filter, ArrowUpDown, Eye, Edit } from "lucide-react";
import { formatCurrency, filterBySearchTerm, generateOrderId } from "@/lib/utils";
import { format } from "date-fns";

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Extract order ID from URL query parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        fetchOrderDetails(parsedId);
      }
    }
  }, []);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const fetchOrderDetails = async (id: number) => {
    try {
      const response = await apiRequest("GET", `/api/orders/${id}`, undefined);
      const orderData = await response.json();
      setSelectedOrder(orderData);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  // Update order status mutation
  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Filter and sort orders
  const filteredOrders = orders
    ? orders
        .filter((order) => {
          if (statusFilter !== "All" && order.status !== statusFilter) {
            return false;
          }
          
          if (searchTerm) {
            const searchFields = [
              order.id.toString(),
              order.buyerName,
              order.email,
              order.phone,
              order.city,
            ];
            
            return searchFields.some(field => 
              field.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          return true;
        })
        .sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        })
    : [];

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = () => {
    if (selectedOrder && newStatus) {
      updateOrderStatus.mutate({ id: selectedOrder.id, status: newStatus });
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Orders</h2>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Filter size={16} />
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSortOrder}
            className="w-10 h-10"
          >
            <ArrowUpDown size={16} />
          </Button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">No orders found matching your criteria</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("All");
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {generateOrderId(order.id)}
                      </TableCell>
                      <TableCell>
                        <div>{order.buyerName}</div>
                        <div className="text-gray-500 text-xs">{order.email}</div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(order.totalAmount / 100)}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditStatus(order)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{generateOrderId(selectedOrder.id)}</h3>
                  <p className="text-gray-600">
                    Placed on: {format(new Date(selectedOrder.createdAt), "PPP")}
                  </p>
                </div>
                <OrderStatusBadge status={selectedOrder.status} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Customer Information</h4>
                  <p className="text-gray-600">
                    {selectedOrder.buyerName}<br />
                    {selectedOrder.email}<br />
                    {selectedOrder.phone}
                  </p>
                  {selectedOrder.businessName && (
                    <p className="text-gray-600 mt-1">
                      Business: {selectedOrder.businessName}
                    </p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Information</h4>
                  <p className="text-gray-600">
                    {selectedOrder.deliveryAddress}<br />
                    {selectedOrder.city}, {selectedOrder.state} {selectedOrder.pincode}<br />
                    Preferred Date: {selectedOrder.preferredDeliveryDate}
                  </p>
                  {selectedOrder.deliveryInstructions && (
                    <p className="text-gray-600 mt-1">
                      <span className="font-medium">Instructions:</span> {selectedOrder.deliveryInstructions}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedOrder.items as OrderItem[]).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{formatCurrency(item.price / 100)}/kg</TableCell>
                          <TableCell>{item.quantity}kg</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.subtotal / 100)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="p-4 border-t">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalAmount / 100)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium">{formatCurrency(200)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency((selectedOrder.totalAmount / 100) + 200)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => {
                  setIsViewDialogOpen(false);
                  handleEditStatus(selectedOrder);
                }}>
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order {selectedOrder ? generateOrderId(selectedOrder.id) : ""}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h4 className="text-sm font-medium mb-2">Current Status:</h4>
            {selectedOrder && <OrderStatusBadge status={selectedOrder.status} />}
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">New Status:</h4>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={updateOrderStatus.isPending || newStatus === selectedOrder?.status}
            >
              {updateOrderStatus.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
