import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Truck, Shield, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
  method: z.string().min(1, "Please select a shipping method"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ['/api/orders/cart'],
    enabled: isAuthenticated && user?.role === 'buyer',
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: { shippingAddress: string; method: string }) =>
      api.checkout(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/orders/cart'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      
      toast({
        title: "Order placed successfully!",
        description: `${data.orders.length} order(s) have been created.`,
      });
      setLocation("/dashboard/buyer");
    },
    onError: (error) => {
      toast({
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || "",
      method: "",
      paymentMethod: "",
    },
  });

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need to be logged in as a buyer to checkout</p>
              <Link href="/login">
                <Button data-testid="button-login">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const cartItems = cartData?.items || [];
  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const shippingCost = 0; // Free shipping
  const finalTotal = total + shippingCost;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart before checkout</p>
              <Link href="/products">
                <Button className="bg-graffiti-orange hover:bg-orange-600" data-testid="button-shop-now">
                  Shop Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await checkoutMutation.mutateAsync({
        shippingAddress: data.shippingAddress,
        method: data.method,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/cart">
              <Button variant="ghost" size="sm" data-testid="button-back-to-cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="font-bangers text-graffiti-orange">Secure</span> Checkout
          </h1>
          <p className="text-gray-600">Complete your order securely</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="h-5 w-5 mr-2 text-graffiti-orange" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="shippingAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your complete shipping address"
                              className="resize-none"
                              {...field}
                              data-testid="input-shipping-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Shipping Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-shipping-method">
                                <SelectValue placeholder="Select shipping method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="standard" data-testid="option-standard">
                                <div className="flex justify-between items-center w-full">
                                  <span>Standard Shipping (5-7 days)</span>
                                  <span className="text-green-600 font-medium">Free</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="express" data-testid="option-express">
                                <div className="flex justify-between items-center w-full">
                                  <span>Express Shipping (2-3 days)</span>
                                  <span className="font-medium">$9.99</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Payment Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-graffiti-orange" />
                      Payment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-payment-method">
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="credit_card" data-testid="option-credit-card">
                                Credit/Debit Card
                              </SelectItem>
                              <SelectItem value="paypal" data-testid="option-paypal">
                                PayPal
                              </SelectItem>
                              <SelectItem value="stripe" data-testid="option-stripe">
                                Stripe
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Mock Payment Form */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          disabled
                          data-testid="input-card-number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <Input
                          placeholder="MM/YY"
                          disabled
                          data-testid="input-expiry"
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
                      <Shield className="h-4 w-4 inline mr-1" />
                      This is a demo. No real payment processing occurs.
                    </p>
                  </CardContent>
                </Card>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  className="w-full bg-graffiti-orange hover:bg-orange-600 text-white text-lg py-3"
                  disabled={isProcessing || checkoutMutation.isPending}
                  data-testid="button-place-order"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Place Order (${finalTotal.toFixed(2)})
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-order-summary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm" data-testid={`summary-item-${item.id}`}>
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span data-testid="text-subtotal-summary">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-graffiti-orange" data-testid="text-total-summary">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* Security Features */}
                <div className="bg-green-50 p-4 rounded-lg mt-6">
                  <div className="flex items-center space-x-2 text-sm text-green-800">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Secure Checkout</span>
                  </div>
                  <ul className="mt-2 text-xs text-green-700 space-y-1">
                    <li>• SSL encrypted payment</li>
                    <li>• Money-back guarantee</li>
                    <li>• Verified sellers only</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
