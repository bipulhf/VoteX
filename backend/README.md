# Voting System Backend

A comprehensive backend API for a democratic voting system built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## 🚀 Features

### Core Functionality

- **User Management**: Registration, authentication, email verification
- **Role-Based Access Control**: Admin and User roles with appropriate permissions
- **Election Types**: CRUD operations for different types of elections
- **Elections**: Complete election lifecycle management
- **Candidates**: Candidate management for elections
- **Voting**: Real-time voting with validation and fraud prevention
- **Election Commissioners**: Multi-commissioner approval system for results
- **Real-time Updates**: Socket.IO integration for live voting updates

### Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Email verification for all users
- Input validation with Zod schemas
- Comprehensive error handling

### Technical Features

- TypeScript for type safety
- Prisma ORM for database operations
- Express.js web framework
- Socket.IO for real-time features
- Nodemailer for email notifications
- Winston for logging
- Helmet for security headers
- CORS support for frontend integration

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- SMTP server for email functionality

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd voting-system/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   - Copy `env.example` to `.env`
   - Configure your environment variables:

   ```bash
   cp env.example .env
   ```

4. **Database Setup**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push database schema
   npm run db:push

   # Seed the database with initial data
   npm run db:seed
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Election Types Endpoints

- `GET /api/election-types` - Get all election types
- `GET /api/election-types/:id` - Get election type by ID
- `POST /api/election-types` - Create election type (Admin)
- `PUT /api/election-types/:id` - Update election type (Admin)
- `DELETE /api/election-types/:id` - Delete election type (Admin)

### Elections Endpoints

- `GET /api/elections` - Get all elections
- `GET /api/elections/:id` - Get election by ID
- `POST /api/elections` - Create election (Admin)
- `PUT /api/elections/:id` - Update election (Admin)
- `DELETE /api/elections/:id` - Delete election (Admin)
- `POST /api/elections/:id/candidates` - Add candidate (Admin)
- `PUT /api/elections/:electionId/candidates/:candidateId` - Update candidate (Admin)
- `DELETE /api/elections/:electionId/candidates/:candidateId` - Delete candidate (Admin)
- `POST /api/elections/:id/vote` - Cast vote (Authenticated users)
- `GET /api/elections/:id/results` - Get election results
- `POST /api/elections/:id/commissioners` - Add commissioner (Admin)
- `POST /api/elections/:id/approve-results` - Approve results (Commissioner)

### Users Endpoints

- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/:id/role` - Update user role (Admin)
- `DELETE /api/users/:id` - Deactivate user (Admin)

### Health Check

- `GET /health` - Health check endpoint

## 🔧 Database Schema

The application uses the following main entities:

- **User**: User accounts with roles and email verification
- **ElectionType**: Different types of elections (Presidential, Parliamentary, etc.)
- **Election**: Election instances with dates, status, and metadata
- **Candidate**: Candidates participating in elections
- **Vote**: Individual votes cast by users
- **ElectionCommissioner**: Commissioners who approve election results

## 🔐 Environment Variables

Required environment variables (see `env.example`):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/voting_system"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Server
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

## 🧪 Testing Credentials

After running the seed script, you can use these test accounts:

**Admin Account:**

- Email: `admin@votingsystem.com`
- Password: `admin123456`

**Test User Accounts:**

- Email: `john.doe@example.com` / Password: `user123456`
- Email: `jane.smith@example.com` / Password: `user123456`

## 🚀 Deployment

1. **Set up your production environment variables**
2. **Configure your PostgreSQL database**
3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```
4. **Build and start the application**
   ```bash
   npm run build
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a demonstration voting system. For production use, additional security measures, audit trails, and compliance features should be implemented based on your specific requirements and local regulations.
