# 🛒 E-Commerce Platform

A modern, full-stack e-commerce application built with Node.js, Express, MongoDB, and EJS templating engine. Features a responsive design, secure authentication, and comprehensive admin panel.

## ✨ Features

### 🛍️ **Shopping Experience**

- **Product Catalog** - Browse products with pagination
- **Product Details** - Detailed product pages with images
- **Shopping Cart** - Add/remove items with persistent storage
- **Checkout Process** - Secure order placement
- **Order History** - Track past orders with timestamps
- **Responsive Design** - Mobile-first approach for all devices

### 🔐 **Authentication & Security**

- **User Registration & Login** - Secure authentication system
- **Password Reset** - Email-based password recovery
- **CSRF Protection** - Cross-site request forgery prevention
- **Session Management** - Secure user sessions
- **Content Security Policy** - XSS and injection protection

### 👨‍💼 **Admin Panel**

- **Product Management** - Add, edit, and delete products
- **Image Upload** - AWS S3 integration for product images
- **Order Management** - View and manage customer orders
- **User Management** - Admin-only access controls
- **Invoice Generation** - PDF invoices for orders

### 🎨 **Modern UI/UX**

- **Responsive Design** - Works perfectly on all devices
- **Beautiful Animations** - Smooth transitions and hover effects
- **Modern Styling** - Clean, professional appearance
- **Touch-Friendly** - Optimized for mobile interactions
- **Accessibility** - Proper contrast and keyboard navigation

### 🚀 **Technical Features**

- **MongoDB Integration** - NoSQL database with Mongoose ODM
- **File Upload** - AWS S3 cloud storage for images
- **Pagination** - Efficient product browsing
- **Search & Filter** - Find products quickly
- **Error Handling** - Comprehensive error management
- **Logging** - Request logging and monitoring

## 🛠️ Tech Stack

### **Backend**

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Multer** - File upload handling
- **AWS SDK** - S3 integration

### **Frontend**

- **EJS** - Server-side templating
- **CSS3** - Modern styling with Flexbox/Grid
- **JavaScript** - Interactive functionality
- **Responsive Design** - Mobile-first approach

### **Security & Middleware**

- **bcryptjs** - Password hashing
- **express-session** - Session management
- **csurf** - CSRF protection
- **helmet** - Security headers
- **connect-mongodb-session** - Session storage

## 📦 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- AWS S3 bucket (for image storage)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-platform.git
cd ecommerce-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGO_USER=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_DEFAULT_DATABASE=your_database_name

# Session
SESSION_SECRET=your_session_secret_key

# AWS S3
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=your_s3_bucket_name
AWS_BUCKET_REGION=your_s3_bucket_region

# Server
PORT=3000
```

### 4. Database Setup

- Set up MongoDB (local or MongoDB Atlas)
- Update the connection string in `.env`
- The application will automatically create collections

### 5. AWS S3 Setup

- Create an S3 bucket for image storage
- Configure CORS settings for your bucket
- Update AWS credentials in `.env`

### 6. Start the Application

```bash
# Development mode
npm start

# Production mode
npm run start:prod
```

The application will be available at `http://localhost:3000`

## 🚀 Usage

### **For Customers**

1. **Browse Products** - Visit the homepage to see featured products
2. **View Details** - Click on any product for detailed information
3. **Add to Cart** - Add products to your shopping cart
4. **Checkout** - Complete your purchase securely
5. **Track Orders** - View order history and download invoices

### **For Administrators**

1. **Login** - Access admin panel with admin credentials
2. **Manage Products** - Add, edit, or remove products
3. **Upload Images** - Use the beautiful file upload interface
4. **View Orders** - Monitor customer orders and generate invoices
5. **User Management** - Manage user accounts and permissions

## 📁 Project Structure

```
ecommerce-platform/
├── controllers/          # Route controllers
│   ├── admin.js         # Admin functionality
│   ├── auth.js          # Authentication
│   ├── error.js         # Error handling
│   └── shop.js          # Shopping features
├── middleware/          # Custom middleware
│   └── is-auth.js       # Authentication middleware
├── models/              # Database models
│   ├── order.js         # Order schema
│   ├── product.js       # Product schema
│   └── user.js          # User schema
├── routes/              # Route definitions
│   ├── admin.js         # Admin routes
│   ├── auth.js          # Auth routes
│   └── shop.js          # Shop routes
├── views/               # EJS templates
│   ├── admin/           # Admin views
│   ├── auth/            # Authentication views
│   ├── includes/        # Shared components
│   └── shop/            # Shopping views
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   └── js/              # JavaScript files
├── util/                # Utility functions
├── app.js               # Main application file
└── package.json         # Dependencies and scripts
```

## 🔧 Configuration

### **Database Configuration**

The application uses MongoDB with Mongoose ODM. Update the connection string in your `.env` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### **AWS S3 Configuration**

Configure your S3 bucket for image uploads:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### **CORS Configuration**

Add CORS settings to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## 🚀 Deployment

### **Deploy to Fly.io**

The project includes a `fly.toml` configuration file for easy deployment to Fly.io:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly
fly auth login

# Deploy the application
fly deploy
```

### **Environment Variables for Production**

Set these environment variables in your production environment:

```bash
fly secrets set MONGO_USER=your_username
fly secrets set MONGO_PASSWORD=your_password
fly secrets set SESSION_SECRET=your_secret
fly secrets set AWS_ACCESS_KEY=your_key
fly secrets set AWS_SECRET_KEY=your_secret
```

## 🧪 Testing

### **Manual Testing**

1. **User Registration** - Test account creation
2. **Product Management** - Add/edit/delete products
3. **Shopping Cart** - Add/remove items
4. **Checkout Process** - Complete orders
5. **Admin Panel** - Test admin functionality

### **Security Testing**

- CSRF protection verification
- Authentication middleware testing
- Input validation testing
- File upload security

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Express.js** - Web framework
- **MongoDB** - Database
- **AWS S3** - File storage
- **EJS** - Templating engine
- **Bootstrap** - CSS framework inspiration

## 📞 Support

If you have any questions or need help with the project:

- **Issues** - Create an issue on GitHub
- **Email** - Contact the maintainer
- **Documentation** - Check the inline code comments

---

**Built with ❤️ using Node.js and Express**
