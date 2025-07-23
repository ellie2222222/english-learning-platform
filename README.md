# English Learning Platform

A comprehensive English learning platform built with Node.js and Express.js, featuring AI-powered tutoring, interactive lessons, and flexible payment options for Vietnamese learners.

## 🌟 Features

### Core Learning Features

- **User Registration & Authentication** - Secure signup with email verification and Google OAuth
- **Course Management** - Browse, enroll, and progress through structured English courses
- **Interactive Learning Materials**:
  - Vocabulary builder with spaced repetition
  - Grammar lessons with detailed explanations
  - Practice exercises for skill reinforcement
- **Assessment System** - Comprehensive tests based on lesson exercises
- **Flashcard System** - Personal flashcard creation and management for vocabulary retention
- **AI English Tutor** - Interactive chat-based learning assistance using Hugging Face API
- **Performance Analytics** - AI-generated feedback covering strengths, weaknesses, and personalized recommendations
- **Educational Blog** - Simple blog reading feature with rich content

### Premium Features

- **Membership System** - Tiered access to premium courses and features
- **Advanced AI Feedback** - Detailed performance analysis and learning path optimization

### Content Management

- **File Upload System** - Flexible storage (local server or Cloudinary) via Multer

### Payment Integration

- **Multiple Payment Gateways**:
  - PayPal for international transactions
  - VNPay for Vietnamese users
- **Receipt Management** - Automated receipt generation and tracking
- **RabbitMQ Integration** - Reliable payment processing and notification system

## 🏗️ Architecture

The platform follows a robust N-layer architecture pattern:

```
Router → Middleware → DTO → Controller → Service → Repository → Model
```

### Architecture Layers

- **Router Layer** - API endpoint definitions and request routing
- **DTO Layer** - Data Transfer Objects for request/response validation
- **Controller Layer** - HTTP request handling and response formatting
- **Service Layer** - Business logic implementation
- **Repository Layer** - Data access abstraction
- **Model Layer** - Database schema and entity definitions
- **Middleware Layer** - Cross-cutting concerns and request processing

### Middleware Components

- **Authentication Middleware** - JWT-based user authentication
- **Authorization Middleware** - Role-based and resource-based access control
- **Membership Middleware** - Premium feature access validation
- **Error Logging Middleware** - Comprehensive error tracking and logging
- **Resource Access Middleware** - Fine-grained permission control

## 🛠️ Technology Stack

### Backend Framework

- **Node.js** with **Express.js**
- **TypeScript** for type safety and better development experience

### Database & ORM

- **MongoDB** with **Mongoose** ODM
- Type-safe model definitions with interfaces

### Authentication & Security

- **JWT (JSON Web Tokens)** for stateless authentication
- **Google OAuth** integration for social login
- **Bcrypt** for secure password hashing

### AI & External Services

- **Hugging Face API** for AI tutoring capabilities
- **Nodemailer** for email verification and notifications

### Payment Processing

- **PayPal SDK** for international payments
- **VNPay API** for Vietnamese payment processing
- **RabbitMQ** for reliable payment event handling

### File Management

- **Multer** for file upload handling
- **Cloudinary** integration for cloud storage
- Configurable storage modes (local/cloud)

### Content Management

- **HTML Sanitization** for secure user-generated content

### Documentation & Monitoring

- **Swagger** API documentation via JSDoc
- **Cron Jobs** for automated membership management
- Comprehensive error logging and monitoring

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Database (PostgreSQL/MySQL/MongoDB)
- Redis (for session management)
- RabbitMQ (for payment processing)

### Environment Configuration

Create a `.env` file with the following variables:

```env
# General
NODE_ENV=DEVELOPMENT
PRODUCTION_URL=
SERVER_URL=
FRONTEND_URL=
MOBILE_URL=
PORT=4000

# Database
DATABASE_URI=mongodb://localhost:27017/english_learning
DATABASE_NAME=english_learning

# Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d
RESET_TOKEN_SECRET=your_reset_token_secret
RESET_TOKEN_EXPIRATION=1h
COOKIES_EXPIRATION=7d

# Encryption
ENCRYPTION_SECRET=your_encryption_secret

# Session
SESSION_SECRET=your_session_secret

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_TOKEN_SECRET=your_email_token_secret
EMAIL_TOKEN_EXPIRATION=24h

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CLIENT_URL=your_google_redirect_url

# PayPal
PAYPAL_CLIENTID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# VNPay
VNP_TMNCODE=your_vnpay_tmn_code
VNP_HASHSECRET=your_vnpay_hash_secret

# File Storage
STORAGE_TYPE=cloudinary # or 'local'

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Hugging Face AI
HUGGINGFACE_API_KEY=your_huggingface_api_key
# Available models: Qwen/Qwen3-32B || deepseek-ai/DeepSeek-R1
HUGGINGFACE_AI_MODEL=Qwen/Qwen3-32B
# Available providers: cerebras || novita
HUGGINGFACE_AI_PROVIDER=cerebras
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/english-learning-platform.git
cd english-learning-platform

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Production Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📚 API Documentation

The API is fully documented using Swagger. After starting the server, visit:

```
http://localhost:4000/api-docs
```

## 📱 Related Repositories

This platform consists of multiple applications:

- **Backend API** (This repository) - Node.js/Express.js REST API
- **Frontend Web App** - [Next.js Frontend](https://github.com/PeterTLoc/english-learning-platform-fe.git)
- **Mobile App** - [React Native Mobile App](https://github.com/datTOK/WDP301_ELS_MobileApp.git)

## 🔧 Configuration

Set the `STORAGE_MODE` environment variable:

- `local` - Store files on local server
- `cloudinary` - Use Cloudinary for cloud storage

### Membership Management

The platform includes automated cron jobs for:

- Membership expiration notifications
- Automatic membership downgrades
- Payment reminder emails

### AI Tutor Configuration

Configure the Hugging Face API integration for:

- Natural language processing
- Conversation handling
- Performance analysis

## 🎓 Academic Project

This English Learning Platform is a comprehensive team project developed as part of our software engineering curriculum. The project demonstrates modern full-stack development practices, integrating multiple technologies and platforms to create a complete learning ecosystem.

### Project Scope

- **Team-based development** with distributed architecture
- **Multi-platform approach** (Web, Mobile, Backend API)
- **Real-world integrations** (Payment gateways, AI services, Cloud storage)
- **Production-ready features** (Authentication, Authorization, Monitoring)

### Learning Outcomes

- Advanced Node.js and Express.js development
- N-layer architecture implementation
- RESTful API design and documentation
- Payment gateway integration
- AI service integration
- Database design and optimization
- DevOps and deployment practices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Email: support@englishlearningplatform.com
- Documentation: [Wiki](https://docs.google.com/document/d/14cG9womLc4luhDB7pm8s2EDwUDZKgfT6VtsMvO3C5kw/edit?tab=t.0)

## 🚀 Roadmap

- [ ] Mobile application development
- [ ] Advanced AI conversation features
- [ ] Gamification system
- [ ] Social learning features
- [ ] Offline learning capabilities
- [ ] Advanced analytics dashboard

---

Built with ❤️ for English learners in Vietnam and beyond.
