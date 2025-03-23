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
