import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import GraffitiLayer from "@/components/GraffitiLayer";
import ProductSlider from "@/components/ProductSlider";
import {
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  Shield,
  Truck,
  DollarSign,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle,
  Plus,
  Package,
  TrendingUp,
  Users,
  BarChart3,
  Gavel,
  Settings,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const [activeDashboard, setActiveDashboard] = useState("buyer");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Landing Page Hero Section with Graffiti Layer */}
      <section className="relative min-h-screen hero-gradient overflow-hidden">
        <GraffitiLayer />

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Column - Hero Content */}
            <div className="text-white space-y-8 animate-slide-right">
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="font-bangers text-graffiti-orange graffiti-shadow">
                  Street Smart
                </span>
                <br />
                <span className="text-white">Shopping</span>
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Discover unique products from verified sellers worldwide. Join the marketplace revolution with our urban-inspired platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products">
                  <Button
                    className="bg-graffiti-orange text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all transform hover:scale-105"
                    data-testid="button-start-shopping"
                  >
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-2 border-graffiti-pink text-graffiti-pink px-8 py-4 rounded-lg font-semibold text-lg hover:bg-graffiti-pink hover:text-white transition-all"
                    data-testid="button-become-seller"
                  >
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Product Slide Showcase */}
            <ProductSlider />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="font-bangers text-graffiti-purple graffiti-shadow">Shop</span> by Category
            </h2>
            <p className="text-gray-600 text-lg">Explore our diverse marketplace</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group cursor-pointer" data-testid="category-electronics">
              <div className="gradient-orange p-8 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <Smartphone className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-800">Electronics</h3>
            </div>
            <div className="text-center group cursor-pointer" data-testid="category-fashion">
              <div className="gradient-pink p-8 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <Shirt className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-800">Fashion</h3>
            </div>
            <div className="text-center group cursor-pointer" data-testid="category-home">
              <div className="gradient-green p-8 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <Home className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-800">Home & Garden</h3>
            </div>
            <div className="text-center group cursor-pointer" data-testid="category-sports">
              <div className="gradient-purple p-8 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <Dumbbell className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="font-semibold text-gray-800">Sports</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Dashboard Previews */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              <span className="font-bangers text-graffiti-orange graffiti-shadow">Multi-Role</span> Platform
            </h2>
            <p className="text-gray-600 text-lg">Buyer, Seller, or Admin - we've got you covered</p>
          </div>

          {/* Dashboard Tabs */}
          <Tabs value={activeDashboard} onValueChange={setActiveDashboard} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="buyer" data-testid="tab-buyer">Buyer Dashboard</TabsTrigger>
              <TabsTrigger value="seller" data-testid="tab-seller">Seller Dashboard</TabsTrigger>
              <TabsTrigger value="admin" data-testid="tab-admin">Admin Dashboard</TabsTrigger>
            </TabsList>

            {/* Buyer Dashboard Preview */}
            <TabsContent value="buyer" className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6" data-testid="text-my-orders">My Orders</h3>
                      <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-graffiti-orange transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800">Order #12345</h4>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">Delivered</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">3 items • $287.99</p>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Delivered on Dec 15, 2023</span>
                            <Button variant="link" className="text-graffiti-orange hover:text-orange-600 p-0" data-testid="button-view-details">
                              View Details
                            </Button>
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-graffiti-orange transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-800">Order #12344</h4>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">In Transit</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">1 item • $99.99</p>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Expected delivery: Dec 20, 2023</span>
                            <Button variant="link" className="text-graffiti-orange hover:text-orange-600 p-0" data-testid="button-track-package">
                              Track Package
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-graffiti-orange text-white hover:bg-orange-600" data-testid="button-view-cart">
                          View Cart (3)
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-wishlist">
                          Wishlist (12)
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-profile-settings">
                          Profile Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Seller Dashboard Preview */}
            <TabsContent value="seller" className="space-y-4">
              <div className="grid lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6" data-testid="text-revenue-dashboard">Revenue Dashboard</h3>
                      <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="gradient-green rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Total Sales</h4>
                          <p className="text-3xl font-bold" data-testid="text-total-sales">$12,458</p>
                          <p className="text-green-100 text-sm">+15% from last month</p>
                        </div>
                        <div className="gradient-blue rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Pending Balance</h4>
                          <p className="text-3xl font-bold" data-testid="text-pending-balance">$2,847</p>
                          <p className="text-blue-100 text-sm">Available for withdrawal</p>
                        </div>
                        <div className="gradient-purple rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Products Sold</h4>
                          <p className="text-3xl font-bold" data-testid="text-products-sold">847</p>
                          <p className="text-purple-100 text-sm">32 orders pending</p>
                        </div>
                      </div>

                      {/* Withdrawal System Preview */}
                      <div className="border-t pt-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Withdraw Earnings</h4>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <p className="text-sm text-gray-500 mb-4">Platform fee: 7% (Auto-deducted)</p>
                          <Button className="bg-graffiti-orange text-white hover:bg-orange-600" data-testid="button-request-withdrawal">
                            Request Withdrawal
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-graffiti-orange text-white hover:bg-orange-600" data-testid="button-add-product">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Product
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-manage-orders">
                          <Package className="h-4 w-4 mr-2" />
                          Manage Orders
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-analytics">
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Verification Status</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 font-medium">Verified Seller</span>
                      </div>
                      <p className="text-gray-600 text-sm">Business documents approved</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Admin Dashboard Preview */}
            <TabsContent value="admin" className="space-y-4">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-2xl font-bold text-gray-800 mb-6" data-testid="text-platform-analytics">Platform Analytics</h3>
                      <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="gradient-orange rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Total Revenue</h4>
                          <p className="text-3xl font-bold" data-testid="text-platform-revenue">$487,293</p>
                          <p className="text-orange-100 text-sm">Platform fees collected</p>
                        </div>
                        <div className="gradient-purple rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Active Sellers</h4>
                          <p className="text-3xl font-bold" data-testid="text-active-sellers">1,247</p>
                          <p className="text-purple-100 text-sm">68 pending verification</p>
                        </div>
                        <div className="gradient-green rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Total Orders</h4>
                          <p className="text-3xl font-bold" data-testid="text-total-orders">23,891</p>
                          <p className="text-green-100 text-sm">This month</p>
                        </div>
                        <div className="gradient-pink rounded-lg p-6 text-white">
                          <h4 className="text-lg font-semibold mb-2">Active Users</h4>
                          <p className="text-3xl font-bold" data-testid="text-active-users">45,932</p>
                          <p className="text-pink-100 text-sm">+12% growth</p>
                        </div>
                      </div>

                      {/* Pending Approvals Preview */}
                      <div className="border-t pt-6">
                        <h4 className="text-xl font-bold text-gray-800 mb-4">Pending Approvals</h4>
                        <div className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-800">Seller Verification</h5>
                                <p className="text-gray-600 text-sm">TechStore LLC - Business documents submitted</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" data-testid="button-approve-seller">
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" data-testid="button-reject-seller">
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-gray-800">Withdrawal Request</h5>
                                <p className="text-gray-600 text-sm">Fashion Hub - $2,500 → $2,325 (PayPal)</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" data-testid="button-process-withdrawal">
                                  Process
                                </Button>
                                <Button size="sm" variant="destructive" data-testid="button-reject-withdrawal">
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Admin Tools</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-graffiti-purple text-white hover:bg-purple-600" data-testid="button-manage-users">
                          <Users className="h-4 w-4 mr-2" />
                          Manage Users
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-seller-applications">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Seller Applications
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-withdrawal-requests">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Withdrawal Requests
                        </Button>
                        <Button variant="outline" className="w-full" data-testid="button-dispute-resolution">
                          <Gavel className="h-4 w-4 mr-2" />
                          Dispute Resolution
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">System Health</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Server Status</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Healthy</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Database</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Online</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Payment Gateway</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Connected</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose <span className="font-bangers text-graffiti-green graffiti-shadow">ProAce</span>?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="gradient-orange p-6 rounded-2xl mb-4 group-hover:scale-105 transition-transform inline-block">
                <Shield className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Verified Sellers</h3>
              <p className="text-gray-600">All sellers undergo rigorous verification for your safety</p>
            </div>
            <div className="text-center group">
              <div className="gradient-green p-6 rounded-2xl mb-4 group-hover:scale-105 transition-transform inline-block">
                <Truck className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Global delivery with real-time tracking</p>
            </div>
            <div className="text-center group">
              <div className="gradient-purple p-6 rounded-2xl mb-4 group-hover:scale-105 transition-transform inline-block">
                <DollarSign className="h-10 w-10 text-white mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Easy Payouts</h3>
              <p className="text-gray-600">Seamless withdrawal system with transparent fees</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bangers text-2xl text-graffiti-orange graffiti-shadow mb-4">
                ProAce International
              </h3>
              <p className="text-gray-400 mb-4">Your global marketplace for everything</p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-graffiti-orange hover:text-orange-600 cursor-pointer" />
                <Twitter className="h-6 w-6 text-graffiti-orange hover:text-orange-600 cursor-pointer" />
                <Instagram className="h-6 w-6 text-graffiti-orange hover:text-orange-600 cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/products" className="hover:text-white">Browse Products</Link></li>
                <li><Link href="/dashboard/buyer" className="hover:text-white">Track Orders</Link></li>
                <li><a href="#" className="hover:text-white">Customer Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register" className="hover:text-white">Seller Registration</Link></li>
                <li><Link href="/dashboard/seller" className="hover:text-white">Seller Dashboard</Link></li>
                <li><a href="#" className="hover:text-white">Withdrawal System</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2023 ProAce International Shopping. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
