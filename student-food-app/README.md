# 🍽️ Student Food Ordering WebApp

A complete full-stack web application for student food ordering with QR code receipts, built with modern technologies.

## 🌟 Features

### Student Features
- **User Registration & Authentication** - Secure signup with ID card upload
- **Browse Menu** - Filter by category, search, vegetarian options
- **Shopping Cart** - Add items, manage quantities, special instructions
- **Order Management** - Place orders, track status, view history
- **QR Code Receipts** - Unique, one-time use QR codes for pickup
- **Payment Integration** - UPI, GPay, and other digital payment methods
- **Profile Management** - Update personal information
- **Order History** - View past orders and receipts

### Admin Features
- **Dashboard** - Real-time analytics and order statistics
- **Order Management** - View all orders, update status, track deliveries
- **Menu Management** - Add, edit, delete menu items with images
- **Student Management** - Verify students, manage accounts
- **QR Scanner** - Validate QR codes, prevent duplicates
- **Analytics** - Sales reports, popular items, revenue tracking
- **Duplicate Detection** - Log and prevent duplicate QR scans

### Security Features
- **JWT Authentication** - Secure token-based authentication
- **File Upload Security** - Secure image upload with validation
- **One-time QR Codes** - Prevent receipt duplication
- **Input Validation** - Comprehensive data validation
- **CORS Protection** - Cross-origin request security

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **React Hook Form** - Form handling with validation
- **Heroicons** - Beautiful SVG icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **QRCode** - QR code generation
- **Bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Docker (optional)

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-food-app
   ```

2. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Option 2: Manual Setup

1. **Clone and setup backend**
   ```bash
   git clone <repository-url>
   cd student-food-app/backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

2. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7.0
   
   # Or use local MongoDB installation
   mongod
   ```

3. **Seed the database**
   ```bash
   npm run seed
   ```

4. **Start the backend**
   ```bash
   npm run dev
   ```

5. **Setup frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local if needed
   ```

6. **Start the frontend**
   ```bash
   npm run dev
   ```

## 📱 Usage

### For Students

1. **Register Account**
   - Visit http://localhost:3000
   - Click "Get Started" or "Register"
   - Fill in details and upload ID card
   - Wait for admin verification (optional)

2. **Browse and Order**
   - Login with your credentials
   - Browse menu items
   - Add items to cart
   - Proceed to checkout
   - Complete payment

3. **Get QR Receipt**
   - After payment, receive unique QR code
   - Show QR code at food counter
   - QR code works only once

### For Admins

1. **Login**
   - Visit http://localhost:3000/auth/login
   - Switch to "Admin" tab
   - Use demo credentials:
     - Email: admin@studentfood.com
     - Password: admin123

2. **Manage Orders**
   - View all orders in real-time
   - Update order status (preparing, ready, delivered)
   - Scan QR codes for order validation

3. **Manage Menu**
   - Add new menu items with images
   - Update prices and availability
   - Organize by categories

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-food-app
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@studentfood.com
ADMIN_PASSWORD=admin123
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Student Food Ordering App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/student/register` - Student registration
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/student/profile` - Get student profile
- `GET /api/auth/admin/profile` - Get admin profile

### Menu Endpoints
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Order Endpoints
- `POST /api/orders` - Create order
- `GET /api/orders/student` - Get student orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders/:id/payment` - Process payment
- `PUT /api/orders/:id/status` - Update order status (Admin)

### QR Code Endpoints
- `POST /api/qr/scan` - Scan QR code (Admin)
- `GET /api/qr/logs` - Get QR scan logs (Admin)
- `GET /api/qr/stats` - Get QR statistics (Admin)

## 🔒 Security Considerations

1. **Change default credentials** in production
2. **Use strong JWT secrets**
3. **Enable HTTPS** in production
4. **Implement rate limiting**
5. **Regular security updates**
6. **Database backups**

## 📦 Deployment

### Production Deployment

1. **Update environment variables** for production
2. **Use Docker Compose** for easy deployment
3. **Setup reverse proxy** (Nginx) for SSL
4. **Configure domain** and SSL certificates
5. **Setup monitoring** and logging

### Cloud Deployment Options
- **Vercel** (Frontend) + **Railway/Render** (Backend)
- **AWS ECS** with Docker containers
- **Google Cloud Run**
- **DigitalOcean App Platform**

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@studentfoodapp.com

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Multiple payment gateways
- [ ] Order scheduling
- [ ] Loyalty program
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)

## 🙏 Acknowledgments

- Icons by [Heroicons](https://heroicons.com/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)
- QR code generation by [qrcode](https://github.com/soldair/node-qrcode)

---

Made with ❤️ for students by students