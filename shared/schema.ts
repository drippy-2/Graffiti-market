import { z } from "zod";

// User schemas
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['buyer', 'seller', 'admin']),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Seller schemas
export const sellerSchema = z.object({
  id: z.string(),
  userId: z.string(),
  businessName: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  documents: z.string().optional(),
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
});

export const insertSellerSchema = sellerSchema.omit({ id: true, createdAt: true });
export type Seller = z.infer<typeof sellerSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;

// Product schemas
export const productSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  category: z.string(),
  imageUrl: z.string().optional(),
  createdAt: z.string(),
});

export const insertProductSchema = productSchema.omit({ id: true, createdAt: true });
export type Product = z.infer<typeof productSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Cart schemas
export const cartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  createdAt: z.string(),
});

export const insertCartItemSchema = cartItemSchema.omit({ id: true, createdAt: true });
export type CartItem = z.infer<typeof cartItemSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

// Order schemas
export const orderSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  totalPrice: z.number(),
  shippingAddress: z.string(),
  method: z.string(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  status: z.enum(['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled']),
  createdAt: z.string(),
});

export const insertOrderSchema = orderSchema.omit({ id: true, createdAt: true });
export type Order = z.infer<typeof orderSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Order Item schemas
export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  price: z.number(),
});

export const insertOrderItemSchema = orderItemSchema.omit({ id: true });
export type OrderItem = z.infer<typeof orderItemSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Withdrawal schemas
export const withdrawalSchema = z.object({
  id: z.string(),
  sellerId: z.string(),
  amountRequested: z.number(),
  amountPaid: z.number(),
  method: z.enum(['paypal', 'bank']),
  status: z.enum(['pending', 'processed', 'rejected']),
  transactionId: z.string().optional(),
  createdAt: z.string(),
  processedAt: z.string().optional(),
});

export const insertWithdrawalSchema = withdrawalSchema.omit({ id: true, createdAt: true, processedAt: true });
export type Withdrawal = z.infer<typeof withdrawalSchema>;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

// Review schemas
export const reviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.string(),
});

export const insertReviewSchema = reviewSchema.omit({ id: true, createdAt: true });
export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
