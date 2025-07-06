# Tasky Server

A robust backend server for the Tasky application built with Node.js, Express, and modern security practices.

## 🚀 Features

- **Authentication & Authorization**: JWT-based user with Passport.js
- **Security**: Helmet, CORS, rate limiting, and secure sessions
- **Performance**: Compression, efficient middleware stack
- **Development**: Hot reload with nodemon, comprehensive logging
- **Validation**: Input validation with express-validator
- **Production Ready**: Environment-based configuration, graceful shutdown

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Tasky-Server.git
cd Tasky-Server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

## 📁 Project Structure

```
├── server.js              # Main server file
├── config/
│   └── passport.js         # Passport authentication config
├── routes/
│   └── user.js            # Authentication routes
├── middleware/
│   └── User.js            # Authentication middleware
├── package.json
├── .env                   # Environment variables
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes globally
- **Authentication Rate Limiting**: 5 login attempts per 15 minutes
- **Password Hashing**: bcrypt with salt rounds
- **Secure Headers**: Helmet.js protection
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation

## 📊 API Endpoints

### Health Check
- `GET /health` - Server health status

# Tasky Server API Routes

## 🔐 Authentication
- `POST /api/auth/user/register` - User registration
- `POST /api/auth/user/login` - User login
- `GET /api/auth/user/profile` - Get current user profile
- `PUT /api/auth/user/update-user` - Update user profile
- `PUT /api/auth/user/update-password` - Update user password
- `DELETE /api/auth/user/delete-user` - Delete user account
- `POST /api/auth/user/logout` - User logout

## 📋 Task Management
- `POST /api/tasks/newtask` - Create new task
- `GET /api/tasks/get-tasks` - Get all user tasks
- `GET /api/tasks/get-task/:id` - Get single task by ID
- `PUT /api/tasks/update-task/:id` - Update task
- `PATCH /api/tasks/update-status/:id` - Update task status only
- `DELETE /api/tasks/delete-task/:id` - Delete task

## 📧 Email Services
- `POST /api/email/send-verification` - Send email verification code
- `POST /api/email/verify-email` - Verify email with code
- `POST /api/email/send-password-reset` - Send password reset email
- `POST /api/email/send-email` - Send generic email

## 🔧 System


### General
- `GET /api` - API information

## 🧪 Testing

```bash
npm test
```

## 📦 Production Deployment

1. Set environment variables:
```bash
NODE_ENV=production
PORT=8080
# Update all secrets and database URLs
```

2. Start the server:
```bash
npm start
```

## 🔄 Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

## 📝 API Documentation

### Authentication Flow

1. **Register**: `POST /api/user/register`
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

2. **Login**: `POST /api/user/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

3. **Access Protected Routes**: Include JWT token in Authorization header
```bash
Authorization: Bearer <your-jwt-token>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Mohammed Ahmed 'MohammedME'

## 🐛 Issues

If you encounter any issues, please file them [here](https://github.com/Mohammed-Ahmed-ME/Tasky-Server/issues).

## 🔮 Roadmap

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Task management endpoints
- [ ] User profile management
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Real-time updates with WebSockets
- [ ] API documentation with Swagger
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline