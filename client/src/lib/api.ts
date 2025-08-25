import { User } from '@shared/schema';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}
class ApiClient {
  get(arg0: string): any {
    throw new Error("Method not implemented.");
  }
  private token: string | null = null;
  private baseUrl: string;

  constructor() {
    this.token = localStorage.getItem('access_token');
    this.baseUrl = API_BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Automatically prepend /api if not present
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;


    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    this.setToken(data.access_token);
    return data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
    businessName?: string;
    phone?: string;
    address?: string;
  }): Promise<{ message: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<User> {
    return this.request('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Product endpoints
  async getProducts(params: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    sort?: string;
  } = {}): Promise<{
    products: any[];
    total: number;
    pages: number;
    current_page: number;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/products?${query}`);
  }

  async getProduct(id: string): Promise<any> {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: any): Promise<{ message: string; product: any }> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: any): Promise<{ message: string; product: any }> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategories(): Promise<{ categories: string[] }> {
    return this.request('/products/categories');
  }

  async addReview(productId: string, reviewData: { rating: number; comment: string }): Promise<{ message: string; review: any }> {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Cart and Order endpoints
  async getCart(): Promise<{ items: any[] }> {
    return this.request('/orders/cart');
  }

  async addToCart(productId: string, quantity: number): Promise<{ message: string }> {
    return this.request('/orders/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId: string, quantity: number): Promise<{ message: string }> {
    return this.request(`/orders/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: string): Promise<{ message: string }> {
    return this.request(`/orders/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async checkout(orderData: { shippingAddress: string; method: string }): Promise<{ message: string; orders: any[] }> {
    return this.request('/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<{ orders: any[] }> {
    return this.request('/orders');
  }

  async getOrder(id: string): Promise<any> {
    return this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id: string, statusData: {
    status?: string;
    carrier?: string;
    trackingNumber?: string;
  }): Promise<{ message: string; order: any }> {
    return this.request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  }

  // Seller endpoints
  async getSellerDashboard(): Promise<{
    seller: any;
    metrics: any;
    recentOrders: any[];
  }> {
    return this.request('/seller/dashboard');
  }

  async getSellerProducts() {
    const token = localStorage.getItem('access_token'); // get JWT
    if (!token) throw new Error('No access token found');

    const res = await fetch('http://localhost:5000/api/seller/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json(); // { products: [...] }
  }


  async getWithdrawals(): Promise<{ withdrawals: any[] }> {
    return this.request('/seller/withdrawals');
  }

  async requestWithdrawal(amount: number, method: string): Promise<{ message: string; withdrawal: any }> {
    return this.request('/seller/withdrawals', {
      method: 'POST',
      body: JSON.stringify({ amount, method }),
    });
  }

  async submitVerification(documents: string): Promise<{ message: string; seller: any }> {
    return this.request('/seller/verification', {
      method: 'POST',
      body: JSON.stringify({ documents }),
    });
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<{
    metrics: any;
    pendingApprovals: any;
  }> {
    return this.request('/admin/dashboard');
  }

  async getAllSellers(params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<{
    sellers: any[];
    total: number;
    pages: number;
    current_page: number;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/api/admin/sellers?${query}`);
  }

  async approveSeller(sellerId: string): Promise<{ message: string; seller: any }> {
    return this.request(`/admin/sellers/${sellerId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectSeller(sellerId: string): Promise<{ message: string; seller: any }> {
    return this.request(`/admin/sellers/${sellerId}/reject`, {
      method: 'PUT',
    });
  }

  async getAllWithdrawals(params: {
    page?: number;
    per_page?: number;
    status?: string;
  } = {}): Promise<{
    withdrawals: any[];
    total: number;
    pages: number;
    current_page: number;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/admin/withdrawals?${query}`);
  }

  async processWithdrawal(withdrawalId: string, transactionId?: string): Promise<{ message: string; withdrawal: any }> {
    return this.request(`/admin/withdrawals/${withdrawalId}/process`, {
      method: 'PUT',
      body: JSON.stringify({ transactionId }),
    });
  }

  async rejectWithdrawal(withdrawalId: string): Promise<{ message: string; withdrawal: any }> {
    return this.request(`/admin/withdrawals/${withdrawalId}/reject`, {
      method: 'PUT',
    });
  }

  async getAllUsers(params: {
    page?: number;
    per_page?: number;
    role?: string;
  } = {}): Promise<{
    users: any[];
    total: number;
    pages: number;
    current_page: number;
  }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });

    return this.request(`/admin/users?${query}`);
  }
}

export const api = new ApiClient();
