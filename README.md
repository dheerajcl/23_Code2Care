# Samarthanam Volunteer Management System

A modern volunteer management platform for Samarthanam Trust, built with React, TypeScript, Vite, and Supabase.

## Features

- Admin and volunteer user roles with separate dashboards
- Event management and volunteer registration
- Feedback collection and reporting
- Modern, accessible UI with dark mode support
- Responsive design for all devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **ORM**: Drizzle ORM for typesafe database access
- **API**: RESTful API with React Query
- **State Management**: React Context API + React Query
- **Deployment**: Docker & GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Supabase account (free tier works)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/samarthanam.git
   cd samarthanam
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy the `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=your_postgresql_connection_string
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Drizzle ORM Setup Guide

Drizzle ORM provides type-safe database access. Here's how to set it up and use it in this project:

### Initial Setup

1. Make sure the database connection is properly configured in your `.env` file:
   ```
   DATABASE_URL=postgres://postgres:password@db.csotbvprygtwbarusbwc.supabase.co:5432/postgres
   ```

2. Install Drizzle dependencies if not already installed:
   ```bash
   pnpm add drizzle-orm pg
   pnpm add -D drizzle-kit @types/pg
   ```

### Database Schema Management

The database schema is defined in the `src/db/schema/` directory:

- `users.ts` - Admin and volunteer user schemas
- `organization.ts` - Organization schema
- `events.ts` - Events, tasks, signups, and feedback schemas

### Working with Migrations

1. Generate a new migration after schema changes:
   ```bash
   npx drizzle-kit generate --name=your_migration_name
   ```

2. Push schema changes to the database:
   ```bash
   npx drizzle-kit push
   ```

3. Check migration status:
   ```bash
   npx drizzle-kit check
   ```

### Database Permissions

If you encounter permission issues, run the following SQL in the Supabase SQL Editor:

```sql
-- Grant schema usage permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant specific table permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Make sure future tables get the same permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public 
GRANT SELECT, INSERT, UPDATE ON TABLES TO authenticated;
```

### Using Drizzle in the Application

Drizzle is already configured in the application:

1. The database connection is set up in `src/db/index.ts`
2. Use the exported `db` object to perform database operations:

```typescript
import { db } from '@/db';
import { admins } from '@/db/schema/users';
import { eq } from 'drizzle-orm';

// Example: Query data
const admin = await db.query.admins.findFirst({
  where: eq(admins.email, 'admin@example.com')
});

// Example: Insert data
const [newAdmin] = await db.insert(admins).values({
  email: 'admin@example.com',
  password: hashedPassword,
  firstName: 'Admin',
  lastName: 'User'
}).returning();
```

## Code Organization

- `src/admin/` - Admin dashboard components and pages
- `src/components/` - Shared UI components
- `src/db/` - Database schema and configuration
- `src/lib/` - Utilities and context providers
- `src/pages/` - Main application pages
- `src/services/` - API and authentication services

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "feat: add your feature"
   ```

3. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request

## License

This project is licensed under the MIT License.

## Database

The application uses Supabase for database storage and authentication.

### Environment Variables

Make sure to set up these environment variables in your `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Structure

The database contains the following tables:

- `admin` - Admin user details
- `volunteer` - Volunteer user details  
- `event` - Event information
- `task` - Tasks associated with events
- `event_signup` - Volunteer signups for events
- `task_assignment` - Task assignments for volunteers
- `feedback` - Feedback from events
- `newsletter` - Newsletter subscribers

### Accessing Data

The Supabase client is available in the `src/lib/supabase.ts` file. Example usage:

```typescript
import { supabase } from '@/lib/supabase';

// Get admin by email
const { data: admin, error } = await supabase
  .from('admin')
  .select('*')
  .eq('email', email)
  .single();

// Create new admin
const { data: newAdmin, error } = await supabase
  .from('admin')
  .insert({
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    password: 'securepassword'
  })
  .select()
  .single();
```
