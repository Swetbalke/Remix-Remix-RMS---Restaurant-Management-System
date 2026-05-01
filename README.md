# RMS Enterprise (Restaurant Management System)

A full-stack, real-time Restaurant Management System with features for Customers, Employees, Kitchen, and Admins.

## Features
- **Customer Menu & Ordering:** QR code table scanning, digital menu, cart, and live order tracking.
- **KDS (Kitchen Display System):** Real-time order updates using WebSockets, audible alerts, and state management.
- **POS (Point of Sale):** Employee interface to manage table orders, browse the menu, and confirm payments.
- **Admin Dashboard:** High-level metrics, revenue tracking, and order history.
- **Authentication:** Role-based access control (Admin, Manager, Employee, Customer).

## Tech Stack
- **Frontend:** React 19, Tailwind CSS v4, Zustand (state & cart), Socket.IO client, Framer Motion, Recharts.
- **Backend:** Node.js (Express), Socket.IO (WebSockets for real-time), Prisma (ORM), SQLite (default, database), Razorpay integration.
- **Tooling:** Vite, TypeScript.

## Getting Started Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup the Database & Seed**
   This will initialize the local SQLite database and populate it with initial menu items and a super admin.
   ```bash
   npm run setup
   ```
   *Default Admin login:* 
   - Email: `swetbalke2005@gmail.com`
   - Password: `admin123`

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:3000`.

## Production Build
```bash
npm run build
npm start
```
