# ProAce International Shopping Platform

## Overview

ProAce International Shopping is a marketplace platform with graffiti-inspired design that connects buyers with verified sellers. The platform features role-based access control (buyer, seller, admin), product catalog management, shopping cart functionality, order processing, and a seller withdrawal system. The application follows a modern full-stack architecture with React frontend and Flask backend.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Schema Migration**: Drizzle Kit for database migrations
- **Models**: User roles (buyer/seller/admin), Products, Orders, Cart, Seller profiles, Withdrawals, Reviews

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
- **Migration Tool**: Drizzle Kit for schema management

### Development Tools
- **Build Tool**: Vite for frontend bundling and development server
- **TypeScript**: Full TypeScript support across client and shared code
- **Package Manager**: npm with package-lock.json for dependency locking
- **Development Server**: Vite dev server with hot module replacement