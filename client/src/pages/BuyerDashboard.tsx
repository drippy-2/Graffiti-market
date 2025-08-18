import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import { ShoppingCart, Package, Heart, User, Truck, CheckCircle, Clock, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";

export default function BuyerDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated && user?.role === 'buyer',
  });

  const { data: cartData } = useQuery({
    queryKey: ['/api/orders/cart'],
    enabled: isAuthenticated && user?.role === 'buyer',
  });

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">You need to be logged in as a buyer to view this dashboard</p>
              <Link href="/login">
                <Button data-testid="button-login">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const orders = ordersData?.orders || [];
  const cartItems = cartData?.items || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
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
            Welcome back, <span className="font-bangers text-graffiti-orange">{user.username}</span>!
          </h1>
          <p className="text-gray-600">Manage your orders and shopping preferences</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-graffiti-orange" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-orders">
                    {orders.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-graffiti-green" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cart Items</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-cart-items">
                    {cartItems.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-graffiti-purple" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-delivered-orders">
                    {orders.filter(order => order.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-graffiti-pink" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wishlist</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle data-testid="text-recent-orders">Recent Orders</CardTitle>
                <Button variant="outline" size="sm" data-testid="button-view-all-orders">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                        <Skeleton className="h-4 w-48 mb-2" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <Link href="/products">
                      <Button className="bg-graffiti-orange hover:bg-orange-600" data-testid="button-start-shopping">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-graffiti-orange transition-colors"
                        data-testid={`order-${order.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800" data-testid={`text-order-id-${order.id}`}>
                            Order #{order.id.slice(0, 8)}
                          </h4>
                          <Badge className={getStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{formatStatus(order.status)}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2" data-testid={`text-order-items-${order.id}`}>
                          {order.items?.length || 0} items • ${order.totalPrice}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm" data-testid={`text-order-date-${order.id}`}>
                            Ordered on {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-order-${order.id}`}
                          >
                            {order.status === 'shipped' || order.status === 'in_transit' ? 'Track Package' : 'View Details'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Cart */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-quick-actions">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/cart">
                  <Button className="w-full bg-graffiti-orange text-white hover:bg-orange-600" data-testid="button-view-cart">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View Cart ({cartItems.length})
                  </Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full" data-testid="button-browse-products">
                    <Package className="h-4 w-4 mr-2" />
                    Browse Products
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" data-testid="button-wishlist">
                  <Heart className="h-4 w-4 mr-2" />
                  Wishlist (0)
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </Button>
              </CardContent>
            </Card>

            {/* Cart Preview */}
            {cartItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-cart-preview">Cart Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3" data-testid={`cart-preview-${item.id}`}>
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm" data-testid={`text-cart-item-name-${item.id}`}>
                            {item.product?.name}
                          </p>
                          <p className="text-graffiti-orange font-bold text-sm" data-testid={`text-cart-item-price-${item.id}`}>
                            ${item.product?.price}
                          </p>
                        </div>
                      </div>
                    ))}
                    {cartItems.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{cartItems.length - 3} more items
                      </p>
                    )}
                    <Link href="/checkout">
                      <Button className="w-full mt-4 bg-graffiti-green hover:bg-green-600" data-testid="button-checkout">
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-account-summary">Account Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium" data-testid="text-member-since">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-medium text-graffiti-orange" data-testid="text-total-spent">
                      ${orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
