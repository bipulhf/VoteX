# Voting System - Project File Structure

This document provides a comprehensive overview of the file structure for both the frontend and backend components of the voting system project.

## Backend Structure

```
backend/
├── .gitignore                     # Git ignore rules
├── README.md                      # Backend documentation
├── nodemon.json                   # Nodemon configuration
├── package.json                   # Node.js dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── tsconfig.json                  # TypeScript configuration
├── dist/                         # Compiled JavaScript output
├── node_modules/                 # Node.js dependencies
├── scripts/
│   └── setup.sh                  # Setup script for backend
├── prisma/
│   ├── schema.prisma             # Database schema definition
│   ├── seed.ts                   # Database seeding script
│   ├── seed.d.ts                 # TypeScript declarations for seeding
│   └── dbml/
│       └── schema.dbml           # Database markup language schema
└── src/
    ├── index.ts                  # Main application entry point
    ├── config/
    │   ├── database.ts           # Database configuration
    │   └── env.ts                # Environment variables configuration
    ├── middleware/
    │   ├── auth.ts               # Authentication middleware
    │   ├── errorHandler.ts       # Error handling middleware
    │   ├── socketAuth.ts         # Socket authentication middleware
    │   └── validation.ts         # Request validation middleware
    ├── routes/
    │   ├── auth.ts               # Authentication routes
    │   ├── chat.ts               # Chat functionality routes
    │   ├── elections.ts          # Election management routes
    │   ├── electionTypes.ts      # Election types routes
    │   ├── eligibleVoters.ts     # Eligible voters routes
    │   ├── reports.ts            # Reports routes
    │   └── users.ts              # User management routes
    ├── services/
    │   ├── authService.ts        # Authentication business logic
    │   ├── chatService.ts        # Chat functionality service
    │   ├── electionService.ts    # Election management service
    │   ├── electionTypeService.ts # Election types service
    │   ├── eligibleVoterService.ts # Eligible voters service
    │   ├── reportService.ts      # Reports service
    │   └── userService.ts        # User management service
    ├── types/
    │   └── index.ts              # TypeScript type definitions
    └── utils/
        ├── email.ts              # Email utility functions
        ├── jwt.ts                # JWT token utilities
        ├── password.ts           # Password hashing utilities
        ├── socketHandlers.ts     # Socket.io event handlers
        └── validators.ts         # Input validation utilities
```

## Frontend Structure

```
frontend/
├── .gitignore                    # Git ignore rules
├── README.md                     # Frontend documentation
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript declarations
├── package.json                  # Node.js dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── tsconfig.json                 # TypeScript configuration
├── components.json               # Shadcn/ui components configuration
├── postcss.config.mjs            # PostCSS configuration
├── .next/                        # Next.js build output
├── node_modules/                 # Node.js dependencies
├── public/                       # Static assets
│   ├── file.svg                  # File icon
│   ├── globe.svg                 # Globe icon
│   ├── next.svg                  # Next.js logo
│   ├── vercel.svg                # Vercel logo
│   └── window.svg                # Window icon
└── src/
    ├── actions/                  # Server actions
    │   ├── auth.action.ts        # Authentication actions
    │   ├── election.action.ts    # Election actions
    │   ├── electionType.action.ts # Election type actions
    │   ├── eligibleVoters.action.ts # Eligible voters actions
    │   ├── report.action.ts      # Report actions
    │   └── users.action.ts       # User actions
    ├── app/                      # Next.js app router
    │   ├── layout.tsx            # Root layout component
    │   ├── page.tsx              # Home page
    │   ├── loading.tsx           # Loading component
    │   ├── globals.css           # Global styles
    │   ├── favicon.ico           # Favicon
    │   ├── api/
    │   │   └── uploadthing/
    │   │       ├── core.ts       # UploadThing core configuration
    │   │       └── route.ts      # UploadThing API routes
    │   ├── (private)/            # Private routes (authenticated)
    │   │   └── dashboard/
    │   │       ├── layout.tsx    # Dashboard layout
    │   │       ├── page.tsx      # Dashboard home
    │   │       ├── loading.tsx   # Dashboard loading
    │   │       ├── elections/    # Elections management
    │   │       ├── election-types/ # Election types management
    │   │       ├── live-elections/ # Live elections view
    │   │       ├── my-elections-duty/ # User's election duties
    │   │       └── users/        # User management
    │   └── (public)/             # Public routes (unauthenticated)
    │       ├── login/
    │       │   └── page.tsx      # Login page
    │       ├── register/         # Registration pages
    │       ├── verify-email/     # Email verification
    │       ├── terms/            # Terms of service
    │       └── privacy/          # Privacy policy
    ├── components/               # Reusable components
    │   ├── login-form.tsx        # Login form component
    │   ├── register-form.tsx     # Registration form component
    │   ├── logout-button.tsx     # Logout button component
    │   ├── resend-verification-mail.tsx # Email verification component
    │   ├── theme-provider.tsx    # Theme provider component
    │   ├── chat/
    │   │   └── ChatRoom.tsx      # Chat room component
    │   ├── dashboard/            # Dashboard-specific components
    │   │   ├── sidebar.tsx       # Dashboard sidebar
    │   │   ├── election-form.tsx # Election creation/edit form
    │   │   ├── election-card.tsx # Election card display
    │   │   ├── election-details.tsx # Election details view
    │   │   ├── election-wrapper.tsx # Election wrapper component
    │   │   ├── elections-table.tsx # Elections table
    │   │   ├── single-election-wrapper.tsx # Single election view
    │   │   ├── election-commission-wrapper.tsx # Election commission view
    │   │   ├── live-elections-wrapper.tsx # Live elections display
    │   │   ├── voting-modal.tsx  # Voting interface modal
    │   │   ├── candidate-image-upload.tsx # Candidate image upload
    │   │   ├── report-form-modal.tsx # Report creation modal
    │   │   ├── report-view-modal.tsx # Report viewing modal
    │   │   ├── reports-table.tsx # Reports table
    │   │   ├── reports-modal.tsx # Reports modal
    │   │   ├── users-table.tsx   # Users management table
    │   │   ├── add-voters-modal.tsx # Add voters modal
    │   │   ├── view-voters-modal.tsx # View voters modal
    │   │   ├── export-users-button.tsx # Export users functionality
    │   │   └── election-types-table.tsx # Election types table
    │   └── ui/                   # Shadcn/ui components
    │       ├── alert.tsx         # Alert component
    │       ├── avatar.tsx        # Avatar component
    │       ├── badge.tsx         # Badge component
    │       ├── button.tsx        # Button component
    │       ├── calendar.tsx      # Calendar component
    │       ├── card.tsx          # Card component
    │       ├── checkbox.tsx      # Checkbox component
    │       ├── dialog.tsx        # Dialog component
    │       ├── dropdown-menu.tsx # Dropdown menu component
    │       ├── form.tsx          # Form component
    │       ├── input.tsx         # Input component
    │       ├── label.tsx         # Label component
    │       ├── popover.tsx       # Popover component
    │       ├── progress.tsx      # Progress component
    │       ├── radio-group.tsx   # Radio group component
    │       ├── scroll-area.tsx   # Scroll area component
    │       ├── select.tsx        # Select component
    │       ├── separator.tsx     # Separator component
    │       ├── sheet.tsx         # Sheet component
    │       ├── sidebar.tsx       # Sidebar component
    │       ├── skeleton.tsx      # Skeleton component
    │       ├── sonner.tsx        # Sonner toast component
    │       ├── switch.tsx        # Switch component
    │       ├── table.tsx         # Table component
    │       ├── textarea.tsx      # Textarea component
    │       ├── toaster.tsx       # Toaster component
    │       ├── tooltip.tsx       # Tooltip component
    │       └── use-toast.ts      # Toast hook
    ├── hooks/                    # Custom React hooks
    │   ├── use-auth.ts           # Authentication hook
    │   └── use-mobile.ts         # Mobile detection hook
    └── lib/                      # Utility libraries
        ├── chatApi.ts            # Chat API functions
        ├── data.ts               # Data utilities
        ├── socket.ts             # Socket.io client configuration
        ├── type.ts               # TypeScript type definitions
        ├── uploadthing.ts        # UploadThing configuration
        └── utils.ts              # General utility functions
```

## Key Features

### Backend Features:

- **Authentication & Authorization**: JWT-based auth with middleware
- **Real-time Communication**: Socket.io implementation for chat
- **Database Management**: Prisma ORM with PostgreSQL
- **Election Management**: Complete CRUD operations for elections
- **Reporting System**: Comprehensive reporting functionality
- **Email Services**: Email verification and notifications
- **Validation**: Input validation and error handling

### Frontend Features:

- **Next.js 14**: App router with server components
- **Authentication**: Secure login/registration system
- **Real-time Chat**: Socket.io integration for live communication
- **Dashboard**: Comprehensive admin and user dashboards
- **Elections**: Full election lifecycle management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **UI Components**: Shadcn/ui component library
- **File Uploads**: UploadThing integration for candidate images
- **Theming**: Dark/light mode support

## Technology Stack

### Backend:

- Node.js with TypeScript
- Express.js framework
- Prisma ORM
- PostgreSQL database
- Socket.io for real-time features
- JWT for authentication
- Nodemailer for emails

### Frontend:

- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS
- Shadcn/ui components
- Socket.io client
- UploadThing for file uploads
- Server Actions for data mutations

This structure represents a modern, scalable voting system with real-time capabilities, comprehensive user management, and a clean separation of concerns between frontend and backend components.
