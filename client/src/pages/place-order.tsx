import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CartItem } from "@/components/ui/cart-item";
import { MultistepForm } from "@/components/ui/multistep-form";
import { ProductCard } from "@/components/ui/product-card";
import { format } from "date-fns";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { type Product, type Order, insertOrderSchema, orderItemsSchema } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

// Extend the order schema for form validation
const orderFormSchema = insertOrderSchema.extend({
  preferredDeliveryDate: z.string().min(1, "Please select a delivery date"),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function PlaceOrderPage() {
  const { toast } = useToast();
  const { items, totalItems, totalAmount, clearCart } = useCart();
  const [formStep, setFormStep] = useState(1);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Fetch products
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Form setup
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      buyerName: "",
      businessName: "",
      email: "",
      phone: "",
      deliveryAddress: "",
      city: "",
      state: "",
      pincode: "",
      deliveryInstructions: "",
      preferredDeliveryDate: format(new Date(), "yyyy-MM-dd"),
      items: [],
      status: "Pending",
      totalAmount: 0,
    },
  });

  // Submit order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      // Convert cart items to order items
      const cartItems = Object.entries(items || {}).map(([productId, item]) => {
        const product = products?.find(p => p.id === parseInt(productId));
        if (!product) throw new Error(`Product with ID ${productId} not found`);
        
        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity || 0,
          subtotal: product.price * (item.quantity || 0)
        };
      });
      
      // Validate order items
      orderItemsSchema.parse(cartItems);
      
      // Create order payload
      const orderData = {
        ...data,
        items: cartItems,
        totalAmount: (totalAmount || 0) * 100, // Convert to cents
      };
      
      const response = await apiRequest("POST", "/api/orders", orderData);
      return await response.json();
    },
    onSuccess: (data: Order) => {
      setOrderId(data.id);
      setFormStep(4);
      clearCart();
      toast({
        title: "Order placed successfully",
        description: `Your order #ORD-${data.id} has been placed successfully.`
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitOrder = form.handleSubmit((data) => {
    if (totalItems === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some products to your order.",
        variant: "destructive",
      });
      setFormStep(2);
      return;
    }
    
    createOrderMutation.mutate(data);
  });

  const steps = [
    {
      id: 1,
      title: "Details",
      content: (
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="buyerName">Full Name</Label>
              <Input
                id="buyerName"
                {...form.register("buyerName")}
                placeholder="Enter your full name"
                className={form.formState.errors.buyerName ? "border-red-500" : ""}
              />
              {form.formState.errors.buyerName && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.buyerName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                {...form.register("businessName")}
                placeholder="Enter your business name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email address"
                className={form.formState.errors.email ? "border-red-500" : ""}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="Enter your phone number"
                className={form.formState.errors.phone ? "border-red-500" : ""}
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.phone.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              {...form.register("deliveryAddress")}
              rows={3}
              placeholder="Enter complete delivery address"
              className={form.formState.errors.deliveryAddress ? "border-red-500" : ""}
            />
            {form.formState.errors.deliveryAddress && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.deliveryAddress.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...form.register("city")}
                className={form.formState.errors.city ? "border-red-500" : ""}
              />
              {form.formState.errors.city && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...form.register("state")}
                className={form.formState.errors.state ? "border-red-500" : ""}
              />
              {form.formState.errors.state && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.state.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                {...form.register("pincode")}
                className={form.formState.errors.pincode ? "border-red-500" : ""}
              />
              {form.formState.errors.pincode && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.pincode.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <Label htmlFor="deliveryInstructions">Delivery Instructions (Optional)</Label>
            <Textarea
              id="deliveryInstructions"
              {...form.register("deliveryInstructions")}
              rows={2}
              placeholder="Any special instructions for delivery"
            />
          </div>
          
          <div className="mb-6">
            <Label htmlFor="preferredDeliveryDate">Preferred Delivery Date</Label>
            <Input
              id="preferredDeliveryDate"
              type="date"
              {...form.register("preferredDeliveryDate")}
              className={form.formState.errors.preferredDeliveryDate ? "border-red-500" : ""}
              min={format(new Date(), "yyyy-MM-dd")}
            />
            {form.formState.errors.preferredDeliveryDate && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.preferredDeliveryDate.message}</p>
            )}
          </div>
        </form>
      ),
    },
    {
      id: 2,
      title: "Products",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Select Products</h3>
          
          {/* Current Cart */}
          {Object.keys(items || {}).length > 0 && (
            <div className="mb-8 border rounded-lg p-4 bg-gray-50">
              <h4 className="text-lg font-medium mb-3">Your Current Order</h4>
              <div className="divide-y divide-gray-200">
                {Object.entries(items || {}).map(([productId, item]) => {
                  const product = products?.find(p => p.id === parseInt(productId));
                  if (!product) return null;
                  
                  return (
                    <CartItem 
                      key={productId} 
                      product={product} 
                      quantity={item.quantity || 0} 
                    />
                  );
                })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount || 0)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Available Products */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 3,
      title: "Review",
      content: (
        <div>
          <h3 className="text-xl font-semibold mb-4">Review Your Order</h3>
          
          {/* Order Summary */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium mb-3">Order Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Customer Information</h5>
                <p className="text-gray-600">
                  {form.getValues().buyerName}<br />
                  {form.getValues().email}<br />
                  {form.getValues().phone}
                </p>
                {form.getValues().businessName && (
                  <p className="text-gray-600 mt-1">
                    Business: {form.getValues().businessName}
                  </p>
                )}
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Delivery Information</h5>
                <p className="text-gray-600">
                  {form.getValues().deliveryAddress}<br />
                  {form.getValues().city}, {form.getValues().state} {form.getValues().pincode}<br />
                  Preferred Date: {format(new Date(form.getValues().preferredDeliveryDate), "PPP")}
                </p>
                {form.getValues().deliveryInstructions && (
                  <p className="text-gray-600 mt-1">
                    <span className="font-medium">Instructions:</span> {form.getValues().deliveryInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Items */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Order Items</h4>
            {totalItems === 0 ? (
              <div className="text-center py-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No items in your order.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => setFormStep(2)}
                >
                  Add Products
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg">
                <div className="divide-y divide-gray-200">
                  {Object.entries(items || {}).map(([productId, item]) => {
                    const product = products?.find(p => p.id === parseInt(productId));
                    if (!product) return null;
                    
                    return (
                      <CartItem 
                        key={productId} 
                        product={product} 
                        quantity={item.quantity || 0} 
                      />
                    );
                  })}
                </div>
                
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium text-gray-900">{formatCurrency(200)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency((totalAmount || 0) + 200)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button 
            type="button"
            className="w-full"
            disabled={totalItems === 0 || createOrderMutation.isPending}
            onClick={handleSubmitOrder}
          >
            {createOrderMutation.isPending ? "Processing..." : "Place Order"}
          </Button>
        </div>
      ),
    },
    {
      id: 4,
      title: "Complete",
      content: (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Order Placed Successfully!</h3>
          <p className="text-gray-600 mb-6">
            Your order #{orderId ? `ORD-${orderId}` : ""} has been placed successfully.
          </p>
          <div className="max-w-md mx-auto p-4 border rounded-lg bg-gray-50 text-left mb-6">
            <p className="font-medium mb-2">What happens next?</p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-500 mr-2">•</span>
                <span>You will receive an email confirmation shortly.</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-500 mr-2">•</span>
                <span>Our team will review your order and begin processing it.</span>
              </li>
              <li className="flex items-start">
                <span className="h-5 w-5 text-green-500 mr-2">•</span>
                <span>You can track your order status using your order ID.</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = "/products";
              }}
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => {
                window.location.href = `/track-order?id=${orderId}`;
              }}
            >
              Track Your Order
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const handleFormComplete = () => {
    handleSubmitOrder();
  };

  return (
    <section id="place-order" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Place Bulk Order</h2>
        <p className="text-gray-600 mb-8">Complete the form below to place your bulk order for fresh produce.</p>
        
        {/* Multistep Order Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <MultistepForm 
            steps={steps} 
            onComplete={handleFormComplete} 
          />
        </div>
      </div>
    </section>
  );
}