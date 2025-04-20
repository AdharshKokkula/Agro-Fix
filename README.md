# AgroFix - Bulk Vegetable & Fruit Ordering Platform

<p align="center">
  <img src="https://drive.google.com/file/d/1KEi8l2WXFfcUQx00X3QBCJr4tipGQcL8/view?usp=drive_link" alt="AgroFix" width="250">
</p>

## Overview

AgroFix is a comprehensive web application designed to facilitate bulk vegetable and fruit ordering between farmers/suppliers and business buyers. The platform provides a robust, user-friendly shopping experience with role-based access control and persistent data storage.

This application streamlines the ordering process for wholesale produce, enabling businesses to place large orders directly from suppliers, track deliveries, and manage their procurement efficiently.

## Features

### User-Facing Features

- **Product Browsing**: Browse available vegetables and fruits with details on pricing, minimum order quantities, and availability
- **User Authentication**: Secure login and registration with JWT tokens
- **Shopping Cart**: Persistent cart functionality that synchronizes between devices when logged in
- **Bulk Ordering**: Place orders with customizable quantities for multiple products
- **Order Tracking**: Track order status through the fulfillment process
- **Order History**: View past orders and their statuses
- **Delivery Information**: Add and save delivery details for a streamlined checkout

### Admin Features

- **Product Management**: Add, edit, and remove products from the catalog
- **Order Management**: Process orders and update order statuses
- **User Management**: Manage user accounts and permissions
- **Inventory Control**: Update product availability and pricing

## Technology Stack

### Frontend
- React with TypeScript
- TanStack Query for data fetching
- Zustand for state management
- Zod for schema validation
- Shadcn UI components
- Tailwind CSS for styling
- Lucide React for icons
- React Hook Form for form handling

### Backend
- Express.js server
- Drizzle ORM for database operations
- PostgreSQL database
- JWT authentication
- RESTful API architecture

### Development Tools
- Vite for frontend building and HMR
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/agrofix.git
   cd agrofix
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/agrofix
   SESSION_SECRET=your_session_secret
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser and navigate to `http://localhost:5000`

### Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## Project Structure

```
├── client/                  # Frontend source code
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── store/           # State management
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Entry point
├── server/                  # Backend source code
│   ├── auth.ts              # Authentication logic
│   ├── db.ts                # Database connection
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Data storage interface
│   └── vite.ts              # Vite configuration for backend
├── shared/                  # Shared code between frontend and backend
│   └── schema.ts            # Database schema definitions
├── scripts/                 # Utility scripts
├── drizzle/                 # Database migrations
├── package.json             # Project metadata and dependencies
└── README.md                # Project documentation
```

## Key Features Implementation

### Authentication System

AgroFix implements a secure authentication system using JWT tokens with passport.js:

- **User Registration**: New users can register with username, password, and profile details
- **Login/Logout**: Secure session management
- **Role-Based Access**: Different permissions for regular users and admins
- **Protected Routes**: Certain routes are only accessible to authenticated users or admins

### Product Catalog

The product catalog is designed for optimal browsing and selection:

- **Categorization**: Products organized by categories (vegetables, fruits, etc.)
- **Search & Filter**: Find products quickly with search and filter options
- **Detailed Information**: Each product includes comprehensive details (price, availability, minimum order quantity)
- **Images**: Visual representation of products

### Cart Management

The cart system is robust and user-friendly:

- **Persistent Storage**: Cart data persists across sessions using local storage
- **Server Synchronization**: Cart syncs with server when user is logged in
- **Quantity Adjustment**: Easily adjust quantities of items in cart
- **Price Calculation**: Real-time price calculations and summaries

### Order Placement

The order placement process is streamlined for efficiency:

- **Multi-step Form**: Step-by-step order placement with validation
- **Delivery Information**: Delivery address and special instructions
- **Order Summary**: Clear summary of items, quantities, and total cost
- **Order Confirmation**: Email confirmation after order placement

### Order Tracking

Order tracking provides visibility into the fulfillment process:

- **Order Status**: Real-time status updates
- **Order Timeline**: Visual representation of order progress
- **Delivery Estimates**: Expected delivery dates
- **Order Details**: Complete order information

## Data Models

### User
- id: number (primary key)
- username: string (unique)
- password: string (hashed)
- isAdmin: boolean
- createdAt: datetime

### Product
- id: number (primary key)
- name: string
- category: string
- description: text (optional)
- price: number (in cents)
- minOrderQuantity: number
- inStock: boolean
- imageUrl: string (optional)

### Order
- id: number (primary key)
- userId: number (foreign key, nullable)
- orderNumber: string (unique)
- buyerName: string
- businessName: string (optional)
- email: string
- phone: string
- deliveryAddress: string
- city: string
- state: string
- pincode: string
- deliveryInstructions: text (optional)
- preferredDeliveryDate: date
- status: string
- totalAmount: number (in cents)
- items: json
- createdAt: datetime

### Cart
- id: number (primary key)
- userId: number (foreign key)
- items: json
- updatedAt: datetime

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Log in an existing user
- POST `/api/logout` - Log out the current user
- GET `/api/user` - Get the current user's information

### Products
- GET `/api/products` - Get all products
- GET `/api/products/:id` - Get a specific product
- POST `/api/products` - Create a new product (admin only)
- PUT `/api/products/:id` - Update a product (admin only)
- DELETE `/api/products/:id` - Delete a product (admin only)

### Orders
- GET `/api/orders` - Get all orders (filtered by user or admin)
- GET `/api/orders/:id` - Get a specific order
- POST `/api/orders` - Create a new order
- PUT `/api/orders/:id/status` - Update order status (admin only)
- GET `/api/track/:orderNumber` - Track an order by order number

### Cart
- GET `/api/cart` - Get the current user's cart
- POST `/api/cart` - Update the current user's cart

## Deployment

### Deploying to Vercel

1. Make sure you have the Vercel CLI installed:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. Set up environment variables in the Vercel dashboard:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption

5. For production deployments:
   ```bash
   vercel --prod
   ```

### Database Setup for Vercel Deployment

For production deployment, it's recommended to use a managed PostgreSQL service like:

- [Neon](https://neon.tech/) (recommended)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)
- [AWS RDS](https://aws.amazon.com/rds/)
- [DigitalOcean Managed Databases](https://www.digitalocean.com/products/managed-databases)

## Future Enhancements

- **Mobile Application**: Develop companion mobile apps for iOS and Android
- **Payment Gateway Integration**: Add support for online payments
- **Advanced Analytics**: Provide insights for admins on sales and user behavior
- **Supplier Portal**: Allow suppliers to manage their own product listings
- **Subscription Model**: Enable recurring orders for regular customers
- **Localization**: Support for multiple languages and currencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database operations
- [TanStack Query](https://tanstack.com/query/latest) for data fetching
- [Zod](https://zod.dev/) for schema validation
- [React Hook Form](https://react-hook-form.com/) for form handling
