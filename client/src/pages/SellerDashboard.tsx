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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Truck,
  FileText,
  CreditCard,
} from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  stock: z.number().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const withdrawalSchema = z.object({
  amount: z.number().min(1, "Amount must be at least $1"),
  method: z.enum(["paypal", "bank"], {
    required_error: "Please select a withdrawal method",
  }),
});

type ProductForm = z.infer<typeof productSchema>;
type WithdrawalForm = z.infer<typeof withdrawalSchema>;

export default function SellerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/seller/dashboard'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/seller/products'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/seller/withdrawals'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  // Forms
  const productForm = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      imageUrl: "",
    },
  });

  const withdrawalForm = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: 0,
      method: undefined,
    },
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/dashboard'] });
      toast({ title: "Product created successfully" });
      setIsProductDialogOpen(false);
      productForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to create product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductForm }) => api.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/dashboard'] });
      toast({ title: "Product updated successfully" });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      productForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to update product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/dashboard'] });
      toast({ title: "Product deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete product",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const requestWithdrawalMutation = useMutation({
    mutationFn: ({ amount, method }: { amount: number; method: string }) =>
      api.requestWithdrawal(amount, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/seller/dashboard'] });
      toast({ title: "Withdrawal request submitted successfully" });
      withdrawalForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to request withdrawal",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status, carrier, trackingNumber }: {
      orderId: string;
      status: string;
      carrier?: string;
      trackingNumber?: string;
    }) => api.updateOrderStatus(orderId, { status, carrier, trackingNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Access control
  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need to be logged in as a seller to view this dashboard</p>
              <Link href="/login">
                <Button data-testid="button-login">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const dashboard = dashboardData;
  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];
  const withdrawals = withdrawalsData?.withdrawals || [];

  const handleProductSubmit = async (data: ProductForm) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl || "",
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleWithdrawalSubmit = (data: WithdrawalForm) => {
    requestWithdrawalMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'delivered':
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="font-bangers text-graffiti-orange">Seller</span> Dashboard
          </h1>
          <p className="text-gray-600">Manage your products, orders, and earnings</p>
        </div>

        {/* Seller Status */}
        {dashboard?.seller && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Business: {dashboard.seller.businessName}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {dashboard.seller.status === 'approved' ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">Verified Seller</span>
                      </>
                    ) : dashboard.seller.status === 'pending' ? (
                      <>
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-yellow-600 font-medium">Verification Pending</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">Verification Required</span>
                      </>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(dashboard.seller.status)} data-testid="badge-seller-status">
                  {formatStatus(dashboard.seller.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="products" data-testid="tab-products">Products</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8 text-graffiti-green" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-sales">
                        ${dashboard?.metrics?.totalSales?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-graffiti-purple" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Balance</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-pending-balance">
                        ${dashboard?.metrics?.pendingBalance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-graffiti-orange" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Products</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-product-count">
                        {dashboard?.metrics?.productCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Truck className="h-8 w-8 text-graffiti-pink" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Orders</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-order-count">
                        {dashboard?.metrics?.orderCount || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-recent-orders">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : dashboard?.recentOrders?.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dashboard?.recentOrders?.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg" data-testid={`recent-order-${order.id}`}>
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-gray-600">${order.totalPrice}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-graffiti-orange hover:bg-orange-600" data-testid="button-add-product">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...productForm}>
                    <form onSubmit={productForm.handleSubmit(handleProductSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter product name" {...field} data-testid="input-product-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter category" {...field} data-testid="input-product-category" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={productForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter product description"
                                className="resize-none"
                                {...field}
                                data-testid="input-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={productForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price ($)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-product-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productForm.control}
                          name="stock"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stock Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  data-testid="input-product-stock"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={productForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} data-testid="input-product-image" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2">
                        <Button
                          type="submit"
                          className="bg-graffiti-orange hover:bg-orange-600"
                          disabled={createProductMutation.isPending || updateProductMutation.isPending}
                          data-testid="button-save-product"
                        >
                          {editingProduct ? 'Update Product' : 'Create Product'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsProductDialogOpen(false);
                            setEditingProduct(null);
                            productForm.reset();
                          }}
                          data-testid="button-cancel-product"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {productsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-48 w-full mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-2" />
                      <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600">Start by adding your first product</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product: any) => (
                  <Card key={product.id} data-testid={`product-card-${product.id}`}>
                    <CardContent className="p-4">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1" data-testid={`text-product-name-${product.id}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-graffiti-orange font-bold" data-testid={`text-product-price-${product.id}`}>
                          ${product.price}
                        </span>
                        <span className="text-sm text-gray-600" data-testid={`text-product-stock-${product.id}`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          data-testid={`button-edit-product-${product.id}`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-order-management">Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here once customers make purchases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4" data-testid={`order-${order.id}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900" data-testid={`text-order-id-${order.id}`}>
                              Order #{order.id.slice(0, 8)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {order.items?.length || 0} items • ${order.totalPrice}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                            {formatStatus(order.status)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Customer:</strong> {order.buyer?.username || 'N/A'}</p>
                            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><strong>Shipping:</strong> {order.method}</p>
                            <p><strong>Tracking:</strong> {order.trackingNumber || 'Not set'}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'processing' })}
                                data-testid={`button-process-order-${order.id}`}
                              >
                                Mark Processing
                              </Button>
                            )}
                            {order.status === 'processing' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  const trackingNumber = prompt('Enter tracking number:');
                                  if (trackingNumber) {
                                    updateOrderStatusMutation.mutate({
                                      orderId: order.id,
                                      status: 'shipped',
                                      carrier: 'UPS',
                                      trackingNumber,
                                    });
                                  }
                                }}
                                data-testid={`button-ship-order-${order.id}`}
                              >
                                Mark Shipped
                              </Button>
                            )}
                          </div>
                          <Button variant="outline" size="sm" data-testid={`button-view-order-${order.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Withdrawal Request Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-graffiti-orange" />
                      Request Withdrawal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-700">Available Balance:</span>
                        <span className="font-bold text-graffiti-orange" data-testid="text-available-balance">
                          ${dashboard?.metrics?.pendingBalance?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Platform fee: 7% (automatically deducted from withdrawal amount)
                      </p>
                    </div>

                    <Form {...withdrawalForm}>
                      <form onSubmit={withdrawalForm.handleSubmit(handleWithdrawalSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={withdrawalForm.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Withdrawal Amount ($)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    data-testid="input-withdrawal-amount"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={withdrawalForm.control}
                            name="method"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-withdrawal-method">
                                      <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="paypal" data-testid="option-paypal">PayPal</SelectItem>
                                    <SelectItem value="bank" data-testid="option-bank">Bank Transfer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {withdrawalForm.watch('amount') > 0 && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between text-sm">
                              <span>Requested Amount:</span>
                              <span>${withdrawalForm.watch('amount').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                              <span>Platform Fee (7%):</span>
                              <span>-${(withdrawalForm.watch('amount') * 0.07).toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <div className="flex justify-between font-bold">
                                <span>You'll Receive:</span>
                                <span className="text-graffiti-green" data-testid="text-withdrawal-net">
                                  ${(withdrawalForm.watch('amount') * 0.93).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          className="w-full bg-graffiti-orange hover:bg-orange-600"
                          disabled={requestWithdrawalMutation.isPending || (dashboard?.metrics?.pendingBalance || 0) <= 0}
                          data-testid="button-request-withdrawal"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Request Withdrawal
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Withdrawal History */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="text-withdrawal-history">Withdrawal History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawalsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Skeleton key={i} className="h-16 w-full" />
                        ))}
                      </div>
                    ) : withdrawals.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No withdrawals yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {withdrawals.map((withdrawal: any) => (
                          <div
                            key={withdrawal.id}
                            className="border border-gray-200 rounded-lg p-3"
                            data-testid={`withdrawal-${withdrawal.id}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium" data-testid={`text-withdrawal-amount-${withdrawal.id}`}>
                                  ${withdrawal.amountRequested} → ${withdrawal.amountPaid}
                                </p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {withdrawal.method}
                                </p>
                              </div>
                              <Badge className={getStatusColor(withdrawal.status)} data-testid={`badge-withdrawal-status-${withdrawal.id}`}>
                                {formatStatus(withdrawal.status)}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(withdrawal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-analytics">Sales Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed sales analytics and reporting features will be available soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
