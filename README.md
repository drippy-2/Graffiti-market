# ProAce International Shopping Platform

## Overview

ProAce International Shopping is a comprehensive e-commerce marketplace platform featuring a graffiti-inspired design that connects buyers with verified sellers. The platform offers complete marketplace functionality including role-based access control (buyer, seller, admin), product catalog management, shopping cart functionality, order processing with categorization, seller withdrawal system with 7% platform fee, and PayPal payment integration. The application follows a modern full-stack architecture with React TypeScript frontend and Python Flask backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

### Order Management System
- **Admin Order Categorization**: Added comprehensive order categorization in admin dashboard
- **Order Categories**: Recent (7 days), High Value ($100+), Pending Fulfillment, Completed, Cancelled
- **Order Statistics**: Real-time category counts and filtering capabilities
- **Order Details**: Enhanced order display with buyer/seller IDs, tracking info, and status management

### Product Management Enhancement
- **Seller Product Creation**: Complete product management system for sellers
- **Product Fields**: Name, description, price, stock, category, and image URL support
- **Product Operations**: Full CRUD operations (Create, Read, Update, Delete)
- **Stock Management**: Automatic stock tracking and validation during checkout

### PayPal Integration Ready
- **Payment Gateway**: Prepared for PayPal checkout integration for credit/debit cards
- **Infrastructure**: Backend routes and frontend components ready for PayPal SDK
- **Security**: Environment variable configuration for PayPal credentials

## System Architecture

### Frontend Architecture
- **React SPA**: Single-page application using React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, React Context for authentication
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom graffiti-themed design system
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Framework**: Flask REST API with Blueprint-based modular organization
- **Authentication**: JWT-based authentication using Flask-JWT-Extended
- **Password Security**: Bcrypt for password hashing
- **Route Organization**: Separated into modules (auth, products, orders, seller, admin)
- **Error Handling**: Centralized error handlers with consistent JSON responses

### Database Architecture
- **ORM**: SQLAlchemy with Flask-SQLAlchemy integration
- **Database**: PostgreSQL (configured for production)
- **Models**: User roles (buyer/seller/admin), Products, Orders, Cart, Seller profiles, Withdrawals, Reviews
- **Data Integrity**: Foreign key relationships and cascading deletes
- **UUID Primary Keys**: All models use UUID for enhanced security

### Authentication & Authorization
- **Token Strategy**: JWT access tokens with 24-hour expiration
- **Role-based Access**: Three user roles with different dashboard access
- **Password Security**: Bcrypt hashing with salt
- **Session Management**: Token stored in localStorage on frontend

### API Design
- **RESTful Endpoints**: Organized by resource type with consistent naming
- **Response Format**: Standardized JSON responses with error handling
- **CORS Configuration**: Configured for localhost development
- **Pagination**: Built-in pagination for product listings and order history
- **Filtering**: Advanced filtering by category, status, and search terms

### Order Management Features
- **Order Categorization**: Automatic categorization by date, value, and status
- **Multi-seller Support**: Orders automatically split by seller for individual fulfillment
- **Status Tracking**: Complete order lifecycle from pending to delivered
- **Admin Oversight**: Comprehensive admin view of all marketplace orders

### Seller Features
- **Product Management**: Complete CRUD operations for product catalog
- **Order Fulfillment**: Seller-specific order management and status updates
- **Withdrawal System**: Request withdrawals with 7% platform fee calculation
- **Verification System**: Admin approval process for seller accounts

### Payment Integration
- **PayPal Ready**: Infrastructure prepared for PayPal checkout integration
- **Credit/Debit Cards**: Support for card payments through PayPal gateway
- **Secure Processing**: Environment-based API key management

## External Dependencies

### Frontend Dependencies
- **UI Components**: Radix UI primitives (@radix-ui/*)
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **HTTP Client**: Built-in fetch API with custom wrapper
- **Form Validation**: Zod schema validation
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React icons

### Backend Dependencies
- **Web Framework**: Flask with CORS support
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended for JWT handling
- **Password Hashing**: bcrypt for secure password storage
- **Environment Config**: Python-dotenv for environment variables

### Database
- **Primary Database**: PostgreSQL (configured via DATABASE_URL)
- **Connection**: SQLAlchemy with connection pooling
- **Migration**: Manual schema updates through Flask-SQLAlchemy

### Development Tools
- **Build Tool**: Vite for frontend bundling and development server
- **TypeScript**: Full TypeScript support across client and shared code
- **Package Manager**: npm with package-lock.json for dependency locking
- **Development Server**: Vite dev server with hot module replacement

## Features Completed

### Core Marketplace
- ✅ User registration and authentication (buyer/seller/admin roles)
- ✅ Graffiti-themed responsive landing page with product slider
- ✅ Product catalog with search, filtering, and pagination
- ✅ Shopping cart functionality with real-time updates
- ✅ Multi-seller order processing and checkout

### Seller Management
- ✅ Seller verification and approval system
- ✅ Complete product management (add, edit, delete products)
- ✅ Order fulfillment and status tracking
- ✅ Withdrawal request system with 7% platform fee
- ✅ Seller dashboard with sales analytics

### Admin Features
- ✅ Comprehensive admin dashboard with platform metrics
- ✅ Order categorization and management system
- ✅ Seller approval and rejection workflow
- ✅ Withdrawal processing and transaction tracking
- ✅ User management and platform analytics

### Technical Infrastructure
- ✅ JWT-based authentication with role-based access control
- ✅ PostgreSQL database with proper relationships
- ✅ RESTful API with error handling and validation
- ✅ Responsive UI with graffiti-themed design system
- ✅ Real-time data updates with React Query