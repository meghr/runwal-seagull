# Runwal Seagull Society

A comprehensive society management portal built with Next.js, TypeScript, and PostgreSQL.

## Features

- **Multi-tier Access Control**: Public users, Registered users (Owners/Tenants), and Admin users
- **User Management**: Registration, approval workflow, profile management
- **Notice Board**: Society notices and announcements
- **Event Management**: Create events, manage registrations
- **Neighbor Directory**: Search and connect with residents
- **Vehicle Management**: Vehicle owner search system
- **Marketplace**: Buy & sell portal for residents
- **Complaint Management**: Track and resolve issues
- **Yellow Pages**: Service directory for trusted providers

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **File Upload**: Cloudinary
- **Email**: Resend
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in your environment variables in `.env.local`

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── layout/      # Layout components
│   └── forms/       # Form components
├── lib/             # Utility libraries
│   ├── auth/        # Authentication utilities
│   ├── db/          # Database utilities
│   ├── utils/       # Helper functions
│   └── validations/ # Input validation schemas
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
```

## Development

### Code Quality

- **Prettier**: Automatic code formatting
- **ESLint**: Code linting
- **TypeScript**: Type safety

Run formatting:
```bash
npm run format
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## License

Private - For Runwal Seagull Society use only
