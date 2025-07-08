# 🗳️ Digital Voting System

A comprehensive, secure, and real-time digital voting platform built with modern web technologies. This system enables organizations to conduct transparent and efficient elections with real-time results, comprehensive reporting, and robust security features.

![Home Page](./resources/Home.png)

## 🌟 Features

### 🔐 Core Security Features

- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Admin, Election Commissioner, and Voter roles
- **Email Verification**: Mandatory email verification for account activation
- **Secure Voting**: One-vote-per-election validation with voter verification

### 🏛️ Election Management

- **Multiple Election Types**: Support for various election formats
- **Candidate Management**: Complete candidate registration with image uploads
- **Eligible Voter Management**: Controlled voter registration and verification
- **Real-time Results**: Live election results and vote counting
- **Election Scheduling**: Automated election start/end times

### 💬 Real-time Communication

- **Live Chat System**: Real-time messaging during elections
- **Socket.io Integration**: Instant updates and notifications
- **Election Monitoring**: Live election status updates

### 📊 Reporting & Analytics

- **Comprehensive Reports**: Detailed election reports and analytics
- **Export Functionality**: Export voter lists and results
- **Audit Trail**: Complete voting history and system logs

## 🏗️ System Architecture

![System Diagram](./resources/System%20Diagram.png)

### Technology Stack

#### Backend

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Validation**: Joi/Zod validators

#### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Server Components + Actions
- **File Upload**: UploadThing
- **Real-time**: Socket.io client

## 📋 Use Cases

![Use Case Diagram](./resources/Use%20Case%20Diagram.png)

### User Roles

#### 🔑 System Administrator

- Manage user accounts and roles
- Configure system settings
- Monitor system performance
- Generate system-wide reports

#### 👨‍💼 Election Commissioner

- Create and manage elections
- Add/remove candidates
- Manage eligible voters
- Monitor election progress
- Generate election reports

#### 🗳️ Voter

- Register and verify account
- Participate in eligible elections
- View election results
- Report issues or concerns

## 🔄 System Flow

![Flow Diagram](./resources/Flow%20Diagram.png)

### Election Lifecycle

1. **Election Creation**: Commissioner creates election with candidates
2. **Voter Registration**: Eligible voters are added to the election
3. **Voting Period**: Voters cast their ballots securely
4. **Result Compilation**: Real-time vote counting and result generation
5. **Report Generation**: Comprehensive election reports

## 📊 Database Schema

![Schema Diagram](./resources/Schema%20Diagram.png)

### Entity Relationship Diagram

![Prisma ERD](./resources/prisma-erd.svg)

### Key Entities

- **Users**: System users with roles and authentication
- **Elections**: Election details, timing, and configuration
- **Candidates**: Election candidates with associated data
- **Votes**: Secure vote records with anonymization
- **Reports**: Election reports and analytics
- **Chat Messages**: Real-time communication logs

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher)
- PostgreSQL (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd voting_system
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database and email configuration

   # Run database migrations
   npx prisma migrate dev

   # Seed the database
   npx prisma db seed

   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install

   # Configure environment variables
   cp .env.local.example .env.local
   # Edit .env.local with your backend URL and API keys

   # Start the frontend application
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/voting_db"
JWT_SECRET="your-jwt-secret-key"
JWT_EXPIRES_IN="7d"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
PORT=5000
```

#### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL="http://localhost:5000"
NEXT_PUBLIC_SOCKET_URL="http://localhost:5000"
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"
```

## 📱 Application Screenshots

### Dashboard Overview

The main dashboard provides a comprehensive overview of all elections, user management, and system statistics.

### Election Management

Create, edit, and monitor elections with an intuitive interface for managing candidates and voters.

### Real-time Voting

Secure voting interface with real-time updates and immediate result compilation.

### Reports & Analytics

Detailed reporting system with export capabilities and comprehensive analytics.

## 🔧 Development

### Project Structure

```
voting_system/
├── backend/          # Node.js/Express backend
├── frontend/         # Next.js frontend
├── resources/        # Documentation assets
└── README.md        # This file
```

For detailed file structure, see [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

### Available Scripts

#### Backend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test
npm run test:watch
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend
npm run test
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**

   ```bash
   cd backend
   npm run build
   npm run start
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   npm run build
   npm run start
   ```

## 🛡️ Security Features

- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization and validation

## 📈 Performance

- **Optimized Database Queries**: Efficient database operations with indexing
- **Caching Strategy**: Redis caching for improved performance
- **CDN Integration**: Static asset delivery optimization
- **Real-time Updates**: Efficient WebSocket connections
- **Lazy Loading**: Frontend component optimization
  
Built with ❤️ using modern web technologies for secure, transparent, and efficient digital voting.
