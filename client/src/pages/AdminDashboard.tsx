import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  CheckCircle,
  X,
  Eye,
  Search,
  BarChart3,
  FileText,
  AlertTriangle,
  Shield,
  Clock,
  Package,
} from "lucide-react";
import { Link } from "wouter";
import { queryClient } from "@/lib/queryClient";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");

  // Queries
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['/api/admin/dashboard'],
    queryFn: () => api.getAdminDashboard(),
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['/api/admin/sellers'],
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'sellers',
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ['/api/admin/withdrawals'],
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'withdrawals',
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'users',
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
    enabled: isAuthenticated && user?.role === 'admin' && activeTab === 'orders',
  });

  // Mutations
  const approveSellerMutation = useMutation({
    mutationFn: (sellerId: string) => api.approveSeller(sellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({ title: "Seller approved successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to approve seller",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const rejectSellerMutation = useMutation({
    mutationFn: (sellerId: string) => api.rejectSeller(sellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({ title: "Seller rejected" });
    },
    onError: (error) => {
      toast({
        title: "Failed to reject seller",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const processWithdrawalMutation = useMutation({
    mutationFn: ({ withdrawalId, transactionId }: { withdrawalId: string; transactionId?: string }) =>
      api.processWithdrawal(withdrawalId, transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({ title: "Withdrawal processed successfully" });
      setTransactionId("");
    },
    onError: (error) => {
      toast({
        title: "Failed to process withdrawal",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: api.rejectWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
      toast({ title: "Withdrawal rejected" });
    },
    onError: (error) => {
      toast({
        title: "Failed to reject withdrawal",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });

  // Access control
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need to be logged in as an admin to view this dashboard</p>
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
  const sellers = sellersData?.sellers || [];
  const withdrawals = withdrawalsData?.withdrawals || [];
  const users = usersData?.users || [];
  const orders = ordersData?.orders || [];
  const orderCategories = ordersData?.categories || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'processed':
      case 'delivered':
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

  const filteredSellers = sellers.filter((seller: any) =>
    seller.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter((user: any) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="font-bangers text-graffiti-purple">Admin</span> Dashboard
          </h1>
          <p className="text-gray-600">Manage your marketplace platform</p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
            <TabsTrigger value="sellers" data-testid="tab-sellers">Sellers</TabsTrigger>
            <TabsTrigger value="withdrawals" data-testid="tab-withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <DollarSign className="h-8 w-8 text-graffiti-orange" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-platform-revenue">
                        ${dashboard?.metrics?.platformRevenue?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Store className="h-8 w-8 text-graffiti-purple" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Sellers</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-active-sellers">
                        {dashboard?.metrics?.activeSellers || 0}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dashboard?.metrics?.pendingSellers || 0} pending
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-graffiti-green" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-orders">
                        {dashboard?.metrics?.totalOrders || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-graffiti-pink" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-users">
                        {dashboard?.metrics?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Approvals */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Pending Seller Approvals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="h-5 w-5 mr-2 text-graffiti-orange" />
                    Pending Seller Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : dashboard?.pendingApprovals?.sellers?.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-gray-600">All sellers approved!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboard?.pendingApprovals?.sellers?.slice(0, 3).map((seller: any) => (
                        <div key={seller.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4" data-testid={`pending-seller-${seller.id}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-gray-800" data-testid={`text-seller-business-${seller.id}`}>
                                {seller.businessName}
                              </h5>
                              <p className="text-gray-600 text-sm">
                                Submitted {new Date(seller.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => approveSellerMutation.mutate(seller.id)}
                                disabled={approveSellerMutation.isPending}
                                data-testid={`button-approve-seller-${seller.id}`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectSellerMutation.mutate(seller.id)}
                                disabled={rejectSellerMutation.isPending}
                                data-testid={`button-reject-seller-${seller.id}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-graffiti-green" />
                    Pending Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : dashboard?.pendingApprovals?.withdrawals?.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                      <p className="text-gray-600">No pending withdrawals!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboard?.pendingApprovals?.withdrawals?.slice(0, 3).map((withdrawal: any) => (
                        <div key={withdrawal.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4" data-testid={`pending-withdrawal-${withdrawal.id}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-semibold text-gray-800">
                                ${withdrawal.amountRequested} → ${withdrawal.amountPaid}
                              </h5>
                              <p className="text-gray-600 text-sm capitalize">
                                {withdrawal.method} • {new Date(withdrawal.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" data-testid={`button-process-withdrawal-${withdrawal.id}`}>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Process
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Process Withdrawal</DialogTitle>
                                    <DialogDescription>
                                      Enter transaction ID to confirm the withdrawal has been processed.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transaction ID (Optional)
                                      </label>
                                      <Input
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction ID"
                                        data-testid="input-transaction-id"
                                      />
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => processWithdrawalMutation.mutate({ withdrawalId: withdrawal.id, transactionId })}
                                        disabled={processWithdrawalMutation.isPending}
                                        data-testid="button-confirm-process"
                                      >
                                        Confirm Process
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                                disabled={rejectWithdrawalMutation.isPending}
                                data-testid={`button-reject-withdrawal-${withdrawal.id}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-system-health">System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Server Status</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Database</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Gateway</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-orders"
                  />
                </div>
              </div>
            </div>

            {/* Order Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-total">
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto text-graffiti-blue mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.total || 0}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-recent">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto text-graffiti-green mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.recent || 0}</p>
                  <p className="text-sm text-gray-600">Recent (7 days)</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-high-value">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto text-graffiti-orange mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.high_value || 0}</p>
                  <p className="text-sm text-gray-600">High Value ($100+)</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-pending">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto text-graffiti-yellow mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.pending_fulfillment || 0}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-completed">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto text-graffiti-green mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.completed || 0}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" data-testid="category-cancelled">
                <CardContent className="p-4 text-center">
                  <X className="h-8 w-8 mx-auto text-graffiti-red mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orderCategories.cancelled || 0}</p>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </CardContent>
              </Card>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600">No orders have been placed yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order: any) => (
                  <Card key={order.id} data-testid={`order-card-${order.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900" data-testid={`text-order-id-${order.id}`}>
                              Order #{order.id.substring(0, 8)}
                            </h3>
                            <Badge className={getStatusColor(order.status)} data-testid={`badge-order-status-${order.id}`}>
                              {formatStatus(order.status)}
                            </Badge>
                            {order.totalPrice > 100 && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                High Value
                              </Badge>
                            )}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
                              <p><strong>Payment:</strong> {order.method}</p>
                            </div>
                            <div>
                              <p><strong>Buyer ID:</strong> {order.buyerId.substring(0, 8)}...</p>
                              <p><strong>Seller ID:</strong> {order.sellerId.substring(0, 8)}...</p>
                            </div>
                            <div>
                              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                              <p><strong>Items:</strong> {order.items?.length || 0}</p>
                            </div>
                          </div>
                          {order.trackingNumber && (
                            <div className="mt-2 text-sm">
                              <p><strong>Tracking:</strong> {order.trackingNumber} ({order.carrier})</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-view-order-${order.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sellers Tab */}
          <TabsContent value="sellers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Seller Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-sellers"
                  />
                </div>
              </div>
            </div>

            {sellersLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredSellers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sellers found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredSellers.map((seller: any) => (
                  <Card key={seller.id} data-testid={`seller-card-${seller.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900" data-testid={`text-seller-name-${seller.id}`}>
                              {seller.businessName}
                            </h3>
                            <Badge className={getStatusColor(seller.status)} data-testid={`badge-seller-status-${seller.id}`}>
                              {formatStatus(seller.status)}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Owner:</strong> {seller.user?.username || 'N/A'}</p>
                              <p><strong>Email:</strong> {seller.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                              <p><strong>Registered:</strong> {new Date(seller.createdAt).toLocaleDateString()}</p>
                              <p><strong>Verified:</strong> {seller.verifiedAt ? new Date(seller.verifiedAt).toLocaleDateString() : 'Not verified'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {seller.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white"
                                onClick={() => approveSellerMutation.mutate(seller.id)}
                                disabled={approveSellerMutation.isPending}
                                data-testid={`button-approve-${seller.id}`}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectSellerMutation.mutate(seller.id)}
                                disabled={rejectSellerMutation.isPending}
                                data-testid={`button-reject-${seller.id}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedSeller(seller)}
                                data-testid={`button-view-seller-${seller.id}`}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Seller Details</DialogTitle>
                              </DialogHeader>
                              {selectedSeller && (
                                <div className="space-y-4">
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Business Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Business Name:</strong> {selectedSeller.businessName}</p>
                                        <p><strong>Status:</strong> {formatStatus(selectedSeller.status)}</p>
                                        <p><strong>Registration Date:</strong> {new Date(selectedSeller.createdAt).toLocaleDateString()}</p>
                                        {selectedSeller.verifiedAt && (
                                          <p><strong>Verified Date:</strong> {new Date(selectedSeller.verifiedAt).toLocaleDateString()}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                                      <div className="space-y-1 text-sm">
                                        <p><strong>Username:</strong> {selectedSeller.user?.username}</p>
                                        <p><strong>Email:</strong> {selectedSeller.user?.email}</p>
                                        <p><strong>Phone:</strong> {selectedSeller.user?.phone || 'Not provided'}</p>
                                        <p><strong>Address:</strong> {selectedSeller.user?.address || 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>
                                  {selectedSeller.documents && (
                                    <div>
                                      <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                                      <p className="text-sm text-gray-600">{selectedSeller.documents}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Withdrawal Management</h2>
            </div>

            {withdrawalsLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : withdrawals.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No withdrawals yet</h3>
                  <p className="text-gray-600">Withdrawal requests will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {withdrawals.map((withdrawal: any) => (
                  <Card key={withdrawal.id} data-testid={`withdrawal-card-${withdrawal.id}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900" data-testid={`text-withdrawal-amount-${withdrawal.id}`}>
                              ${withdrawal.amountRequested} → ${withdrawal.amountPaid}
                            </h3>
                            <Badge className={getStatusColor(withdrawal.status)} data-testid={`badge-withdrawal-status-${withdrawal.id}`}>
                              {formatStatus(withdrawal.status)}
                            </Badge>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Seller:</strong> {withdrawal.seller?.businessName || 'N/A'}</p>
                              <p><strong>Method:</strong> {withdrawal.method}</p>
                            </div>
                            <div>
                              <p><strong>Requested:</strong> {new Date(withdrawal.createdAt).toLocaleDateString()}</p>
                              <p><strong>Transaction ID:</strong> {withdrawal.transactionId || 'Not set'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" data-testid={`button-process-${withdrawal.id}`}>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Process
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Process Withdrawal</DialogTitle>
                                    <DialogDescription>
                                      Confirm the withdrawal has been processed and optionally add a transaction ID.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Transaction ID (Optional)
                                      </label>
                                      <Input
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        placeholder="Enter transaction ID"
                                        data-testid={`input-transaction-${withdrawal.id}`}
                                      />
                                    </div>
                                    <Button
                                      onClick={() => processWithdrawalMutation.mutate({ withdrawalId: withdrawal.id, transactionId })}
                                      disabled={processWithdrawalMutation.isPending}
                                      data-testid={`button-confirm-process-${withdrawal.id}`}
                                    >
                                      Confirm Process
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectWithdrawalMutation.mutate(withdrawal.id)}
                                disabled={rejectWithdrawalMutation.isPending}
                                data-testid={`button-reject-${withdrawal.id}`}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
            </div>

            {usersLoading ? (
              <div className="grid gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user: any) => (
                  <Card key={user.id} data-testid={`user-card-${user.id}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-graffiti-orange rounded-full flex items-center justify-center text-white font-bold">
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900" data-testid={`text-user-name-${user.id}`}>
                              {user.username}
                            </h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'seller' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} data-testid={`badge-user-role-${user.id}`}>
                            {user.role}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-graffiti-orange" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                  <p className="text-gray-600">
                    Detailed platform analytics and reporting features will be available soon.
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
